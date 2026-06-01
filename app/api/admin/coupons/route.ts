import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user
}

/* ── GET /api/admin/coupons — list all coupons ── */
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupons: data })
}

/* ── POST /api/admin/coupons — create a coupon ── */
export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { code, description, discount_pct, max_uses, valid_from, valid_until, ticket_types } = body

  if (!code || !discount_pct) {
    return NextResponse.json({ error: 'code and discount_pct are required' }, { status: 400 })
  }

  const supabase = await createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('coupons')
    .insert({
      code:         code.toUpperCase().trim(),
      description:  description ?? null,
      discount_pct: Number(discount_pct),
      max_uses:     max_uses ? Number(max_uses) : null,
      valid_from:   valid_from ?? null,
      valid_until:  valid_until ?? null,
      ticket_types: ticket_types?.length ? ticket_types : null,
      is_active:    true,
      created_by:   user.email,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupon: data })
}
