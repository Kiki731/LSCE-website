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

/** Always produce exactly `count` emails, padding with `fallback` if needed. */
function normaliseEmails(raw: unknown, count: number, fallback: string): string[] {
  const list = Array.isArray(raw) ? (raw as string[]).filter(Boolean) : []
  return Array.from({ length: count }, (_, i) => list[i] ?? fallback)
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
      breakouts,
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
      const { data: seats } = await db
        .from('attendees')
        .select('id, email, ticket_code')
        .eq('order_id', existing.id)
        .order('created_at', { ascending: true })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seatList = (seats ?? []) as any[]

      // Compute exactly `quantity` emails — pad with buyer email if not enough provided
      const seatEmails = normaliseEmails(attendee_emails, quantity, buyer_email)

      // Update each seat where we have a better email
      await Promise.allSettled(
        seatList.map((att, i) => {
          const newEmail = seatEmails[i]
          const isBuyerSeat = (newEmail ?? att.email).toLowerCase() === buyer_email.toLowerCase()
          const updates: Record<string, unknown> = {}
          if (newEmail && newEmail.toLowerCase() !== att.email.toLowerCase()) updates.email = newEmail
          // Pre-fill buyer name for their own seat
          if (isBuyerSeat && !att.name) updates.name = buyer_name
          if (Object.keys(updates).length === 0) return
          return db.from('attendees').update(updates).eq('id', att.id)
            .then(({ error }: { error: unknown }) => {
              if (error) console.error('[create-order] seat update failed:', att.id, error)
            })
        })
      )

      // Merge ticket codes with correct emails
      const finalSeats = seatList.map((att, i) => ({
        ticket_code: att.ticket_code as string,
        email:       seatEmails[i] ?? (att.email as string),
      }))

      const ticketCodes = finalSeats.map(s => s.ticket_code)

      // Send guest claim emails for non-buyer seats
      const guestSeats = finalSeats.filter(
        s => s.email.toLowerCase() !== buyer_email.toLowerCase()
      )

      console.log(`[create-order] duplicate path — ${guestSeats.length} guest seat(s) from ${finalSeats.length} total`)

      await Promise.allSettled(
        guestSeats.map(s =>
          sendGuestTicketClaim({
            guestEmail: s.email,
            buyerName:  buyer_name,
            ticketType: ticket_type as TicketTier,
            ticketCode: s.ticket_code,
          }).catch(err => console.error('[create-order] guest email failed for', s.email, err))
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

    // ── Fresh order ──────────────────────────────────────────────────────────
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

    // Always create exactly `quantity` attendee rows, padding with buyer email
    const seatEmails = normaliseEmails(attendee_emails, quantity, buyer_email)
    const breakoutList = Array.isArray(breakouts) ? breakouts : []
    const attendeeRows = seatEmails.map(email => ({
      order_id: order.id,
      email,
      name: email.toLowerCase() === buyer_email.toLowerCase() ? buyer_name : null,
      breakouts: breakoutList,
    }))

    console.log(`[create-order] fresh — inserting ${attendeeRows.length} attendee(s):`, seatEmails)

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

    console.log(`[create-order] fresh — ${guestAttendees.length} guest seat(s) from ${ticketCodes.length} total`)

    await Promise.allSettled(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guestAttendees.map((a: any) =>
        sendGuestTicketClaim({
          guestEmail: a.email,
          buyerName:  buyer_name,
          ticketType: ticket_type as TicketTier,
          ticketCode: a.ticket_code,
        }).catch(err => console.error('[create-order] guest email failed for', a.email, err))
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
      breakouts:   breakoutList,
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
