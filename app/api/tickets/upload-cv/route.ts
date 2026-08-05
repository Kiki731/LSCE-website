import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase()
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any

  const { data: attendee, error } = await db
    .from('attendees')
    .select('id, email, name, ticket_code, cv_url, orders(ticket_type, buyer_name)')
    .eq('ticket_code', code)
    .single()

  if (error || !attendee) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const ticketType = attendee.orders?.ticket_type
  if (ticketType !== 'silver') {
    return NextResponse.json({ error: 'wrong_tier', ticketType }, { status: 403 })
  }

  return NextResponse.json({ attendee })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const code = (formData.get('code') as string)?.toUpperCase()
  const file = formData.get('file') as File | null

  if (!code || !file) {
    return NextResponse.json({ error: 'Missing code or file' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF or Word documents are accepted (.pdf, .doc, .docx)' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large — maximum size is 5MB' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any

  // Verify ticket exists and is silver
  const { data: attendee, error: lookupErr } = await db
    .from('attendees')
    .select('id, orders(ticket_type)')
    .eq('ticket_code', code)
    .single()

  if (lookupErr || !attendee) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  if (attendee.orders?.ticket_type !== 'silver') {
    return NextResponse.json({ error: 'CV upload is only available for Silver Pass holders' }, { status: 403 })
  }

  // Upload to Supabase Storage — overwrite any existing CV for this ticket
  const ext  = file.name.split('.').pop() ?? 'pdf'
  const path = `${code}.${ext}`

  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { data: uploaded, error: uploadErr } = await db.storage
    .from('cvs')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadErr) {
    console.error('[upload-cv] Storage error:', uploadErr)
    return NextResponse.json({ error: 'Upload failed — please try again' }, { status: 500 })
  }

  // Save path to the attendee record
  const { error: updateErr } = await db
    .from('attendees')
    .update({ cv_url: uploaded.path })
    .eq('ticket_code', code)

  if (updateErr) {
    console.error('[upload-cv] Attendee update error:', updateErr)
  }

  return NextResponse.json({ success: true, path: uploaded.path })
}
