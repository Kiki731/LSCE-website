import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
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

    const supabase = getAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: coupon, error } = await (supabase as any)
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, message: 'Invalid code' })
    }

    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, message: 'This code is no longer active' })
    }

    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ valid: false, message: 'This code has reached its usage limit' })
    }

    const now = new Date()
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({ valid: false, message: 'This code is not active yet' })
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({ valid: false, message: 'This code has expired' })
    }

    if (coupon.ticket_types?.length && !coupon.ticket_types.includes(tier)) {
      return NextResponse.json({ valid: false, message: `This code only applies to: ${coupon.ticket_types.join(', ')}` })
    }

    const subtotal = ticket.price * quantity

    // Tracking-only code — valid but no discount
    if (coupon.is_discount === false) {
      return NextResponse.json({
        valid: true,
        pct: 0,
        discountAmount: 0,
        total: subtotal,
        message: 'Code applied',
      })
    }

    // Fixed-amount discount
    if (coupon.discount_type === 'fixed') {
      const value = Number(coupon.discount_value ?? 0)
      const discountAmount = Math.min(value, subtotal)
      return NextResponse.json({
        valid: true,
        pct: 0,
        discountAmount,
        total: subtotal - discountAmount,
        message: `₦${discountAmount.toLocaleString('en-NG')} off applied`,
      })
    }

    // Percentage discount (default)
    const pct = coupon.discount_pct as number
    const discountAmount = Math.round(subtotal * (pct / 100))
    return NextResponse.json({
      valid: true,
      pct,
      discountAmount,
      total: subtotal - discountAmount,
      message: `${pct}% discount applied`,
    })
  } catch (err) {
    console.error('apply-coupon error:', err)
    return NextResponse.json({ valid: false, message: 'Internal error' }, { status: 500 })
  }
}
