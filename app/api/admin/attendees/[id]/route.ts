import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user
}

/* ── PATCH /api/admin/attendees/[id] — toggle check-in ── */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const supabase = await createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const updateData: Record<string, unknown> = {}
  if (typeof body.checked_in === 'boolean') {
    updateData.checked_in    = body.checked_in
    updateData.checked_in_at = body.checked_in ? new Date().toISOString() : null
  }
  if (typeof body.name === 'string') updateData.name = body.name

  const { data, error } = await db
    .from('attendees')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attendee: data })
}
