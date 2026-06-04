import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/**
 * Validates a coupon code against the `coupons` table in Supabase.
 * The code itself is never exposed to the client — only valid/invalid + discount %.
 */
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

    const supabase = getAdminClient()
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, message: 'Invalid discount code' })
    }

    // Check active
    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, message: 'This code is no longer active' })
    }

    // Check usage limit
    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ valid: false, message: 'This code has reached its usage limit' })
    }

    // Check validity window
    const now = new Date()
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ valid: false, message: 'This code is not active yet' })
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ valid: false, message: 'This code has expired' })
    }

    // Check tier restriction
    if (coupon.ticket_types?.length && !coupon.ticket_types.includes(tier)) {
      return NextResponse.json({ valid: false, message: `This code only applies to: ${coupon.ticket_types.join(', ')}` })
    }

    const pct = coupon.discount_pct as number
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
