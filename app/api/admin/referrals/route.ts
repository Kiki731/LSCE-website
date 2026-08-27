import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const auth = await createSupabaseServerClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createSupabaseAdminClient()

  // Fetch all referral codes
  const { data: codes, error } = await (db as any)
    .from('referral_codes')
    .select('id, code, ambassador_name, ambassador_email, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[referrals] fetch error:', error)
    return NextResponse.json({ error: 'Failed to load referrals' }, { status: 500 })
  }

  // For each code, count sales and sum revenue from completed orders
  const enriched = await Promise.all(
    (codes ?? []).map(async (row: any) => {
      const { data: orders } = await (db as any)
        .from('orders')
        .select('quantity, total_amount')
        .eq('referral_code', row.code)
        .eq('payment_status', 'completed')

      const sales   = (orders ?? []).reduce((s: number, o: any) => s + (o.quantity ?? 0), 0)
      const revenue = (orders ?? []).reduce((s: number, o: any) => s + (o.total_amount ?? 0), 0)

      return { ...row, sales, revenue }
    })
  )

  return NextResponse.json({ referrals: enriched })
}
