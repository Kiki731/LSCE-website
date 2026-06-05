import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

/**
 * POST /api/payments/initiate
 *
 * Initialises a Paystack transaction server-side using the SECRET key.
 * Amount is locked server-side — client cannot tamper with prices.
 * Discount codes are validated against the Supabase coupons table.
 *
 * Returns { access_code, reference, amountNaira } — client opens Paystack popup.
 */

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function generateRef(): string {
  return 'LSCE-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const {
      tier,
      quantity,
      buyer_email,
      buyer_name,
      buyer_phone,
      discount_code,
      attendee_emails,
    } = await req.json() as {
      tier: TicketTier
      quantity: number
      buyer_email: string
      buyer_name: string
      buyer_phone?: string
      discount_code?: string
      attendee_emails?: string[]
    }

    // ── Validate inputs ────────────────────────────────────────────────────────
    if (!tier || !quantity || !buyer_email || !buyer_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ticket = TICKET_TYPES[tier]
    if (!ticket) {
      return NextResponse.json({ error: 'Invalid ticket type' }, { status: 400 })
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: 'Quantity must be between 1 and 10' }, { status: 400 })
    }

    // ── Calculate amount server-side ───────────────────────────────────────────
    let subtotal = ticket.price * quantity
    let discountAmount = 0
    let discountPct = 0

    if (discount_code) {
      const supabase = getAdminClient()
      const { data: coupon } = await supabase
        .from('coupons')
        .select('discount_pct, is_active, max_uses, times_used, valid_from, valid_until, ticket_types')
        .eq('code', discount_code.toUpperCase().trim())
        .single()

      const now = new Date()
      const valid = coupon &&
        coupon.is_active &&
        (!coupon.max_uses || coupon.times_used < coupon.max_uses) &&
        (!coupon.valid_from  || new Date(coupon.valid_from)  <= now) &&
        (!coupon.valid_until || new Date(coupon.valid_until) >= now) &&
        (!coupon.ticket_types?.length || coupon.ticket_types.includes(tier))

      if (valid) {
        discountPct    = coupon.discount_pct as number
        discountAmount = Math.round(subtotal * (discountPct / 100))
        subtotal       = subtotal - discountAmount
      }
    }

    const totalNaira = subtotal
    const totalKobo  = totalNaira * 100  // Paystack requires kobo

    const reference = generateRef()

    // ── Call Paystack Initialize ───────────────────────────────────────────────
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:        buyer_email,
        amount:       totalKobo,
        currency:     'NGN',
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelscexpo.com'}/tickets/success`,
        metadata: {
          buyer_name,
          buyer_phone:     buyer_phone ?? null,
          ticket_type:     tier,
          quantity,
          discount_code:   discount_code ?? null,
          discount_amount: discountAmount,
          discount_pct:    discountPct,
          // Seat emails stored in Paystack metadata so the webhook can access them
          // even if the browser crashes after payment (no session storage available)
          attendee_emails: Array.isArray(attendee_emails) ? attendee_emails : [],
        },
        channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      }),
      cache: 'no-store',
    })

    const json = await paystackRes.json()

    if (!json.status) {
      console.error('[initiate] Paystack error:', JSON.stringify(json))
      return NextResponse.json(
        { error: json.message ?? 'Failed to initialise payment', detail: json },
        { status: 400 },
      )
    }

    return NextResponse.json({
      access_code:  json.data.access_code  as string,
      reference:    json.data.reference    as string,
      amountNaira:  totalNaira,
    })
  } catch (err) {
    console.error('[initiate] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
