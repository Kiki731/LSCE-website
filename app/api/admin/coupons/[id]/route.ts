import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user
}

/* ── PATCH /api/admin/coupons/[id] — toggle active / edit ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const raw = await req.json()

  // Allowlist — never pass the raw body to update() (mass-assignment risk)
  const allowed = ['is_active', 'code', 'description', 'discount_pct', 'max_uses', 'valid_from', 'valid_until', 'ticket_types'] as const
  const updates = Object.fromEntries(
    allowed.filter(k => raw[k] !== undefined).map(k => [k, raw[k]])
  )
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = await createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('coupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupon: data })
}

/* ── DELETE /api/admin/coupons/[id] — remove a coupon ── */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = await createSupabaseAdminClient()
  const { error } = await supabase.from('coupons').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
