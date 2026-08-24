import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET() {
  try {
    const admin = getAdminClient()

    // Try RPC first (needs SQL function — see below). Falls back to listUsers.
    const { data: rpcData, error: rpcErr } = await admin.rpc('get_admin_sessions')

    if (!rpcErr && rpcData) {
      // Enrich with user emails
      const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 100 })
      const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u.email ?? 'Unknown']))
      const now = new Date()

      const sessions = (rpcData as {
        id: string; user_id: string; created_at: string; updated_at: string; not_after: string | null
      }[]).map(s => ({
        id:          s.id,
        email:       userMap[s.user_id] ?? 'Unknown',
        created_at:  s.created_at,
        last_active: s.updated_at,
        expires_at:  s.not_after,
        is_active:   !s.not_after || new Date(s.not_after) > now,
      }))

      return NextResponse.json({ sessions, active_count: sessions.filter(s => s.is_active).length, source: 'rpc' })
    }

    // Fallback: listUsers — shows all admin accounts + last sign-in
    const { data: { users }, error: usersErr } = await admin.auth.admin.listUsers({ perPage: 100 })
    if (usersErr) throw usersErr

    const sessions = (users ?? []).map(u => ({
      id:          u.id,
      email:       u.email ?? 'Unknown',
      created_at:  u.created_at,
      last_active: u.last_sign_in_at ?? u.created_at,
      expires_at:  null,
      is_active:   true,
    }))

    return NextResponse.json({ sessions, active_count: sessions.length, source: 'users' })
  } catch (err) {
    console.error('[admin/sessions] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
