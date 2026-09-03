import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? 'LSCE Tickets <tickets@thelscexpo.com>'
const SITE   = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelscexpo.com').replace(/\/$/, '')

function buildEmail(firstName: string) {
  const text = `Hey ${firstName},

We have an important update about Lagos Students Career Expo 2026.

We've moved the event date to Saturday, November 28th, 2026. The venue remains the same — Daystar Christian Centre, Ikeja, Lagos.

We know a date change can be inconvenient, and we're sorry for that. If November 28th doesn't work for you and you'd like a full refund, please send us an email at lagosstudentcareerexpo@gmail.com — we'll sort it out, no questions asked.

If you're still coming, we can't wait to see you. This extra time means we're making LSCE 3.0 even bigger.

The LSCE Team
lagosstudentcareerexpo@gmail.com`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 40px;">

    <p style="margin:0 0 8px;font-size:13px;color:#999;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">LSCE 2026</p>

    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#1a1a1a;line-height:1.3;">
      Hey ${firstName}, we've moved the date.
    </h1>

    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">
      We have an important update about your ticket to Lagos Students Career Expo 2026.
    </p>

    <div style="background:#fff8f8;border-left:3px solid #FF2035;padding:16px 20px;margin:0 0 24px;border-radius:0 8px 8px 0;">
      <p style="margin:0 0 4px;font-size:13px;color:#999;">New date</p>
      <p style="margin:0;font-size:17px;font-weight:700;color:#1a1a1a;">Saturday, November 28th, 2026</p>
      <p style="margin:4px 0 0;font-size:13px;color:#666;">Daystar Christian Centre, Ikeja, Lagos &mdash; same venue</p>
    </div>

    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">
      We know a date change can be inconvenient, and we're sorry for that. If November 28th doesn't work for you and you'd like a full refund, just reply to this email or reach us at
      <a href="mailto:lagosstudentcareerexpo@gmail.com" style="color:#FF2035;text-decoration:none;">lagosstudentcareerexpo@gmail.com</a> — we'll sort it out, no questions asked.
    </p>

    <p style="margin:0 0 28px;font-size:15px;color:#444;line-height:1.7;">
      If you're still coming, we can't wait to see you. This extra time means we're making LSCE 3.0 even bigger.
    </p>

    <a href="${SITE}/tickets"
       style="display:inline-block;background:#FF2035;color:#ffffff;text-decoration:none;
              padding:13px 28px;border-radius:100px;font-size:14px;font-weight:600;">
      View my ticket
    </a>

    <div style="margin-top:40px;padding-top:28px;border-top:1px solid #ebebeb;">
      <p style="margin:0 0 5px;font-size:13px;color:#888;">Saturday, November 28th, 2026</p>
      <p style="margin:0;font-size:13px;color:#888;">Daystar Christian Centre, Ikeja, Lagos</p>
    </div>

    <p style="margin:36px 0 0;font-size:12px;color:#bbb;">
      Lagos Students Career Expo 2026 &middot; <a href="${SITE}" style="color:#bbb;">thelscexpo.com</a>
    </p>
  </div>
</body>
</html>`

  return { text, html }
}

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

  const results = await Promise.allSettled(
    recipients.map(({ email, name }) => {
      const firstName = name.split(' ')[0] || 'there'
      const { text, html } = buildEmail(firstName)
      return resend.emails.send({
        from:    FROM,
        to:      email,
        replyTo: 'lagosstudentcareerexpo@gmail.com',
        subject: 'Important update — LSCE 2026 new date',
        text,
        html,
      })
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed    = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ succeeded, failed, total: recipients.length })
}
