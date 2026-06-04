'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Order {
  id: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  ticket_type: 'bronze' | 'silver' | 'gold'
  quantity: number
  unit_price: number
  discount_code: string | null
  discount_amount: number
  total_amount: number
  paystack_reference: string | null
  payment_status: 'completed' | 'pending' | 'failed'
  created_at: string
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold:   '#D4AF37',
}

const STATUS_COLORS: Record<string, string> = {
  completed: '#22c55e',
  pending:   '#D4AF37',
  failed:    '#FF2035',
}

function fmt(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[6px] font-sans text-[11px] font-semibold capitalize"
      style={{ background: (TIER_COLORS[tier] ?? '#fff') + '22', color: TIER_COLORS[tier] ?? 'white' }}
    >
      {tier}
    </span>
  )
}

/* ── Skeleton row ── */
function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      {[200, 100, 60, 80, 60, 100].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded-full bg-white/8 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function OrdersManager() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [stats, setStats]     = useState({ totalRevenue: 0, totalOrders: 0, totalAttendees: 0 })

  const [search, setSearch]   = useState('')
  const [tier, setTier]       = useState('')
  const [status, setStatus]   = useState('completed')

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), status })
    if (search) params.set('search', search)
    if (tier)   params.set('tier', tier)

    const res  = await fetch('/api/admin/orders?' + params)
    const data = await res.json()
    setOrders(data.orders ?? [])
    setTotal(data.total ?? 0)
    setStats(data.stats ?? { totalRevenue: 0, totalOrders: 0, totalAttendees: 0 })
    setPage(p)
    setLoading(false)
  }, [search, tier, status])

  useEffect(() => { load(1) }, [load])

  function handleSearch(v: string) {
    setSearch(v)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(1), 350)
  }

  /* ── CSV export ── */
  function exportCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Tier', 'Qty', 'Discount Code', 'Discount', 'Total', 'Status', 'Reference', 'Date']
    const rows = orders.map(o => [
      o.buyer_name,
      o.buyer_email,
      o.buyer_phone ?? '',
      o.ticket_type,
      o.quantity,
      o.discount_code ?? '',
      o.discount_amount,
      o.total_amount,
      o.payment_status,
      o.paystack_reference ?? '',
      fmtDate(o.created_at),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `lsce-orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-[500] text-white text-[24px] leading-none">Orders</h1>
          <p className="font-sans text-[13px] text-white/40 mt-1.5">All ticket purchases</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-sans text-[13px] font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/25 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: fmt(stats.totalRevenue), accent: true },
          { label: 'Total Orders',  value: String(stats.totalOrders) },
          { label: 'Attendees',     value: String(stats.totalAttendees) },
        ].map(s => (
          <div key={s.label} className="bg-[#161616] border border-white/6 rounded-[14px] px-5 py-4">
            <p className="font-sans text-[11px] text-white/40 uppercase tracking-wider">{s.label}</p>
            <p className="font-display font-[500] text-[22px] mt-1" style={{ color: s.accent ? '#FF2035' : 'white' }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search name, email, or reference…"
            className="w-full bg-[#161616] border border-white/12 rounded-[10px] pl-9 pr-4 py-2.5 font-sans text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Tier filter */}
        <select
          value={tier}
          onChange={e => { setTier(e.target.value); load(1) }}
          className="bg-[#161616] border border-white/12 rounded-[10px] px-3 py-2.5 font-sans text-[13px] text-white/70 outline-none focus:border-white/30 transition-colors"
        >
          <option value="">All tiers</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>

        {/* Status filter */}
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); load(1) }}
          className="bg-[#161616] border border-white/12 rounded-[10px] px-3 py-2.5 font-sans text-[13px] text-white/70 outline-none focus:border-white/30 transition-colors"
        >
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                {['Buyer', 'Ticket', 'Qty', 'Total', 'Status', 'Date', 'Reference'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[11px] text-white/30 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center font-sans text-[13px] text-white/25">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5 min-w-[180px]">
                      <p className="font-sans text-[13px] text-white leading-none">{o.buyer_name}</p>
                      <p className="font-sans text-[11px] text-white/35 mt-0.5">{o.buyer_email}</p>
                      {o.buyer_phone && (
                        <p className="font-sans text-[11px] text-white/25 mt-0.5">{o.buyer_phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <TierBadge tier={o.ticket_type} />
                      {o.discount_code && (
                        <p className="font-sans text-[10px] text-white/30 mt-1">{o.discount_code}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-[13px] text-white/70">{o.quantity}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-display font-[500] text-[13px] text-white">{fmt(o.total_amount)}</p>
                      {o.discount_amount > 0 && (
                        <p className="font-sans text-[10px] text-white/30">-{fmt(o.discount_amount)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold"
                        style={{ color: STATUS_COLORS[o.payment_status] ?? 'white' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[o.payment_status] }} />
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-[12px] text-white/40 whitespace-nowrap">
                      {fmtDate(o.created_at)}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-[11px] text-white/30 font-mono whitespace-nowrap">
                      {o.paystack_reference?.replace('LSCE-', '') ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/6">
            <p className="font-sans text-[12px] text-white/30">
              Page {page} of {totalPages} · {total} orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-[8px] font-sans text-[12px] text-white/50 hover:text-white border border-white/10 hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-[8px] font-sans text-[12px] text-white/50 hover:text-white border border-white/10 hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
