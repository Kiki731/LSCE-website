import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user
}

/* ── GET /api/admin/attendees ── */
export async function GET(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const search     = searchParams.get('search') ?? ''
  const checkedIn  = searchParams.get('checked_in') ?? ''  // 'true' | 'false' | ''
  const tier       = searchParams.get('tier') ?? ''
  const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit      = 25
  const offset     = (page - 1) * limit

  const supabase = await createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let query = db
    .from('attendees')
    .select(
      `id, email, name, ticket_code, checked_in, checked_in_at, created_at, cv_url,
       orders!inner(id, buyer_name, buyer_email, ticket_type, quantity, total_amount, paystack_reference)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (checkedIn === 'true')  query = query.eq('checked_in', true)
  if (checkedIn === 'false') query = query.eq('checked_in', false)
  if (tier) query = query.eq('orders.ticket_type', tier)
  if (search) {
    query = query.or(`email.ilike.%${search}%,ticket_code.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Check-in stats
  const { data: allAttendees } = await db
    .from('attendees')
    .select('checked_in')

  const totalCount   = allAttendees?.length ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkedCount = allAttendees?.filter((a: any) => a.checked_in).length ?? 0

  return NextResponse.json({
    attendees: data ?? [],
    total: count ?? 0,
    page,
    limit,
    stats: { total: totalCount, checkedIn: checkedCount },
  })
}
