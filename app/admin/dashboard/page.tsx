import { createSupabaseAdminClient } from '@/lib/supabase-server'
import { TICKET_TYPES } from '@/lib/ticket-config'

export const metadata = { title: 'Dashboard — LSCE Admin' }
export const revalidate = 60  // re-fetch stats every 60 seconds

/* ── Stat card ── */
function StatCard({
  label, value, sub, accent = false,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="bg-[#161616] border border-white/6 rounded-[16px] p-5 flex flex-col gap-2">
      <p className="font-sans text-[11px] text-white/40 uppercase tracking-wider">{label}</p>
      <p
        className="font-display font-[500] text-[28px] leading-none"
        style={{ color: accent ? '#FF2035' : 'white' }}
      >
        {value}
      </p>
      {sub && <p className="font-sans text-[12px] text-white/30">{sub}</p>}
    </div>
  )
}

/* ── Tier badge ── */
const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold:   '#D4AF37',
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[6px] font-sans text-[11px] font-semibold capitalize"
      style={{
        background: TIER_COLORS[tier] + '22',
        color:      TIER_COLORS[tier] ?? 'white',
      }}
    >
      {tier}
    </span>
  )
}

/* ── Page ── */
export default async function DashboardPage() {
  const supabase = await createSupabaseAdminClient()

  // Parallel data fetch
  const [ordersResult, recentResult] = await Promise.all([
    supabase
      .from('orders')
      .select('ticket_type, quantity, total_amount')
      .eq('payment_status', 'completed'),

    supabase
      .from('orders')
      .select('id, buyer_name, buyer_email, ticket_type, quantity, total_amount, created_at')
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  type OrderSummaryRow = { ticket_type: string; quantity: number; total_amount: number }
  type RecentOrderRow  = {
    id: string; buyer_name: string; buyer_email: string
    ticket_type: string; quantity: number; total_amount: number; created_at: string
  }

  const orders = (ordersResult.data ?? []) as OrderSummaryRow[]
  const recent = (recentResult.data ?? []) as RecentOrderRow[]

  const totalRevenue   = orders.reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const totalOrders    = orders.length
  const totalAttendees = orders.reduce((s, o) => s + (o.quantity ?? 0), 0)

  const byTier = (['bronze', 'silver', 'gold'] as const).map(tier => {
    const tierOrders = orders.filter(o => o.ticket_type === tier)
    return {
      tier,
      name:     TICKET_TYPES[tier].name,
      count:    tierOrders.reduce((s, o) => s + (o.quantity ?? 0), 0),
      revenue:  tierOrders.reduce((s, o) => s + (o.total_amount ?? 0), 0),
    }
  })

  function fmt(n: number) {
    return '₦' + n.toLocaleString('en-NG')
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-NG', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="p-8 flex flex-col gap-8">

      {/* Page header */}
      <div>
        <h1 className="font-display font-[500] text-white text-[24px] leading-none">Dashboard</h1>
        <p className="font-sans text-[13px] text-white/40 mt-1.5">
          Live overview of LSCE 2026 ticket sales
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={fmt(totalRevenue)}
          accent
        />
        <StatCard
          label="Total Orders"
          value={String(totalOrders)}
          sub={totalOrders === 1 ? '1 transaction' : `${totalOrders} transactions`}
        />
        <StatCard
          label="Attendees"
          value={String(totalAttendees)}
          sub="confirmed seats"
        />
        <StatCard
          label="Capacity Used"
          value={totalAttendees > 0 ? Math.min(Math.round((totalAttendees / 500) * 100), 100) + '%' : '0%'}
          sub="of 500 total seats"
        />
      </div>

      {/* Breakdown by tier */}
      <div>
        <h2 className="font-display font-[500] text-white/70 text-[13px] uppercase tracking-wider mb-4">
          Sales by Tier
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {byTier.map(t => (
            <div key={t.tier} className="bg-[#161616] border border-white/6 rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-3">
                <TierBadge tier={t.tier} />
                <span className="font-display font-[500] text-white text-[18px]">{t.count}</span>
              </div>
              <p className="font-sans text-[12px] text-white/30">{t.name}</p>
              <p className="font-sans text-[13px] text-white/60 mt-1">{fmt(t.revenue)}</p>

              {/* Progress bar */}
              <div className="mt-3 h-1 bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: totalAttendees > 0 ? `${Math.round((t.count / totalAttendees) * 100)}%` : '0%',
                    background: TIER_COLORS[t.tier],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders table */}
      <div>
        <h2 className="font-display font-[500] text-white/70 text-[13px] uppercase tracking-wider mb-4">
          Recent Orders
        </h2>
        <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                {['Buyer', 'Ticket', 'Qty', 'Amount', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[11px] text-white/30 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center font-sans text-[13px] text-white/25">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recent.map((order, i) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-sans text-[13px] text-white">{order.buyer_name}</p>
                      <p className="font-sans text-[11px] text-white/35">{order.buyer_email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <TierBadge tier={order.ticket_type} />
                    </td>
                    <td className="px-5 py-3.5 font-sans text-[13px] text-white/70">
                      {order.quantity}
                    </td>
                    <td className="px-5 py-3.5 font-display font-[500] text-[13px] text-white">
                      {fmt(order.total_amount)}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-[12px] text-white/40">
                      {fmtDate(order.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
