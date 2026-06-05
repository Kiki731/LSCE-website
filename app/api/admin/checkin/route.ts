import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user
}

/**
 * GET /api/admin/checkin?q=TICKET_CODE_OR_EMAIL_OR_NAME
 *
 * Looks up attendees for check-in.
 *
 * PostgREST limitation: .or() only works on columns of the current table,
 * NOT on joined tables. So we run two separate queries:
 *   1. Attendees whose ticket_code or email matches
 *   2. Attendees belonging to orders whose buyer_name matches
 * Then we merge and deduplicate.
 */
export async function GET(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q || q.length < 2) return NextResponse.json({ attendees: [] })

  const supabase = await createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const ATTENDEE_SELECT = `
    id, email, name, ticket_code, checked_in, checked_in_at, created_at,
    orders!inner(id, buyer_name, buyer_email, ticket_type, quantity, total_amount)
  `

  // ── Query 1: by ticket_code (exact, case-insensitive) or email ───────────────
  const { data: byTicketOrEmail, error: err1 } = await db
    .from('attendees')
    .select(ATTENDEE_SELECT)
    .or(`ticket_code.eq.${q.toUpperCase()},email.ilike.%${q}%`)
    .limit(10)

  if (err1) console.error('[checkin GET] query1 error:', err1.message)

  // ── Query 2: by buyer name — find matching orders, then their attendees ──────
  let byBuyerName: unknown[] = []
  const { data: matchingOrders } = await db
    .from('orders')
    .select('id')
    .ilike('buyer_name', `%${q}%`)
    .limit(5)

  if (matchingOrders?.length) {
    const orderIds = (matchingOrders as { id: string }[]).map(o => o.id)
    const { data: fromOrders, error: err2 } = await db
      .from('attendees')
      .select(ATTENDEE_SELECT)
      .in('order_id', orderIds)
      .limit(10)

    if (err2) console.error('[checkin GET] query2 error:', err2.message)
    byBuyerName = fromOrders ?? []
  }

  // ── Merge and deduplicate by attendee id ─────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seen = new Set<string>()
  const merged: unknown[] = []
  for (const a of [...(byTicketOrEmail ?? []), ...byBuyerName]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = (a as any).id
    if (!seen.has(id)) { seen.add(id); merged.push(a) }
  }

  return NextResponse.json({ attendees: merged.slice(0, 10) })
}

/**
 * POST /api/admin/checkin
 * Toggle check-in for an attendee by ticket_code.
 */
export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ticket_code, checked_in } = await req.json()
  if (!ticket_code) return NextResponse.json({ error: 'ticket_code is required' }, { status: 400 })

  const supabase = await createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data, error } = await db
    .from('attendees')
    .update({
      checked_in:    checked_in ?? true,
      checked_in_at: checked_in !== false ? new Date().toISOString() : null,
    })
    .eq('ticket_code', ticket_code.toUpperCase())
    .select(`
      id, email, name, ticket_code, checked_in, checked_in_at,
      orders!inner(buyer_name, buyer_email, ticket_type)
    `)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attendee: data })
}
