import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

function slugify(text: string): string {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 7)
}

function generateCode(seed: string): string {
  const prefix = slugify(seed) || 'LSCE'
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${suffix}`
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, university } = await req.json() as {
      name?: string; email?: string; university?: string
    }

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }
    if (!university?.trim()) {
      return NextResponse.json({ error: 'University name is required.' }, { status: 400 })
    }

    const db = await createSupabaseAdminClient()

    // Check if this email belongs to an approved ambassador
    const { data: application } = await (db as any)
      .from('ambassador_applications')
      .select('full_name, email, status')
      .eq('email', email.toLowerCase().trim())
      .eq('status', 'approved')
      .single()

    if (!application) {
      return NextResponse.json(
        { error: "We couldn't find an approved ambassador account for that email. Make sure you applied and were approved, or contact the team." },
        { status: 404 }
      )
    }

    const cleanUniversity = university.trim()

    // Return existing code if this email already has one
    const { data: existingByEmail } = await (db as any)
      .from('referral_codes')
      .select('code, university')
      .eq('ambassador_email', email.toLowerCase().trim())
      .maybeSingle()

    if (existingByEmail) {
      return NextResponse.json({ code: existingByEmail.code, existing: true, university: existingByEmail.university })
    }

    // Check if this university already has a code claimed by someone else
    const { data: existingByUni } = await (db as any)
      .from('referral_codes')
      .select('ambassador_name')
      .ilike('university', cleanUniversity)
      .maybeSingle()

    if (existingByUni) {
      return NextResponse.json(
        { error: `${cleanUniversity} already has an ambassador code. Contact the team if you think this is a mistake.` },
        { status: 409 }
      )
    }

    // Generate a unique code seeded from the university name
    let code = generateCode(cleanUniversity)
    for (let i = 0; i < 5; i++) {
      const { data: clash } = await (db as any)
        .from('referral_codes')
        .select('id')
        .eq('code', code)
        .maybeSingle()
      if (!clash) break
      code = generateCode(cleanUniversity)
    }

    const { error: insertErr } = await (db as any)
      .from('referral_codes')
      .insert({
        ambassador_email: email.toLowerCase().trim(),
        ambassador_name:  application.full_name,
        code,
        university:       cleanUniversity,
      })

    if (insertErr) throw insertErr

    return NextResponse.json({ code, existing: false, university: cleanUniversity })
  } catch (err) {
    console.error('[ambassadors/referral] error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
