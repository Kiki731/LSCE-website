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
  pending:  'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
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
      const res  = await fetch(`/api/admin/applications/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setApplications(prev =>
        prev.map(a => a.id === id ? { ...a, status } : a)
      )
      setStats(prev => {
        const old = applications.find(a => a.id === id)?.status ?? 'pending'
        return {
          ...prev,
          [old]:   Math.max(0, prev[old] - 1),
          [status]: prev[status] + 1,
        }
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Ambassador Applications</h1>
        <p className="text-sm text-gray-500 mt-1">Review and manage campus ambassador applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',    value: stats.total,    color: 'text-gray-900' },
          { label: 'Pending',  value: stats.pending,  color: 'text-yellow-600' },
          { label: 'Approved', value: stats.approved, color: 'text-green-600' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {FILTERS.map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filter === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs ${filter === value ? 'text-gray-500' : 'text-gray-400'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {error ? (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      ) : loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No applications yet.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Applicant', 'University', 'Year', 'Applied', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map(app => (
                <>
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{app.full_name}</p>
                      <p className="text-xs text-gray-500">{app.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{app.university}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{app.year}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {app.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus(app.id, 'approved')}
                            disabled={updating === app.id}
                            className="text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-md font-medium disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {app.status !== 'rejected' && (
                          <button
                            onClick={() => updateStatus(app.id, 'rejected')}
                            disabled={updating === app.id}
                            className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md font-medium disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}
                        {app.status !== 'pending' && (
                          <button
                            onClick={() => updateStatus(app.id, 'pending')}
                            disabled={updating === app.id}
                            className="text-xs text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-2.5 py-1.5 rounded-md font-medium disabled:opacity-50"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {expandedId === app.id && (
                    <tr key={`${app.id}-expanded`} className="bg-gray-50">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Course</p>
                            <p className="text-gray-800">{app.course}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Phone</p>
                            <p className="text-gray-800">{app.phone}</p>
                          </div>
                          {app.instagram && (
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Instagram</p>
                              <p className="text-gray-800">{app.instagram}</p>
                            </div>
                          )}
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Why they want to apply</p>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{app.why_apply}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
