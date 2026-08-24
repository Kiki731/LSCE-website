'use client'

import { useEffect, useState, useCallback } from 'react'

interface Application {
  id:          string
  full_name:   string
  email:       string
  phone:       string
  university:  string
  course:      string
  year:        string
  instagram:   string | null
  why_apply:   string
  status:      'pending' | 'approved' | 'rejected'
  created_at:  string
}

interface Stats {
  total:    number
  pending:  number
  approved: number
  rejected: number
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

const STATUS_COLORS: Record<string, string> = {
  pending:  '#D4AF37',
  approved: '#22c55e',
  rejected: '#FF2035',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? '#fff'
  return (
    <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold capitalize"
      style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      {[160, 120, 60, 80, 70, 100].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded-full bg-white/8 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function ApplicationsManager() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats]               = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [filter, setFilter]             = useState<Filter>('all')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [updating, setUpdating]         = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/admin/applications?status=${filter}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load')
      setApplications(data.applications)
      setStats(data.stats)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      setStats(prev => {
        const old = applications.find(a => a.id === id)?.status ?? 'pending'
        return { ...prev, [old]: Math.max(0, prev[old] - 1), [status]: prev[status] + 1 }
      })
    } catch {
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const FILTERS: { label: string; value: Filter; count: number }[] = [
    { label: 'All',      value: 'all',      count: stats.total    },
    { label: 'Pending',  value: 'pending',  count: stats.pending  },
    { label: 'Approved', value: 'approved', count: stats.approved },
    { label: 'Rejected', value: 'rejected', count: stats.rejected },
  ]

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-[500] text-white text-[22px] leading-none">Ambassador Applications</h1>
        <p className="font-sans text-[13px] text-white/40 mt-1">Review and manage campus ambassador applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: stats.total,    color: 'text-white' },
          { label: 'Pending',  value: stats.pending,  color: 'text-[#D4AF37]' },
          { label: 'Approved', value: stats.approved, color: 'text-[#22c55e]' },
          { label: 'Rejected', value: stats.rejected, color: 'text-[#FF2035]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/4 border border-white/6 rounded-[12px] px-4 py-4">
            <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider">{label}</p>
            <p className={`font-display font-[500] text-[28px] mt-1 leading-none ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/4 border border-white/6 rounded-[10px] p-1 w-fit">
        {FILTERS.map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className="px-4 py-2 rounded-[8px] font-sans text-[12px] transition-all"
            style={{
              background: filter === value ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: filter === value ? '#fff' : 'rgba(255,255,255,0.35)',
            }}
          >
            {label}
            <span className="ml-1.5 text-[10px] opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {error ? (
        <div className="bg-[#FF2035]/10 border border-[#FF2035]/20 text-[#FF2035] rounded-[10px] p-4 font-sans text-[13px]">
          {error}
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/6 rounded-[12px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/6">
              <tr>
                {['Applicant', 'University', 'Year', 'Applied', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-sans text-[10px] text-white/35 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center font-sans text-[13px] text-white/25">
                    No applications yet.
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <>
                    <tr
                      key={app.id}
                      className="border-b border-white/4 cursor-pointer transition-colors hover:bg-white/3"
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                    >
                      <td className="px-5 py-4">
                        <p className="font-sans text-[13px] text-white font-semibold leading-none">{app.full_name}</p>
                        <p className="font-sans text-[11px] text-white/40 mt-0.5">{app.email}</p>
                      </td>
                      <td className="px-5 py-4 font-sans text-[13px] text-white/60">{app.university}</td>
                      <td className="px-5 py-4 font-sans text-[13px] text-white/60 whitespace-nowrap">{app.year}</td>
                      <td className="px-5 py-4 font-sans text-[12px] text-white/35 whitespace-nowrap">{fmtDate(app.created_at)}</td>
                      <td className="px-5 py-4"><StatusBadge status={app.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          {app.status !== 'approved' && (
                            <button
                              onClick={() => updateStatus(app.id, 'approved')}
                              disabled={updating === app.id}
                              className="font-sans text-[11px] px-2.5 py-1.5 rounded-[6px] transition-colors disabled:opacity-40"
                              style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
                            >
                              Approve
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => updateStatus(app.id, 'rejected')}
                              disabled={updating === app.id}
                              className="font-sans text-[11px] px-2.5 py-1.5 rounded-[6px] transition-colors disabled:opacity-40"
                              style={{ background: 'rgba(255,32,53,0.12)', color: '#FF2035' }}
                            >
                              Reject
                            </button>
                          )}
                          {app.status !== 'pending' && (
                            <button
                              onClick={() => updateStatus(app.id, 'pending')}
                              disabled={updating === app.id}
                              className="font-sans text-[11px] px-2.5 py-1.5 rounded-[6px] transition-colors disabled:opacity-40"
                              style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {expandedId === app.id && (
                      <tr key={`${app.id}-expanded`}>
                        <td colSpan={6} className="px-5 py-5 bg-white/3 border-b border-white/4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider mb-1">Course</p>
                              <p className="font-sans text-[13px] text-white/70">{app.course}</p>
                            </div>
                            <div>
                              <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider mb-1">Phone</p>
                              <p className="font-sans text-[13px] text-white/70">{app.phone}</p>
                            </div>
                            {app.instagram && (
                              <div>
                                <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider mb-1">Instagram</p>
                                <p className="font-sans text-[13px] text-white/70">{app.instagram}</p>
                              </div>
                            )}
                            <div className="md:col-span-2">
                              <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider mb-1">Why they want to apply</p>
                              <p className="font-sans text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap">{app.why_apply}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
