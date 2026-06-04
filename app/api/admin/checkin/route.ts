import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user
}

/**
 * GET /api/admin/checkin?q=TICKET_CODE_OR_NAME_OR_EMAIL
 *
 * Fast lookup for check-in staff. Returns matching attendees with their order info.
 * Used by the check-in page for both manual search and QR scan results.
 */
export async function GET(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (!q || q.length < 2) {
    return NextResponse.json({ attendees: [] })
  }

  const supabase = await createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data, error } = await db
    .from('attendees')
    .select(`
      id, email, name, ticket_code, checked_in, checked_in_at, created_at,
      orders!inner(id, buyer_name, buyer_email, ticket_type, quantity, total_amount)
    `)
    .or(`ticket_code.ilike.${q.toUpperCase()},email.ilike.%${q}%,orders.buyer_name.ilike.%${q}%`)
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attendees: data ?? [] })
}

/**
 * POST /api/admin/checkin
 *
 * Check in (or undo check-in) for an attendee by ticket_code.
 * This is the action endpoint — called when staff hits the check-in button.
 */
export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ticket_code, checked_in } = await req.json()

  if (!ticket_code) {
    return NextResponse.json({ error: 'ticket_code is required' }, { status: 400 })
  }

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
