import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAmbassadorApplicationConfirmation, sendAmbassadorTeamNotification } from '@/lib/email'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { full_name, email, phone, university, course, year, instagram, why_apply } = body

    if (!full_name || !email || !phone || !university || !course || !year || !why_apply) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
    }

    if (why_apply.trim().length < 50) {
      return NextResponse.json({ error: 'Please tell us a bit more about why you want to apply (at least 50 characters)' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getAdminClient() as any

    // Check for duplicate application
    const { data: existing } = await db
      .from('ambassador_applications')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'An application with this email already exists. We\'ll be in touch soon!' }, { status: 409 })
    }

    const { error: insertErr } = await db
      .from('ambassador_applications')
      .insert({
        full_name: full_name.trim(),
        email:     email.toLowerCase().trim(),
        phone:     phone.trim(),
        university: university.trim(),
        course:    course.trim(),
        year,
        instagram: instagram?.trim() || null,
        why_apply: why_apply.trim(),
        status:    'pending',
      })

    if (insertErr) {
      console.error('[ambassadors/apply] insert error:', insertErr)
      return NextResponse.json({ error: 'Failed to submit application. Please try again.' }, { status: 500 })
    }

    await Promise.allSettled([
      sendAmbassadorApplicationConfirmation({
        applicantName:  full_name.trim(),
        applicantEmail: email.toLowerCase().trim(),
        university:     university.trim(),
      }),
      sendAmbassadorTeamNotification({
        applicantName:  full_name.trim(),
        applicantEmail: email.toLowerCase().trim(),
        phone:          phone.trim(),
        university:     university.trim(),
        course:         course.trim(),
        year,
        instagram:      instagram?.trim() || null,
        whyApply:       why_apply.trim(),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ambassadors/apply] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
