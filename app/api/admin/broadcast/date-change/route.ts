import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { sendBatched, type BatchPayload } from '@/lib/send-batch'
import { buildDateChangeEmail, DATE_CHANGE_SUBJECT } from '@/lib/email'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? 'LSCE Tickets <tickets@thelscexpo.com>'
const SITE   = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelscexpo.com').replace(/\/$/, '')

export async function POST() {
  const auth = await createSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await createSupabaseAdminClient()

  // Fetch all completed orders — unique by buyer_email
  const { data: orders, error } = await (db as any)
    .from('orders')
    .select('buyer_email, buyer_name')
    .eq('payment_status', 'completed')

  if (error) {
    console.error('[broadcast/date-change] fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }

  // Deduplicate by email
  const seen = new Set<string>()
  const recipients: { email: string; name: string }[] = []
  for (const o of (orders ?? [])) {
    const email = (o.buyer_email as string).trim().toLowerCase()
    if (!seen.has(email)) {
      seen.add(email)
      recipients.push({ email, name: o.buyer_name ?? '' })
    }
  }

  const payloads: BatchPayload[] = recipients.map(({ email, name }) => {
    const firstName = name.split(' ')[0] || 'there'
    const { text, html } = buildDateChangeEmail(firstName)
    return {
      from:    FROM,
      to:      email,
      replyTo: 'lagosstudentcareerexpo@gmail.com',
      subject: DATE_CHANGE_SUBJECT,
      text,
      html,
    }
  })

  const { succeeded, failed, errors } = await sendBatched(payloads)
  if (errors.length) console.error('[broadcast] send errors:', errors)

  return NextResponse.json({ succeeded, failed, total: recipients.length, errors })
}
