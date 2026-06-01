import { NextRequest, NextResponse } from 'next/server'
import { TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

/**
 * POST /api/payments/initiate
 *
 * Initialises a Paystack transaction server-side using the SECRET key.
 * The amount is calculated here — the client never sets the amount directly,
 * which prevents price-tampering attacks.
 *
 * Returns { access_code, reference, amountNaira } to the client.
 * The client then opens the Paystack popup using the access_code.
 */

function getDiscountMap(): Record<string, number> {
  const raw = process.env.DISCOUNT_CODES ?? ''
  return raw.split(',').reduce<Record<string, number>>((acc, entry) => {
    const [code, pctStr] = entry.trim().split(':')
    const pct = parseInt(pctStr ?? '', 10)
    if (code && !isNaN(pct) && pct > 0 && pct <= 100) acc[code.toUpperCase()] = pct
    return acc
  }, {})
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
    } = await req.json() as {
      tier: TicketTier
      quantity: number
      buyer_email: string
      buyer_name: string
      buyer_phone?: string
      discount_code?: string
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
      const codes = getDiscountMap()
      const pct = codes[discount_code.toUpperCase().trim()] ?? 0
      if (pct) {
        discountPct = pct
        discountAmount = Math.round(subtotal * (pct / 100))
        subtotal = subtotal - discountAmount
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
          buyer_phone:  buyer_phone ?? null,
          ticket_type:  tier,
          quantity,
          discount_code:   discount_code ?? null,
          discount_amount: discountAmount,
          discount_pct:    discountPct,
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
