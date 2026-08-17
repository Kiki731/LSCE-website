import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { sendCVUploadConfirmation } from '@/lib/email'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  })
}

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? 'lsce-cvs'

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

  // Verify ticket exists and is a Rise (silver) ticket
  const { data: attendee, error: lookupErr } = await db
    .from('attendees')
    .select('id, email, name, orders(ticket_type)')
    .eq('ticket_code', code)
    .single()

  if (lookupErr || !attendee) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  if (attendee.orders?.ticket_type !== 'silver') {
    return NextResponse.json({ error: 'CV upload is only available for The Rise ticket holders' }, { status: 403 })
  }

  const bytes = await file.arrayBuffer()

  // Validate file contents by magic bytes — client-supplied MIME type is untrusted
  const magic = new Uint8Array(bytes.slice(0, 8))
  const isPDF  = magic[0] === 0x25 && magic[1] === 0x50 && magic[2] === 0x44 && magic[3] === 0x46  // %PDF
  const isDOCX = magic[0] === 0x50 && magic[1] === 0x4B && magic[2] === 0x03 && magic[3] === 0x04  // PK (ZIP — DOCX)
  const isDOC  = magic[0] === 0xD0 && magic[1] === 0xCF && magic[2] === 0x11 && magic[3] === 0xE0  // OLE (DOC)
  if (!isPDF && !isDOCX && !isDOC) {
    return NextResponse.json({ error: 'File contents do not match a PDF or Word document' }, { status: 400 })
  }

  // Sanitise extension to an explicit allowlist — never trust file.name
  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? ''
  const ext = ['pdf', 'doc', 'docx'].includes(rawExt) ? rawExt : isPDF ? 'pdf' : isDOC ? 'doc' : 'docx'
  const key = `${code}.${ext}`

  try {
    const r2 = getR2Client()
    await r2.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        Buffer.from(bytes),
      ContentType: isPDF ? 'application/pdf' : isDOC ? 'application/msword' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }))
  } catch (err) {
    console.error('[upload-cv] R2 upload error:', err)
    return NextResponse.json({ error: 'Upload failed — please try again' }, { status: 500 })
  }

  // Save the R2 key to the attendee record
  const { data: updatedAttendee, error: updateErr } = await db
    .from('attendees')
    .update({ cv_url: key })
    .eq('ticket_code', code)
    .select('email, name')
    .single()

  if (updateErr) {
    console.error('[upload-cv] Attendee update error:', updateErr)
  }

  if (updatedAttendee?.email) {
    sendCVUploadConfirmation({
      attendeeEmail: updatedAttendee.email,
      attendeeName:  updatedAttendee.name ?? updatedAttendee.email.split('@')[0],
      ticketCode:    code,
    }).catch(err => console.error('[upload-cv] confirmation email failed:', err))
  }

  return NextResponse.json({ success: true, key })
}
