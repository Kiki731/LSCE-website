import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient, createSupabaseServerClient } from '@/lib/supabase-server'
import { sendTicketConfirmation } from '@/lib/email'
import { TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

/**
 * Reconciles live Paystack transactions against the orders table.
 *
 * Exists because a payment is only ever recorded by one of two paths — the
 * browser calling create-order, or the Paystack webhook. When both fail the
 * payment is invisible to us entirely. This endpoint is the source of truth.
 */

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

interface PsTxn {
  reference:  string
  status:     string
  amount:     number
  channel?:   string
  paid_at?:   string
  createdAt?: string
  customer?:  { email?: string }
  metadata?:  Record<string, unknown> | string
}

async function fetchAllPaystack(): Promise<PsTxn[]> {
  const out: PsTxn[] = []
  for (let page = 1; page <= 20; page++) {
    const res = await fetch(`https://api.paystack.co/transaction?perPage=100&page=${page}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: 'no-store',
    })
    if (!res.ok) break
    const json = await res.json()
    const rows = (json?.data ?? []) as PsTxn[]
    out.push(...rows)
    if (rows.length < 100) break
  }
  return out
}

function parseMeta(m: PsTxn['metadata']): Record<string, unknown> {
  if (!m) return {}
  if (typeof m === 'string') {
    try { return JSON.parse(m) as Record<string, unknown> } catch { return {} }
  }
  return m
}

function shape(t: PsTxn) {
  const m = parseMeta(t.metadata)
  return {
    reference:   t.reference,
    email:       t.customer?.email ?? '',
    amount:      (t.amount ?? 0) / 100,
    channel:     t.channel ?? '',
    when:        t.paid_at ?? t.createdAt ?? '',
    buyerName:   (m.buyer_name as string) ?? '',
    buyerPhone:  (m.buyer_phone as string) ?? null,
    ticketType:  (m.ticket_type as string) ?? '',
    quantity:    Number(m.quantity ?? 1),
    discountCode:   (m.discount_code as string) ?? null,
    referralCode:   (m.referral_code as string) ?? null,
    attendeeEmails: Array.isArray(m.attendee_emails) ? (m.attendee_emails as string[]) : [],
    breakouts:      Array.isArray(m.breakouts) ? (m.breakouts as string[]) : [],
  }
}

/* ── GET /api/admin/reconcile — live Paystack vs DB diff ── */
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let txns: PsTxn[]
  try {
    txns = await fetchAllPaystack()
  } catch {
    return NextResponse.json({ error: 'Could not reach Paystack' }, { status: 502 })
  }

  const { data: orders } = await db.from('orders').select('paystack_reference, buyer_email').limit(5000)
  const { data: seats }  = await db.from('attendees').select('email').limit(10000)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const refs = new Set<string>((orders ?? []).map((o: any) => o.paystack_reference).filter(Boolean))
  const ticketed = new Set<string>([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(orders ?? []).map((o: any) => (o.buyer_email ?? '').toLowerCase()),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(seats  ?? []).map((a: any) => (a.email ?? '').toLowerCase()),
  ].filter(Boolean))

  const success = txns.filter(t => t.status === 'success')

  // Paid, but no order in our DB — these people are owed a ticket.
  const orphans = success.filter(t => !refs.has(t.reference)).map(shape)

  // Started checkout, never paid, and still has no ticket under that email.
  const seen = new Map<string, ReturnType<typeof shape>>()
  for (const t of txns) {
    if (t.status === 'success') continue
    const email = (t.customer?.email ?? '').toLowerCase()
    if (!email || ticketed.has(email)) continue
    seen.set(email, shape(t))
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    summary: {
      paystackTotal: txns.length,
      success:       success.length,
      abandoned:     txns.filter(t => t.status === 'abandoned').length,
      failed:        txns.filter(t => t.status === 'failed').length,
      ordersInDb:    refs.size,
      orphanCount:   orphans.length,
      orphanValue:   orphans.reduce((s, o) => s + o.amount, 0),
      abandonedMailable: seen.size,
    },
    orphans,
    abandoned: [...seen.values()].sort((a, b) => (b.when || '').localeCompare(a.when || '')),
  })
}

/* ── POST /api/admin/reconcile — recover one paid-but-missing order ── */
export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reference } = await req.json() as { reference?: string }
  if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 })

  // Verify against Paystack — never trust a reference supplied by the client.
  const vRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    cache: 'no-store',
  })
  const vJson = await vRes.json()
  if (!vJson?.status || vJson?.data?.status !== 'success') {
    return NextResponse.json({ error: 'Transaction is not a successful payment' }, { status: 400 })
  }

  const t = shape(vJson.data as PsTxn)
  const tier = t.ticketType as TicketTier
  if (!TICKET_TYPES[tier]) {
    return NextResponse.json({ error: 'Transaction has no usable ticket_type in metadata' }, { status: 422 })
  }

  const supabase = await createSupabaseAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: existing } = await db
    .from('orders').select('id').eq('paystack_reference', reference).maybeSingle()
  if (existing) return NextResponse.json({ alreadyExists: true, orderId: existing.id })

  const unitPrice = TICKET_TYPES[tier].price
  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({
      buyer_name:         t.buyerName || t.email,
      buyer_email:        t.email,
      buyer_phone:        t.buyerPhone,
      ticket_type:        tier,
      quantity:           t.quantity,
      unit_price:         unitPrice,
      discount_code:      t.discountCode,
      discount_amount:    Math.max(0, Math.round(unitPrice * t.quantity - t.amount)),
      total_amount:       Math.round(t.amount),
      paystack_reference: reference,
      payment_status:     'completed',
      referral_code:      t.referralCode,
    })
    .select('id')
    .single()

  if (orderErr) {
    console.error('[reconcile] order insert failed:', orderErr)
    return NextResponse.json({ error: 'Could not create order' }, { status: 500 })
  }

  const seatEmails = Array.from({ length: t.quantity },
    (_, i) => (t.attendeeEmails[i]?.includes('@') ? t.attendeeEmails[i] : t.email))

  const { data: inserted } = await db
    .from('attendees')
    .insert(seatEmails.map(email => ({
      order_id:  order.id,
      email,
      name:      email.toLowerCase() === t.email.toLowerCase() ? (t.buyerName || null) : null,
      breakouts: t.breakouts,
    })))
    .select('ticket_code, email')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ticketCodes: string[] = (inserted ?? []).map((a: any) => a.ticket_code as string)

  let emailed = true
  try {
    await sendTicketConfirmation({
      orderId:     order.id,
      buyerName:   t.buyerName || t.email,
      buyerEmail:  t.email,
      ticketType:  tier,
      quantity:    t.quantity,
      totalAmount: Math.round(t.amount),
      paystackRef: reference,
      ticketCodes,
      breakouts:   t.breakouts,
    })
  } catch (err) {
    console.error('[reconcile] confirmation email failed:', err)
    emailed = false
  }

  return NextResponse.json({ recovered: true, orderId: order.id, ticketCodes, emailed })
}
