'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface AttendeeOrder {
  id: string
  buyer_name: string
  buyer_email: string
  ticket_type: 'bronze' | 'silver' | 'gold'
  quantity: number
  total_amount: number
  paystack_reference: string | null
}

interface Attendee {
  id: string
  email: string
  name: string | null
  ticket_code: string
  checked_in: boolean
  checked_in_at: string | null
  created_at: string
  cv_url: string | null
  orders: AttendeeOrder
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold:   '#D4AF37',
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
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

function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      {[180, 120, 80, 60, 100, 140].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded-full bg-white/8 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function AttendeesManager() {
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading]     = useState(true)
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [stats, setStats]         = useState({ total: 0, checkedIn: 0 })
  const [toggling, setToggling]   = useState<string | null>(null)

  const [search, setSearch]       = useState('')
  const [checkedIn, setCheckedIn] = useState('')
  const [tier, setTier]           = useState('')

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (search)    params.set('search', search)
    if (checkedIn) params.set('checked_in', checkedIn)
    if (tier)      params.set('tier', tier)

    const res  = await fetch('/api/admin/attendees?' + params)
    const data = await res.json()
    setAttendees(data.attendees ?? [])
    setTotal(data.total ?? 0)
    setStats(data.stats ?? { total: 0, checkedIn: 0 })
    setPage(p)
    setLoading(false)
  }, [search, checkedIn, tier])

  useEffect(() => { load(1) }, [load])

  function handleSearch(v: string) {
    setSearch(v)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => load(1), 350)
  }

  async function toggleCheckIn(a: Attendee) {
    setToggling(a.id)
    const res = await fetch(`/api/admin/attendees/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked_in: !a.checked_in }),
    })
    if (res.ok) {
      setAttendees(prev => prev.map(x =>
        x.id === a.id
          ? { ...x, checked_in: !a.checked_in, checked_in_at: !a.checked_in ? new Date().toISOString() : null }
          : x
      ))
      setStats(prev => ({
        ...prev,
        checkedIn: !a.checked_in ? prev.checkedIn + 1 : prev.checkedIn - 1,
      }))
    }
    setToggling(null)
  }

  function exportCSV() {
    const headers = ['Name', 'Email', 'Ticket Code', 'Tier', 'Buyer Name', 'Buyer Email', 'CV Uploaded', 'Checked In', 'Check-in Time', 'Registered']
    const rows = attendees.map(a => [
      a.name ?? '',
      a.email,
      a.ticket_code,
      a.orders?.ticket_type ?? '',
      a.orders?.buyer_name ?? '',
      a.orders?.buyer_email ?? '',
      a.cv_url ? 'Yes' : 'No',
      a.checked_in ? 'Yes' : 'No',
      fmtDate(a.checked_in_at),
      fmtDate(a.created_at),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `lsce-attendees-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages  = Math.ceil(total / 25)
  const checkInPct  = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-[500] text-white text-[24px] leading-none">Attendees</h1>
          <p className="font-sans text-[13px] text-white/40 mt-1.5">All confirmed ticket holders</p>
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

      {/* Check-in progress */}
      <div className="bg-[#161616] border border-white/6 rounded-[14px] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-sans text-[11px] text-white/40 uppercase tracking-wider">Check-in Progress</p>
            <p className="font-display font-[500] text-[22px] text-white mt-0.5">
              {stats.checkedIn} <span className="text-white/30 text-[16px]">/ {stats.total}</span>
            </p>
          </div>
          <span
            className="font-display font-[500] text-[28px]"
            style={{ color: checkInPct > 70 ? '#22c55e' : checkInPct > 30 ? '#D4AF37' : 'white' }}
          >
            {checkInPct}%
          </span>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${checkInPct}%`,
              background: checkInPct > 70 ? '#22c55e' : checkInPct > 30 ? '#D4AF37' : '#FF2035',
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search email, name, or ticket code…"
            className="w-full bg-[#161616] border border-white/12 rounded-[10px] pl-9 pr-4 py-2.5 font-sans text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/30 transition-colors"
          />
        </div>
        <select
          value={checkedIn}
          onChange={e => { setCheckedIn(e.target.value); load(1) }}
          className="bg-[#161616] border border-white/12 rounded-[10px] px-3 py-2.5 font-sans text-[13px] text-white/70 outline-none focus:border-white/30 transition-colors"
        >
          <option value="">All attendees</option>
          <option value="true">Checked in</option>
          <option value="false">Not checked in</option>
        </select>
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
      </div>

      {/* Table */}
      <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                {['Attendee', 'Ticket Code', 'Tier', 'Buyer', 'Registered', 'CV', 'Check-in'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[11px] text-white/30 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : attendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center font-sans text-[13px] text-white/25">
                    No attendees found
                  </td>
                </tr>
              ) : (
                attendees.map(a => (
                  <tr key={a.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5 min-w-[180px]">
                      <p className="font-sans text-[13px] text-white leading-none">{a.email}</p>
                      {a.name && <p className="font-sans text-[11px] text-white/35 mt-0.5">{a.name}</p>}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-sans text-[12px] text-white/60 tracking-wider">
                      {a.ticket_code}
                    </td>
                    <td className="px-5 py-3.5">
                      <TierBadge tier={a.orders?.ticket_type ?? 'bronze'} />
                    </td>
                    <td className="px-5 py-3.5 min-w-[160px]">
                      <p className="font-sans text-[12px] text-white/60 leading-none">{a.orders?.buyer_name ?? '—'}</p>
                      <p className="font-sans text-[11px] text-white/30 mt-0.5">{a.orders?.buyer_email ?? ''}</p>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-[12px] text-white/40 whitespace-nowrap">
                      {fmtDate(a.created_at)}
                    </td>
                    {/* CV status — only relevant for silver tickets */}
                    <td className="px-5 py-3.5">
                      {a.orders?.ticket_type === 'silver' ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] font-sans text-[11px] font-semibold"
                          style={{
                            background: a.cv_url ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                            color:      a.cv_url ? '#22c55e'               : 'rgba(255,255,255,0.3)',
                          }}
                        >
                          {a.cv_url ? (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <span className="w-2 h-2 rounded-full border border-current opacity-50 inline-block" />
                          )}
                          {a.cv_url ? 'CV uploaded' : 'No CV'}
                        </span>
                      ) : (
                        <span className="font-sans text-[11px] text-white/15">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleCheckIn(a)}
                        disabled={toggling === a.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] font-sans text-[12px] font-semibold transition-all"
                        style={{
                          background: a.checked_in ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                          color:      a.checked_in ? '#22c55e' : 'rgba(255,255,255,0.4)',
                          opacity:    toggling === a.id ? 0.5 : 1,
                        }}
                      >
                        {toggling === a.id ? (
                          <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                        ) : a.checked_in ? (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <span className="w-3 h-3 rounded-full border border-current opacity-50" />
                        )}
                        {a.checked_in ? 'Checked in' : 'Check in'}
                      </button>
                      {a.checked_in_at && (
                        <p className="font-sans text-[10px] text-white/25 mt-1 pl-0.5">{fmtDate(a.checked_in_at)}</p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/6">
            <p className="font-sans text-[12px] text-white/30">
              Page {page} of {totalPages} · {total} attendees
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
