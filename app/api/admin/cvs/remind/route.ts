import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = process.env.RESEND_FROM ?? 'LSCE Tickets <tickets@thelscexpo.com>'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const firstName = name ? name.split(' ')[0] : 'there'

    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: 'Reminder: Upload your CV for LSCE 2026',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">

    <img src="https://thelscexpo.com/images/EMERGE%20Themee%20Reveal%20Header.png"
         alt="LSCE 2026 — Emerge Beyond"
         style="width:100%;display:block;" />

    <div style="padding:40px 40px 32px;">
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#1a1a1a;line-height:1.3;">
        Hey ${firstName}, don't forget your CV!
      </h1>
      <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
        You purchased a <strong>The Rise</strong> ticket for Lagos Students Career Expo 2026 —
        which includes the exclusive CV review session with top recruiters.
      </p>
      <p style="margin:0 0 28px;font-size:15px;color:#444;line-height:1.6;">
        We noticed you haven't uploaded your CV yet. Upload it before the event so recruiters
        can review it on the day.
      </p>

      <a href="https://thelscexpo.com/tickets"
         style="display:inline-block;background:#FF2035;color:#ffffff;text-decoration:none;
                padding:14px 28px;border-radius:100px;font-size:15px;font-weight:600;">
        Upload My CV →
      </a>

      <div style="margin-top:36px;padding-top:24px;border-top:1px solid #ebebeb;">
        <p style="margin:0 0 6px;font-size:13px;color:#888;">
          📅 Saturday, October 3rd, 2026
        </p>
        <p style="margin:0;font-size:13px;color:#888;">
          📍 Daystar Christian Centre, Ikeja, Lagos
        </p>
      </div>
    </div>

    <div style="background:#1a1a1a;padding:24px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">
        Lagos Students Career Expo 2026 · thelscexpo.com
      </p>
    </div>

  </div>
</body>
</html>`,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cvs/remind] error:', err)
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 })
  }
}
