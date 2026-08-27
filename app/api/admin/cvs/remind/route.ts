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
      from:     FROM,
      to:       email,
      replyTo:  'lagosstudentcareerexpo@gmail.com',
      subject:  `${firstName}, your CV is still missing`,
      text: `Hey ${firstName},

You purchased a The Rise ticket for Lagos Students Career Expo 2026, which includes the exclusive CV review session with recruiters.

We noticed you haven't uploaded your CV yet. Recruiters will be reviewing submissions before the event, so the sooner it's in, the better.

Upload your CV here: https://thelscexpo.com/tickets

Event details:
Saturday, November 28th, 2026
Daystar Christian Centre, Ikeja, Lagos

See you there,
The LSCE Team`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 40px;">

    <p style="margin:0 0 8px;font-size:13px;color:#999;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">LSCE 2026</p>

    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#1a1a1a;line-height:1.3;">
      Hey ${firstName}, your CV is still missing.
    </h1>
    <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.7;">
      You purchased a <strong>The Rise</strong> ticket for Lagos Students Career Expo 2026,
      which includes the exclusive CV review session with top recruiters.
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#444;line-height:1.7;">
      We noticed you haven't uploaded your CV yet. Recruiters will be reviewing submissions
      before the event — the sooner it's in, the better.
    </p>

    <a href="https://thelscexpo.com/tickets"
       style="display:inline-block;background:#FF2035;color:#ffffff;text-decoration:none;
              padding:13px 28px;border-radius:100px;font-size:14px;font-weight:600;">
      Upload my CV
    </a>

    <div style="margin-top:40px;padding-top:28px;border-top:1px solid #ebebeb;">
      <p style="margin:0 0 5px;font-size:13px;color:#888;">Saturday, November 28th, 2026</p>
      <p style="margin:0;font-size:13px;color:#888;">Daystar Christian Centre, Ikeja, Lagos</p>
    </div>

    <p style="margin:36px 0 0;font-size:12px;color:#bbb;">
      Lagos Students Career Expo 2026 &middot; <a href="https://thelscexpo.com" style="color:#bbb;">thelscexpo.com</a>
    </p>
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
