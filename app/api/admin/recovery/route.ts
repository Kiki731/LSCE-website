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
          subject:  'You left something behind.',
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">

  <img src="${SITE}/images/EMERGE%20Themee%20Reveal%20Header.png"
       alt="LSCE 2026 — Emerge Beyond"
       style="width:100%;display:block;" />

  <div style="padding:40px 40px 16px;">
    <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#1a1a1a;line-height:1.25;">
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
              padding:14px 32px;border-radius:100px;font-size:15px;font-weight:700;
              letter-spacing:0.01em;">
      Get your ticket →
    </a>
  </div>

  <div style="padding:32px 40px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ebebeb;padding-top:28px;">
      <tr>
        <td style="vertical-align:top;padding-right:20px;width:50%;">
          <div style="background:#BAFFBA;border-radius:12px;padding:18px 20px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#00A800;">The Spark</p>
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">₦4,000</p>
            <p style="margin:0;font-size:12px;color:#444;line-height:1.5;">Morning keynote, Genius Arena, Exhibition floor, panel sessions.</p>
          </div>
        </td>
        <td style="vertical-align:top;width:50%;">
          <div style="background:#FDF0D9;border-radius:12px;padding:18px 20px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#CC8800;">The Rise</p>
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a;">₦8,000</p>
            <p style="margin:0;font-size:12px;color:#444;line-height:1.5;">Full day, six tracks, lunch, Grand Networking Hour + CV for Emergence.</p>
          </div>
        </td>
      </tr>
    </table>

    <div style="margin-top:28px;padding-top:24px;border-top:1px solid #ebebeb;">
      <p style="margin:0 0 6px;font-size:13px;color:#888;">📅 Saturday, October 3rd, 2026</p>
      <p style="margin:0;font-size:13px;color:#888;">📍 Daystar Christian Centre, Ikeja, Lagos</p>
    </div>
  </div>

  <div style="background:#1a1a1a;padding:24px 40px;text-align:center;">
    <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">
      Lagos Students Career Expo 2026 · <a href="${SITE}" style="color:rgba(255,255,255,0.4);">thelscexpo.com</a>
    </p>
  </div>

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
