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

interface Attendee {
  id: string
  email: string
  name: string | null
  ticket_code: string
  checked_in: boolean
  checked_in_at: string | null
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

function fmt(n: number) { return '₦' + n.toLocaleString('en-NG') }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] font-sans text-[11px] font-semibold capitalize"
      style={{ background: (TIER_COLORS[tier] ?? '#fff') + '22', color: TIER_COLORS[tier] ?? 'white' }}>
      {tier}
    </span>
  )
}

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

/* ── Order Detail Sidebar ─────────────────────────────────────────────────── */
function OrderSidebar({ order, onClose }: { order: Order; onClose: () => void }) {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading]    = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/attendees/by-order/${order.id}`)
      .then(r => r.json())
      .then(data => { setAttendees(data.attendees ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [order.id])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const tierColor = TIER_COLORS[order.ticket_type] ?? '#FF2035'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#111111] border-l border-white/8 z-50 flex flex-col overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <div>
            <p className="font-display font-[500] text-white text-[15px] leading-none">Order Details</p>
            <p className="font-mono text-[11px] text-white/30 mt-0.5">
              {order.paystack_reference ?? order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Tier stripe */}
          <div className="h-1 rounded-full w-full" style={{ background: tierColor }} />

          {/* Buyer */}
          <div className="flex flex-col gap-1">
            <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider">Buyer</p>
            <p className="font-display font-[500] text-white text-[16px]">{order.buyer_name}</p>
            <p className="font-sans text-[12px] text-white/50">{order.buyer_email}</p>
            {order.buyer_phone && <p className="font-sans text-[12px] text-white/40">{order.buyer_phone}</p>}
          </div>

          <div className="h-px bg-white/6" />

          {/* Order summary grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Ticket', value: <TierBadge tier={order.ticket_type} /> },
              { label: 'Seats', value: <span className="font-display font-[500] text-white text-[16px]">{order.quantity}</span> },
              { label: 'Unit Price', value: <span className="font-sans text-[13px] text-white/70">{fmt(order.unit_price)}</span> },
              { label: 'Total Paid', value: <span className="font-display font-[500] text-[#FF2035] text-[16px]">{fmt(order.total_amount)}</span> },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/4 rounded-[10px] px-3 py-3">
                <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider mb-1">{label}</p>
                {value}
              </div>
            ))}
          </div>

          {/* Discount */}
          {order.discount_code && (
            <div className="flex items-center justify-between bg-white/4 rounded-[10px] px-3 py-2.5">
              <span className="font-sans text-[12px] text-white/50">Coupon: {order.discount_code}</span>
              <span className="font-sans text-[12px] text-green-400">−{fmt(order.discount_amount)}</span>
            </div>
          )}

          {/* Status + date */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold capitalize"
              style={{ color: STATUS_COLORS[order.payment_status] ?? 'white' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[order.payment_status] }} />
              {order.payment_status}
            </span>
            <span className="font-sans text-[11px] text-white/35">{fmtDate(order.created_at)}</span>
          </div>

          <div className="h-px bg-white/6" />

          {/* Attendees */}
          <div>
            <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider mb-3">
              Attendees ({order.quantity} seat{order.quantity !== 1 ? 's' : ''})
            </p>

            {loading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: order.quantity }).map((_, i) => (
                  <div key={i} className="h-14 rounded-[10px] bg-white/4 animate-pulse" />
                ))}
              </div>
            ) : attendees.length === 0 ? (
              <p className="font-sans text-[12px] text-white/25 italic">
                No attendee records found. They may not have been created yet.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {attendees.map((a, i) => (
                  <div key={a.id} className="bg-white/4 rounded-[10px] px-3 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <p className="font-sans text-[12px] text-white/70 leading-none truncate">
                          {a.name
                            ? <><span className="text-white font-semibold">{a.name}</span> · {a.email}</>
                            : a.email
                          }
                        </p>
                        {!a.name && (
                          <p className="font-sans text-[10px] text-yellow-500/70 mt-0.5">
                            Ticket not yet claimed
                          </p>
                        )}
                      </div>
                      <span
                        className="inline-flex items-center gap-1 font-sans text-[10px] font-semibold shrink-0"
                        style={{ color: a.checked_in ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>
                        {a.checked_in ? (
                          <><svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>In</>
                        ) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-[11px] text-white/40 tracking-wider">
                        Seat {i + 1} · {a.ticket_code}
                      </code>
                      {a.checked_in_at && (
                        <span className="font-sans text-[10px] text-white/25">
                          {new Date(a.checked_in_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

/* ── Main manager ────────────────────────────────────────────────────────── */
export default function OrdersManager() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [stats, setStats]     = useState({ totalRevenue: 0, totalOrders: 0, totalAttendees: 0 })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

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

  function exportCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Tier', 'Qty', 'Discount Code', 'Discount', 'Total', 'Status', 'Reference', 'Date']
    const rows = orders.map(o => [
      o.buyer_name, o.buyer_email, o.buyer_phone ?? '', o.ticket_type,
      o.quantity, o.discount_code ?? '', o.discount_amount, o.total_amount,
      o.payment_status, o.paystack_reference ?? '', fmtDate(o.created_at),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `lsce-orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Sidebar */}
      {selectedOrder && (
        <OrderSidebar
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-[500] text-white text-[24px] leading-none">Orders</h1>
          <p className="font-sans text-[13px] text-white/40 mt-1.5">Click any row to see full details</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-sans text-[13px] font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/25 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats */}
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
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
            placeholder="Search name, email, or reference…"
            className="w-full bg-[#161616] border border-white/12 rounded-[10px] pl-9 pr-4 py-2.5 font-sans text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <select value={tier} onChange={e => { setTier(e.target.value); load(1) }}
          className="bg-[#161616] border border-white/12 rounded-[10px] px-3 py-2.5 font-sans text-[13px] text-white/70 outline-none focus:border-white/30 transition-colors">
          <option value="">All tiers</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); load(1) }}
          className="bg-[#161616] border border-white/12 rounded-[10px] px-3 py-2.5 font-sans text-[13px] text-white/70 outline-none focus:border-white/30 transition-colors">
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
                  <td colSpan={7} className="px-5 py-12 text-center font-sans text-[13px] text-white/25">No orders found</td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="border-b border-white/4 last:border-0 hover:bg-white/3 cursor-pointer transition-colors"
                    style={{ background: selectedOrder?.id === o.id ? 'rgba(255,32,53,0.05)' : undefined }}
                  >
                    <td className="px-5 py-3.5 min-w-[180px]">
                      <p className="font-sans text-[13px] text-white leading-none">{o.buyer_name}</p>
                      <p className="font-sans text-[11px] text-white/35 mt-0.5">{o.buyer_email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <TierBadge tier={o.ticket_type} />
                      {o.discount_code && <p className="font-sans text-[10px] text-white/30 mt-1">{o.discount_code}</p>}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-[13px] text-white/70">{o.quantity}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-display font-[500] text-[13px] text-white">{fmt(o.total_amount)}</p>
                      {o.discount_amount > 0 && <p className="font-sans text-[10px] text-white/30">−{fmt(o.discount_amount)}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold"
                        style={{ color: STATUS_COLORS[o.payment_status] ?? 'white' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[o.payment_status] }} />
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-[12px] text-white/40 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                    <td className="px-5 py-3.5 font-sans text-[11px] text-white/30 font-mono whitespace-nowrap">
                      {o.paystack_reference?.replace('LSCE-', '') ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/6">
            <p className="font-sans text-[12px] text-white/30">Page {page} of {totalPages} · {total} orders</p>
            <div className="flex items-center gap-2">
              <button onClick={() => load(page - 1)} disabled={page <= 1}
                className="px-3 py-1.5 rounded-[8px] font-sans text-[12px] text-white/50 hover:text-white border border-white/10 hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                ← Prev
              </button>
              <button onClick={() => load(page + 1)} disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-[8px] font-sans text-[12px] text-white/50 hover:text-white border border-white/10 hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
