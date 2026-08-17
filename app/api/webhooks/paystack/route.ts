import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'
import { sendTicketConfirmation, sendGuestTicketClaim } from '@/lib/email'
import { TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

/**
 * Paystack Webhook Handler
 *
 * Paystack POSTs signed events here server-to-server whenever a payment
 * changes state — independent of the browser. This is our safety net:
 * if the browser crashes after payment but before our JS callback fires,
 * this endpoint still saves the order and sends the confirmation email.
 *
 * Set this URL in your Paystack dashboard → Settings → API Keys & Webhooks:
 *   Test:       https://xxxx.ngrok.io/api/webhooks/paystack
 *   Production: https://thelscexpo.com/api/webhooks/paystack
 *
 * Signature verification: Paystack sends a SHA-512 HMAC of the raw body
 * signed with your secret key in the x-paystack-signature header.
 */

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return false
  const hash = createHmac('sha512', secret).update(rawBody).digest('hex')
  return hash === signature
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  // ── 1. Reject unsigned or tampered payloads ──────────────────────────────────
  if (!verifySignature(rawBody, signature)) {
    console.warn('[webhook] Invalid Paystack signature — rejected')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── 2. Only handle successful charge events ──────────────────────────────────
  if (event.event !== 'charge.success') {
    // Acknowledge other events without processing
    return NextResponse.json({ received: true })
  }

  const data = event.data
  const reference  = data.reference as string
  const amountKobo = data.amount as number
  const amountNaira = amountKobo / 100
  const buyerEmail = (data.customer as Record<string, string>)?.email ?? ''
  const meta = (data.metadata ?? {}) as Record<string, unknown>

  const buyerName      = (meta.buyer_name      as string)        ?? 'Attendee'
  const buyerPhone     = (meta.buyer_phone     as string)        ?? null
  const ticketType     = (meta.ticket_type     as TicketTier)    ?? null
  const quantity       = (meta.quantity        as number)        ?? 1
  const discountCode   = (meta.discount_code   as string | null) ?? null
  const discountAmount = (meta.discount_amount as number)        ?? 0
  const attendeeEmails = (meta.attendee_emails as string[])      ?? []
  const breakouts      = Array.isArray(meta.breakouts) ? (meta.breakouts as string[]) : []

  if (!reference || !ticketType) {
    console.error('[webhook] Missing reference or ticket_type in metadata')
    return NextResponse.json({ received: true }) // Ack so Paystack doesn't retry
  }

  const supabase = getAdminClient()

  // ── 3. Idempotency check — don't save the same order twice ───────────────────
  const { data: existing } = await supabase
    .from('orders')
    .select('id, buyer_email, ticket_type, quantity, total_amount')
    .eq('paystack_reference', reference)
    .single()

  if (existing) {
    console.log(`[webhook] Order already exists for ref ${reference} — skipping`)
    return NextResponse.json({ received: true })
  }

  // ── 4. Create the order ──────────────────────────────────────────────────────
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      buyer_name:         buyerName,
      buyer_email:        buyerEmail,
      buyer_phone:        buyerPhone,
      ticket_type:        ticketType,
      quantity,
      unit_price:         TICKET_TYPES[ticketType]?.price ?? Math.round(amountNaira / quantity),
      discount_code:      discountCode,
      discount_amount:    discountAmount,
      total_amount:       amountNaira,
      paystack_reference: reference,
      payment_status:     'completed',
    })
    .select('id')
    .single()

  if (orderErr) {
    console.error('[webhook] Order insert error:', orderErr)
    // Return 500 so Paystack retries the webhook
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  // ── 5. Create attendee rows — one per seat with correct emails ──────────────
  // attendee_emails from Paystack metadata (set by initiate route)
  // Always produce exactly `quantity` rows, padding with buyer email if needed
  const seatEmails: string[] = Array.from(
    { length: quantity },
    (_, i) => (attendeeEmails[i] && attendeeEmails[i].includes('@'))
      ? attendeeEmails[i]
      : buyerEmail
  )

  const attendeeRows = seatEmails.map(email => ({
    order_id: order.id,
    email,
    name: email.toLowerCase() === buyerEmail.toLowerCase() ? buyerName : null,
    breakouts,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: insertedAttendees } = await (supabase as any)
    .from('attendees')
    .insert(attendeeRows)
    .select('ticket_code, email')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ticketCodes: string[] = (insertedAttendees ?? []).map((a: any) => a.ticket_code as string)

  console.log(`[webhook] ${ticketCodes.length} attendee(s) created for order ${order.id}:`, seatEmails)

  // ── 6. Send guest claim emails for non-buyer seats ───────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guestAttendees = (insertedAttendees ?? [] as any[]).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any) => a.email.toLowerCase() !== buyerEmail.toLowerCase()
  )

  if (guestAttendees.length > 0) {
    console.log(`[webhook] Sending ${guestAttendees.length} guest claim email(s)`)
    await Promise.allSettled(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guestAttendees.map((a: any) =>
        sendGuestTicketClaim({
          guestEmail: a.email as string,
          buyerName,
          ticketType,
          ticketCode: a.ticket_code as string,
        }).catch(err => console.error('[webhook] guest claim email failed:', a.email, err))
      )
    )
  }

  // ── 7. Send buyer confirmation email ─────────────────────────────────────────
  await sendTicketConfirmation({
    orderId:     order.id,
    buyerName,
    buyerEmail,
    ticketType,
    quantity,
    totalAmount: amountNaira,
    paystackRef: reference,
    ticketCodes,
    breakouts,
  })

  console.log(`[webhook] Order ${order.id} complete for ${buyerEmail} (${reference})`)
  return NextResponse.json({ received: true })
}
