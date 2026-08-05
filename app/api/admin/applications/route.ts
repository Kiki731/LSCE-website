import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase-server'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') ?? 'all'
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = 50
  const offset = (page - 1) * limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any

  let query = db
    .from('ambassador_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') query = query.eq('status', status)

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/applications] error:', error)
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 })
  }

  // Stats
  const [{ count: total }, { count: pending }, { count: approved }, { count: rejected }] =
    await Promise.all([
      db.from('ambassador_applications').select('id', { count: 'exact', head: true }),
      db.from('ambassador_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      db.from('ambassador_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      db.from('ambassador_applications').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    ])

  return NextResponse.json({
    applications: data ?? [],
    total:        count ?? 0,
    totalPages:   Math.ceil((count ?? 0) / limit),
    stats:        { total: total ?? 0, pending: pending ?? 0, approved: approved ?? 0, rejected: rejected ?? 0 },
  })
}
