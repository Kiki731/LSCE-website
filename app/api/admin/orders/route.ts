import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user
}

/* ── GET /api/admin/orders ── */
export async function GET(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const search  = searchParams.get('search') ?? ''
  const tier    = searchParams.get('tier') ?? ''     // bronze|silver|gold
  const status  = searchParams.get('status') ?? ''   // completed|pending|failed
  const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit   = 20
  const offset  = (page - 1) * limit

  const supabase = await createSupabaseAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let query = db
    .from('orders')
    .select('id, buyer_name, buyer_email, buyer_phone, ticket_type, quantity, unit_price, discount_code, discount_amount, total_amount, paystack_reference, payment_status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tier)   query = query.eq('ticket_type', tier)
  if (status) query = query.eq('payment_status', status)
  if (search) {
    query = query.or(`buyer_name.ilike.%${search}%,buyer_email.ilike.%${search}%,paystack_reference.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Summary stats (always over all completed orders)
  const { data: stats } = await db
    .from('orders')
    .select('ticket_type, quantity, total_amount')
    .eq('payment_status', 'completed')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalRevenue   = stats?.reduce((s: number, o: any) => s + (o.total_amount ?? 0), 0) ?? 0
  const totalOrders    = stats?.length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalAttendees = stats?.reduce((s: number, o: any) => s + (o.quantity ?? 0), 0) ?? 0

  return NextResponse.json({
    orders: data ?? [],
    total: count ?? 0,
    page,
    limit,
    stats: { totalRevenue, totalOrders, totalAttendees },
  })
}
