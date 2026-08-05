import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/**
 * GET /api/tickets/claim?code=A1B2C3D4
 * Public — fetches attendee + order info needed to render the claim page.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase().trim()
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any

  const { data, error } = await db
    .from('attendees')
    .select(`
      id, email, name, ticket_code, checked_in,
      orders!inner(buyer_name, buyer_email, ticket_type, total_amount)
    `)
    .eq('ticket_code', code)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  return NextResponse.json({ attendee: data })
}

/**
 * POST /api/tickets/claim
 * Public — lets an attendee register their name and phone against their ticket.
 * Only allowed once (or when name is still null — not yet claimed).
 */
export async function POST(req: NextRequest) {
  const { code, name, phone } = await req.json()

  if (!code || !name || !phone) {
    return NextResponse.json({ error: 'code, name, and phone are required' }, { status: 400 })
  }

  if (name.trim().length < 2) {
    return NextResponse.json({ error: 'Please enter your full name' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any

  // Fetch current attendee
  const { data: existing, error: fetchErr } = await db
    .from('attendees')
    .select('id, name, ticket_code')
    .eq('ticket_code', code.toUpperCase().trim())
    .single()

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  const { data: updated, error: updateErr } = await db
    .from('attendees')
    .update({ name: name.trim(), phone: phone.trim() })
    .eq('ticket_code', code.toUpperCase().trim())
    .select('id, email, name, phone, ticket_code')
    .single()

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ attendee: updated, success: true })
}
