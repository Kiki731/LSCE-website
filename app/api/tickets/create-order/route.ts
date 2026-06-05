import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTicketConfirmation, sendGuestTicketClaim } from '@/lib/email'
import type { TicketTier } from '@/lib/ticket-config'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      buyer_name,
      buyer_email,
      buyer_phone,
      ticket_type,
      quantity,
      unit_price,
      discount_code,
      discount_amount,
      total_amount,
      paystack_reference,
      attendee_emails,
    } = body

    if (!buyer_name || !buyer_email || !ticket_type || !quantity || !paystack_reference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getAdminClient() as any

    // ── Idempotency: order may already exist if webhook fired first ────────────
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('paystack_reference', paystack_reference)
      .single()

    if (existing) {
      // Webhook beat us here. The attendees were created with buyer email as
      // placeholder. If the checkout provided real attendee emails, update them now.
      const provided: string[] = attendee_emails ?? []

      const { data: existingAttendees } = await supabase
        .from('attendees')
        .select('id, email, ticket_code')
        .eq('order_id', existing.id)
        .order('created_at', { ascending: true })

      // Update each attendee row with the corresponding provided email (by seat index)
      if (existingAttendees?.length && provided.length) {
        await Promise.allSettled(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (existingAttendees as any[]).map((att: any, i: number) => {
            const newEmail = provided[i]
            if (newEmail && newEmail.toLowerCase() !== att.email.toLowerCase()) {
              return supabase
                .from('attendees')
                .update({ email: newEmail })
                .eq('id', att.id)
            }
          })
        )
      }

      // Re-fetch updated attendees to get final ticket codes + emails
      const { data: finalAttendees } = await supabase
        .from('attendees')
        .select('ticket_code, email')
        .eq('order_id', existing.id)
        .order('created_at', { ascending: true })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ticketCodes: string[] = (finalAttendees ?? []).map((a: any) => a.ticket_code as string)

      // Send guest claim emails for seats not belonging to the buyer
      if (finalAttendees?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const guestAttendees = (finalAttendees as any[]).filter(
          (a: any) => a.email.toLowerCase() !== buyer_email.toLowerCase()
        )
        await Promise.allSettled(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          guestAttendees.map((a: any) =>
            sendGuestTicketClaim({
              guestEmail: a.email,
              buyerName:  buyer_name,
              ticketType: ticket_type as TicketTier,
              ticketCode: a.ticket_code,
            })
          )
        )
      }

      return NextResponse.json({
        orderId:     existing.id,
        duplicate:   true,
        buyerName:   buyer_name,
        buyerEmail:  buyer_email,
        ticketType:  ticket_type,
        quantity,
        totalAmount: total_amount,
        ticketCodes,
      })
    }

    // ── Fresh order ────────────────────────────────────────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        buyer_name,
        buyer_email,
        buyer_phone:     buyer_phone || null,
        ticket_type,
        quantity,
        unit_price,
        discount_code:   discount_code || null,
        discount_amount: discount_amount || 0,
        total_amount,
        paystack_reference,
        payment_status: 'completed',
      })
      .select('id')
      .single()

    if (orderErr) {
      console.error('Order insert error:', orderErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // One attendee row per seat — use provided emails or fall back to buyer's
    const emails: string[] = attendee_emails?.length
      ? attendee_emails
      : Array(quantity).fill(buyer_email)

    const attendeeRows = emails.map((email: string) => ({ order_id: order.id, email }))

    const { data: insertedAttendees, error: attendeeErr } = await supabase
      .from('attendees')
      .insert(attendeeRows)
      .select('ticket_code, email')

    if (attendeeErr) {
      console.error('Attendee insert error:', attendeeErr)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ticketCodes: string[] = (insertedAttendees ?? []).map((a: any) => a.ticket_code as string)

    // Send guest claim emails to non-buyer attendees
    if (insertedAttendees?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const guestAttendees = (insertedAttendees as any[]).filter(
        (a: any) => a.email.toLowerCase() !== buyer_email.toLowerCase()
      )
      await Promise.allSettled(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        guestAttendees.map((a: any) =>
          sendGuestTicketClaim({
            guestEmail: a.email,
            buyerName:  buyer_name,
            ticketType: ticket_type as TicketTier,
            ticketCode: a.ticket_code,
          })
        )
      )
    }

    // Send buyer confirmation email
    await sendTicketConfirmation({
      orderId:     order.id,
      buyerName:   buyer_name,
      buyerEmail:  buyer_email,
      ticketType:  ticket_type as TicketTier,
      quantity,
      totalAmount: total_amount,
      paystackRef: paystack_reference,
      ticketCodes,
    })

    return NextResponse.json({
      orderId:     order.id,
      success:     true,
      buyerName:   buyer_name,
      buyerEmail:  buyer_email,
      ticketType:  ticket_type,
      quantity,
      totalAmount: total_amount,
      ticketCodes,
    })
  } catch (err) {
    console.error('create-order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
