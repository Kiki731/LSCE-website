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
  const filter = searchParams.get('filter') ?? 'all' // all | uploaded | pending
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = 50
  const offset = (page - 1) * limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any

  let query = db
    .from('attendees')
    .select(
      `id, email, name, ticket_code, cv_url, created_at,
       orders!inner(ticket_type, buyer_name, buyer_email)`,
      { count: 'exact' }
    )
    .eq('orders.ticket_type', 'silver')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (filter === 'uploaded') query = query.not('cv_url', 'is', null)
  if (filter === 'pending')  query = query.is('cv_url', null)

  const { data, count, error } = await query

  if (error) {
    console.error('[admin/cvs] query error:', error)
    return NextResponse.json({ error: 'Failed to load CVs' }, { status: 500 })
  }

  // Stats (always across all silver, regardless of filter)
  const { count: totalSilver } = await db
    .from('attendees')
    .select('id', { count: 'exact', head: true })
    .eq('orders.ticket_type', 'silver')

  const { count: uploaded } = await db
    .from('attendees')
    .select('id', { count: 'exact', head: true })
    .eq('orders.ticket_type', 'silver')
    .not('cv_url', 'is', null)

  return NextResponse.json({
    attendees:   data ?? [],
    total:       count ?? 0,
    totalPages:  Math.ceil((count ?? 0) / limit),
    stats: {
      total:    totalSilver ?? 0,
      uploaded: uploaded ?? 0,
      pending:  (totalSilver ?? 0) - (uploaded ?? 0),
    },
  })
}
