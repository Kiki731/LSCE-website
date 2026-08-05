import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const TEAM_EMAIL   = 'lagosstudentcareerexpo@gmail.com'
const FROM_ADDRESS = process.env.RESEND_FROM ?? 'onboarding@resend.dev'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Please fill in all fields' }, { status: 400 })
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: 'Message is too short' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getAdminClient() as any

    const { error: insertErr } = await db
      .from('contact_messages')
      .insert({
        name:    name.trim(),
        email:   email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
      })

    if (insertErr) {
      console.error('[contact] insert error:', insertErr)
      return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
    }

    // Notify team
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const resend = new Resend(resendKey)
      await resend.emails.send({
        from:    FROM_ADDRESS,
        to:      [TEAM_EMAIL],
        replyTo: email,
        subject: `New Contact Message — ${subject}`,
        text: `
New contact message from thelscexpo.com

From:    ${name} <${email}>
Subject: ${subject}

${message}
        `.trim(),
      }).catch(err => console.error('[contact] notification email failed:', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
