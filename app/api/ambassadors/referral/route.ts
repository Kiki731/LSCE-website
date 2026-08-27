import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

function generateCode(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${first}-${suffix}`
}

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json() as { name?: string; email?: string }

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    const db = await createSupabaseAdminClient()

    // Check if this email belongs to an approved ambassador application
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

    // Return existing code if already generated
    const { data: existing } = await (db as any)
      .from('referral_codes')
      .select('code')
      .eq('ambassador_email', email.toLowerCase().trim())
      .single()

    if (existing) {
      return NextResponse.json({ code: existing.code, existing: true })
    }

    // Generate a unique code (retry on collision — extremely rare)
    let code = generateCode(application.full_name)
    for (let i = 0; i < 5; i++) {
      const { data: clash } = await (db as any)
        .from('referral_codes')
        .select('id')
        .eq('code', code)
        .maybeSingle()
      if (!clash) break
      code = generateCode(application.full_name)
    }

    const { error: insertErr } = await (db as any)
      .from('referral_codes')
      .insert({ ambassador_email: email.toLowerCase().trim(), ambassador_name: application.full_name, code })

    if (insertErr) throw insertErr

    return NextResponse.json({ code, existing: false })
  } catch (err) {
    console.error('[ambassadors/referral] error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
