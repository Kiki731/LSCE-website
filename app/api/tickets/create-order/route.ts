import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTicketConfirmation, sendGuestTicketClaim } from '@/lib/email'
import { TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

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

    // ── Validate ticket type & compute expected amounts server-side ────────────
    const ticket = TICKET_TYPES[ticket_type as TicketTier]
    if (!ticket) {
      return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getAdminClient() as any

    const expectedSubtotal = ticket.price * quantity
    let expectedTotal = expectedSubtotal
    let verifiedDiscountAmount = 0
    let couponWasValid = false

    if (discount_code) {
      const { data: coupon } = await db
        .from('coupons')
        .select('discount_pct, is_active, max_uses, times_used, valid_from, valid_until, ticket_types')
        .eq('code', String(discount_code).toUpperCase().trim())
        .single()

      const now = new Date()
      couponWasValid = !!(coupon &&
        coupon.is_active &&
        (!coupon.max_uses || coupon.times_used < coupon.max_uses) &&
        (!coupon.valid_from  || new Date(coupon.valid_from)  <= now) &&
        (!coupon.valid_until || new Date(coupon.valid_until) >= now) &&
        (!coupon.ticket_types?.length || coupon.ticket_types.includes(ticket_type)))

      if (couponWasValid) {
        verifiedDiscountAmount = Math.round(expectedSubtotal * (coupon.discount_pct / 100))
        expectedTotal = expectedSubtotal - verifiedDiscountAmount
      }
    }

    // ── Payment verification ───────────────────────────────────────────────────
    // Zero total without a valid 100% coupon — reject outright
    if (expectedTotal === 0 && !couponWasValid) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    if (expectedTotal > 0) {
      const paystackRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(paystack_reference)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        },
      )
      const paystackJson = await paystackRes.json()

      if (!paystackJson.status || paystackJson.data?.status !== 'success') {
        console.error('[create-order] Paystack verification failed:', JSON.stringify(paystackJson))
        return NextResponse.json({ error: 'Payment not verified' }, { status: 400 })
      }

      const paidNaira = (paystackJson.data.amount as number) / 100
      if (Math.abs(paidNaira - expectedTotal) > 1) {
        console.error('[create-order] Amount mismatch — expected', expectedTotal, 'paid', paidNaira)
        return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
      }
    }

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
        totalAmount: expectedTotal,
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
        unit_price:      ticket.price,          // server-side price, never trust client
        discount_code:   couponWasValid ? String(discount_code).toUpperCase().trim() : null,
        discount_amount: verifiedDiscountAmount, // server-computed
        total_amount:    expectedTotal,          // server-computed
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
      totalAmount: expectedTotal,
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
      totalAmount: expectedTotal,
      ticketCodes,
    })
  } catch (err) {
    console.error('[create-order] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
