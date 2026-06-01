import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/tickets/order?ref=LSCE-xxxxx
 *
 * Looks up an order by Paystack reference.
 * Used by the /tickets/success page to display order details.
 * Returns only buyer-safe fields — no internal IDs beyond order ID.
 */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')

  if (!ref) {
    return NextResponse.json({ error: 'Missing ref parameter' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await supabase
    .from('orders')
    .select('id, buyer_name, buyer_email, ticket_type, quantity, total_amount, payment_status, created_at')
    .eq('paystack_reference', ref)
    .eq('payment_status', 'completed')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order: data })
}
