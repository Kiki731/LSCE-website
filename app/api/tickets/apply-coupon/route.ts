import { NextRequest, NextResponse } from 'next/server'
import { TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

/**
 * Validates a discount code entirely server-side.
 * Codes are stored in .env.local as:
 *   DISCOUNT_CODES=LSCE10:10,LSCE20:20,CAMPUS:15
 * Format: CODE:PERCENTAGE (integer, 1-100)
 *
 * They are NEVER sent to the client — only the result (valid/invalid + %) is returned.
 */

function getDiscountMap(): Record<string, number> {
  const raw = process.env.DISCOUNT_CODES ?? ''
  if (!raw) return {}

  return raw.split(',').reduce<Record<string, number>>((acc, entry) => {
    const [code, pctStr] = entry.trim().split(':')
    const pct = parseInt(pctStr ?? '', 10)
    if (code && !isNaN(pct) && pct > 0 && pct <= 100) {
      acc[code.toUpperCase()] = pct
    }
    return acc
  }, {})
}

export async function POST(req: NextRequest) {
  try {
    const { code, tier, quantity } = await req.json() as {
      code: string
      tier: TicketTier
      quantity: number
    }

    if (!code || !tier || !quantity) {
      return NextResponse.json({ valid: false, message: 'Missing fields' }, { status: 400 })
    }

    const ticket = TICKET_TYPES[tier]
    if (!ticket) {
      return NextResponse.json({ valid: false, message: 'Invalid ticket type' }, { status: 400 })
    }

    const codes = getDiscountMap()
    const pct = codes[code.toUpperCase().trim()] ?? 0

    if (!pct) {
      return NextResponse.json({ valid: false, message: 'Invalid discount code' })
    }

    const subtotal = ticket.price * quantity
    const discountAmount = Math.round(subtotal * (pct / 100))
    const total = subtotal - discountAmount

    return NextResponse.json({
      valid: true,
      pct,
      discountAmount,
      total,
      message: `${pct}% discount applied`,
    })
  } catch (err) {
    console.error('apply-coupon error:', err)
    return NextResponse.json({ valid: false, message: 'Internal error' }, { status: 500 })
  }
}
