import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? 'LSCE Tickets <tickets@thelscexpo.com>'
const SITE   = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelscexpo.com'

export async function POST(req: NextRequest) {
  try {
    const { emails } = await req.json() as { emails: string[] }
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 })
    }

    const results = await Promise.allSettled(
      emails.map(email =>
        resend.emails.send({
          from:     FROM,
          to:       email.trim(),
          reply_to: 'lagosstudentcareerexpo@gmail.com',
          subject:  'Did something come up?',
          text: `You were this close.

You started getting your ticket to Lagos Students Career Expo 2026 — and then something happened.

We get it. Life interrupts. Tabs get closed. But the expo is on October 3rd, 2026 at Daystar Christian Centre, Ikeja — and spots are limited.

The conversation you were hoping to have, the room you were trying to get into, the person you were hoping to meet — they'll all be there.

Complete your ticket here: ${SITE}/tickets

Two options:
- The Spark (N4,000) — morning keynote, Genius Arena, Exhibition floor, panel sessions
- The Rise (N8,000) — full day, six tracks, lunch, Grand Networking Hour, CV review with recruiters

Event: Saturday, October 3rd, 2026 at Daystar Christian Centre, Ikeja, Lagos

The LSCE Team`,
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 40px;">

  <p style="margin:0 0 8px;font-size:13px;color:#999;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">LSCE 2026</p>

  <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#1a1a1a;line-height:1.3;">
    You were this close.
  </h1>

  <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">
    You started getting your ticket to Lagos Students Career Expo 2026 — and then something happened.
  </p>

  <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">
    We get it. Life interrupts. Tabs get closed. But the expo is happening on
    <strong>October 3rd, 2026</strong> at Daystar Christian Centre, Ikeja — and spots are limited.
  </p>

  <p style="margin:0 0 28px;font-size:15px;color:#444;line-height:1.7;">
    The conversation you were hoping to have, the room you were trying to get into,
    the person you were hoping to meet — they'll all be there.
  </p>

  <a href="${SITE}/tickets"
     style="display:inline-block;background:#FF2035;color:#ffffff;text-decoration:none;
            padding:13px 28px;border-radius:100px;font-size:14px;font-weight:600;">
    Complete my ticket
  </a>

  <div style="margin-top:36px;padding-top:28px;border-top:1px solid #ebebeb;">
    <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#1a1a1a;">Two ticket options:</p>
    <p style="margin:0 0 6px;font-size:13px;color:#555;line-height:1.6;">
      <strong>The Spark — &#x20A6;4,000</strong><br>
      Morning keynote, Genius Arena, Exhibition floor, panel sessions.
    </p>
    <p style="margin:12px 0 0;font-size:13px;color:#555;line-height:1.6;">
      <strong>The Rise — &#x20A6;8,000</strong><br>
      Full day, six tracks, lunch, Grand Networking Hour, CV review with recruiters.
    </p>
  </div>

  <div style="margin-top:28px;padding-top:24px;border-top:1px solid #ebebeb;">
    <p style="margin:0 0 5px;font-size:13px;color:#888;">Saturday, October 3rd, 2026</p>
    <p style="margin:0;font-size:13px;color:#888;">Daystar Christian Centre, Ikeja, Lagos</p>
  </div>

  <p style="margin:40px 0 0;font-size:12px;color:#bbb;">
    Lagos Students Career Expo 2026 &middot; <a href="${SITE}" style="color:#bbb;">thelscexpo.com</a>
  </p>

</div>
</body>
</html>`,
        })
      )
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed    = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({ succeeded, failed, total: emails.length })
  } catch (err) {
    console.error('[recovery] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
