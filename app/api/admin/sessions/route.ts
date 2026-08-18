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

    // Query auth.sessions via the auth schema
    const authDb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { db: { schema: 'auth' } },
    )

    const { data: sessions, error } = await authDb
      .from('sessions')
      .select('id, user_id, created_at, updated_at, not_after')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[admin/sessions] sessions query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enrich with user emails
    const { data: { users }, error: usersErr } = await admin.auth.admin.listUsers({ perPage: 100 })
    if (usersErr) {
      console.error('[admin/sessions] listUsers error:', usersErr)
    }

    const userMap = Object.fromEntries((users ?? []).map(u => [u.id, u.email ?? 'Unknown']))

    const now = new Date()
    const enriched = (sessions ?? []).map(s => ({
      id:         s.id,
      email:      userMap[s.user_id] ?? 'Unknown',
      created_at: s.created_at,
      last_active: s.updated_at,
      expires_at: s.not_after,
      is_active:  !s.not_after || new Date(s.not_after) > now,
    }))

    const active = enriched.filter(s => s.is_active)

    return NextResponse.json({ sessions: enriched, active_count: active.length })
  } catch (err) {
    console.error('[admin/sessions] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
