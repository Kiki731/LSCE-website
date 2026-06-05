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
    const db = getAdminClient() as any

    // ── Idempotency: order may already exist if webhook fired first ────────────
    const { data: existing } = await db
      .from('orders')
      .select('id')
      .eq('paystack_reference', paystack_reference)
      .single()

    if (existing) {
      // Webhook beat us here — attendees were created with buyer email as placeholder.
      // Fetch by seat order, update each with the real email, then send claim emails.
      const provided: string[] = Array.isArray(attendee_emails) ? attendee_emails : []

      const { data: seats } = await db
        .from('attendees')
        .select('id, email, ticket_code')
        .eq('order_id', existing.id)
        .order('created_at', { ascending: true })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seatList = (seats ?? []) as any[]

      // Update seat emails where a better email was provided
      await Promise.allSettled(
        seatList.map((att, i) => {
          const newEmail = provided[i]
          if (newEmail && newEmail.toLowerCase() !== att.email.toLowerCase()) {
            return db.from('attendees').update({ email: newEmail }).eq('id', att.id)
          }
        })
      )

      // Build final list using provided emails (don't re-fetch — avoids stale read race)
      const finalSeats = seatList.map((att, i) => ({
        ticket_code: att.ticket_code as string,
        email:       (provided[i] ?? att.email) as string,
      }))

      const ticketCodes = finalSeats.map(s => s.ticket_code)

      // Send guest claim emails directly from the provided list
      const guestSeats = finalSeats.filter(
        s => s.email.toLowerCase() !== buyer_email.toLowerCase()
      )

      console.log(`[create-order] duplicate — sending ${guestSeats.length} guest claim email(s)`)

      await Promise.allSettled(
        guestSeats.map(s =>
          sendGuestTicketClaim({
            guestEmail: s.email,
            buyerName:  buyer_name,
            ticketType: ticket_type as TicketTier,
            ticketCode: s.ticket_code,
          }).catch(err => console.error('[create-order] guest claim email failed:', s.email, err))
        )
      )

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

    // ── Fresh order ─────────────────────────────────────────────────────────
    const { data: order, error: orderErr } = await db
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
      console.error('[create-order] order insert error:', orderErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // One attendee row per seat
    const emails: string[] = Array.isArray(attendee_emails) && attendee_emails.length
      ? attendee_emails
      : Array(quantity).fill(buyer_email)

    const attendeeRows = emails.map((email: string) => ({ order_id: order.id, email }))

    const { data: insertedAttendees, error: attendeeErr } = await db
      .from('attendees')
      .insert(attendeeRows)
      .select('ticket_code, email')

    if (attendeeErr) {
      console.error('[create-order] attendee insert error:', attendeeErr)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ticketCodes: string[] = (insertedAttendees ?? []).map((a: any) => a.ticket_code as string)

    // Guest claim emails for non-buyer seats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guestAttendees = (insertedAttendees ?? [] as any[]).filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => a.email.toLowerCase() !== buyer_email.toLowerCase()
    )

    console.log(`[create-order] fresh — sending ${guestAttendees.length} guest claim email(s)`)

    await Promise.allSettled(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guestAttendees.map((a: any) =>
        sendGuestTicketClaim({
          guestEmail: a.email,
          buyerName:  buyer_name,
          ticketType: ticket_type as TicketTier,
          ticketCode: a.ticket_code,
        }).catch(err => console.error('[create-order] guest claim email failed:', a.email, err))
      )
    )

    // Buyer confirmation
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
    console.error('[create-order] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
