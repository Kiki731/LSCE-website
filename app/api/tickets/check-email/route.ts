import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/tickets/check-email?email=xxx
 *
 * Soft check — returns whether an email already has a completed order.
 * Used on the checkout form to show a warning (not a hard block).
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ used: false })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data } = await db
    .from('orders')
    .select('id, ticket_type, quantity')
    .eq('buyer_email', email)
    .eq('payment_status', 'completed')
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    used:        !!data,
    ticketType:  data?.ticket_type ?? null,
    quantity:    data?.quantity    ?? null,
  })
}
