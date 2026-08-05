'use client'

import { useState, useEffect, useCallback } from 'react'

interface CVAttendee {
  id:          string
  email:       string
  name:        string | null
  ticket_code: string
  cv_url:      string | null
  created_at:  string
  orders: {
    ticket_type:  string
    buyer_name:   string
    buyer_email:  string
  }
}

interface Stats {
  total:    number
  uploaded: number
  pending:  number
}

type Filter = 'all' | 'uploaded' | 'pending'

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      {[180, 130, 100, 100, 90].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded bg-white/6 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function CVsManager() {
  const [attendees, setAttendees] = useState<CVAttendee[]>([])
  const [stats, setStats]         = useState<Stats>({ total: 0, uploaded: 0, pending: 0 })
  const [filter, setFilter]       = useState<Filter>('all')
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [downloading, setDownloading] = useState<string | null>(null)

  const load = useCallback(async (p: number, f: Filter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), filter: f })
      const res  = await fetch(`/api/admin/cvs?${params}`)
      const data = await res.json()
      setAttendees(data.attendees ?? [])
      setStats(data.stats ?? { total: 0, uploaded: 0, pending: 0 })
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(1, 'all') }, [load])

  function handleFilter(f: Filter) {
    setFilter(f)
    setPage(1)
    load(1, f)
  }

  function handlePage(p: number) {
    setPage(p)
    load(p, filter)
  }

  async function handleDownload(attendee: CVAttendee) {
    if (!attendee.cv_url) return
    setDownloading(attendee.id)
    try {
      const res  = await fetch(`/api/admin/cvs/download?path=${encodeURIComponent(attendee.cv_url)}`)
      const data = await res.json()
      if (data.url) {
        const a = document.createElement('a')
        a.href     = data.url
        a.download = `CV_${attendee.ticket_code}.${attendee.cv_url.split('.').pop()}`
        a.target   = '_blank'
        a.click()
      }
    } finally {
      setDownloading(null)
    }
  }

  const uploadRate = stats.total > 0 ? Math.round((stats.uploaded / stats.total) * 100) : 0

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/6 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-display font-[500] text-[18px] text-white">CV Submissions</h1>
          <p className="font-sans text-[12px] text-white/35 mt-0.5">Silver Pass holders only</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-white/6 shrink-0">
        <div className="bg-white/4 rounded-[12px] p-4">
          <p className="font-sans text-[11px] text-white/35 uppercase tracking-wider mb-1">Total Silver</p>
          <p className="font-display font-[500] text-[26px] text-white">{stats.total}</p>
        </div>
        <div className="bg-white/4 rounded-[12px] p-4">
          <p className="font-sans text-[11px] text-white/35 uppercase tracking-wider mb-1">CVs Uploaded</p>
          <p className="font-display font-[500] text-[26px] text-[#22c55e]">{stats.uploaded}</p>
        </div>
        <div className="bg-white/4 rounded-[12px] p-4">
          <p className="font-sans text-[11px] text-white/35 uppercase tracking-wider mb-1">Pending</p>
          <p className="font-display font-[500] text-[26px] text-[#FF2035]">{stats.pending}</p>
        </div>
      </div>

      {/* Upload progress bar */}
      {stats.total > 0 && (
        <div className="px-6 py-3 border-b border-white/6 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-sans text-[11px] text-white/40">Upload progress</p>
            <p className="font-sans text-[11px] text-white/40">{uploadRate}%</p>
          </div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${uploadRate}%`, background: '#22c55e' }}
            />
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="px-6 py-3 border-b border-white/6 flex items-center gap-2 shrink-0">
        {(['all', 'uploaded', 'pending'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className="px-3 py-1.5 rounded-[8px] font-sans text-[12px] font-semibold capitalize transition-colors"
            style={{
              background: filter === f ? 'rgba(255,32,53,0.15)' : 'transparent',
              color:      filter === f ? '#FF2035' : 'rgba(255,255,255,0.4)',
            }}
          >
            {f === 'all' ? `All (${stats.total})` : f === 'uploaded' ? `Uploaded (${stats.uploaded})` : `Pending (${stats.pending})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[700px]">
          <thead className="sticky top-0 bg-[#111111] z-10">
            <tr className="border-b border-white/6">
              {['Attendee', 'Ticket Code', 'Registered', 'CV Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-sans text-[11px] text-white/30 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : attendees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center font-sans text-[13px] text-white/25">
                  {filter === 'uploaded' ? 'No CVs uploaded yet' : filter === 'pending' ? 'Everyone has uploaded their CV 🎉' : 'No Silver Pass holders yet'}
                </td>
              </tr>
            ) : (
              attendees.map(a => (
                <tr key={a.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">

                  {/* Attendee */}
                  <td className="px-5 py-4 min-w-[200px]">
                    <p className="font-sans text-[13px] text-white leading-none">{a.name ?? a.email}</p>
                    {a.name && <p className="font-sans text-[11px] text-white/35 mt-0.5">{a.email}</p>}
                    <p className="font-sans text-[10px] text-white/20 mt-0.5">via {a.orders?.buyer_name}</p>
                  </td>

                  {/* Ticket code */}
                  <td className="px-5 py-4 font-mono text-[12px] text-white/55 tracking-wider whitespace-nowrap">
                    {a.ticket_code}
                  </td>

                  {/* Registered */}
                  <td className="px-5 py-4 font-sans text-[12px] text-white/40 whitespace-nowrap">
                    {fmtDate(a.created_at)}
                  </td>

                  {/* CV status */}
                  <td className="px-5 py-4">
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
                      {a.cv_url ? 'Uploaded' : 'Pending'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    {a.cv_url ? (
                      <button
                        onClick={() => handleDownload(a)}
                        disabled={downloading === a.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-sans text-[12px] font-semibold transition-all"
                        style={{
                          background: 'rgba(255,32,53,0.12)',
                          color:      '#FF2035',
                          opacity:    downloading === a.id ? 0.5 : 1,
                        }}
                      >
                        {downloading === a.id ? (
                          <span className="w-3 h-3 rounded-full border border-[#FF2035] border-t-transparent animate-spin" />
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        Download
                      </button>
                    ) : (
                      <span className="font-sans text-[11px] text-white/15">—</span>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/6 shrink-0">
          <p className="font-sans text-[12px] text-white/30">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-[8px] font-sans text-[12px] text-white/50 hover:text-white border border-white/10 hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-[8px] font-sans text-[12px] text-white/50 hover:text-white border border-white/10 hover:border-white/25 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
