'use client'

import { useEffect, useState, useCallback } from 'react'

interface Session {
  id:          string
  email:       string
  created_at:  string
  last_active: string
  expires_at:  string | null
  is_active:   boolean
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function SessionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 8h8M6 12h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  )
}

export default function AdminSessionsPage() {
  const [sessions, setSessions]   = useState<Session[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/sessions')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load')
      setSessions(data.sessions ?? [])
      setLastRefresh(new Date())
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  const active   = sessions.filter(s => s.is_active)
  const inactive = sessions.filter(s => !s.is_active)

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-[500] text-white text-[22px] leading-none">Admin Sessions</h1>
          <p className="font-sans text-[13px] text-white/40 mt-1.5">
            Browsers and devices currently logged into the admin panel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-sans text-[11px] text-white/25">
            Updated {timeAgo(lastRefresh.toISOString())}
          </p>
          <button
            onClick={() => { setLoading(true); load() }}
            disabled={loading}
            className="flex items-center gap-1.5 bg-white/6 hover:bg-white/10 transition-colors text-white/60 hover:text-white/90 px-3 py-2 rounded-[10px] font-sans text-[12px] disabled:opacity-40"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={loading ? 'animate-spin' : ''}>
              <path d="M10 6a4 4 0 11-1.17-2.83" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M8 2.5L8.83 3.17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[14px] px-5 py-4">
          <p className="font-sans text-[13px] text-red-400">{error}</p>
        </div>
      )}

      {/* Hero stat */}
      <div
        className="rounded-[20px] p-6 flex items-center gap-5 border border-white/6"
        style={{ background: 'linear-gradient(135deg, #161616 0%, #1a1a1a 100%)' }}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-[16px] bg-[#FF2035]/10 shrink-0 text-[#FF2035]">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="6" width="22" height="16" rx="3" stroke="#FF2035" strokeWidth="1.8"/>
            <path d="M8 12h12M8 17h8" stroke="#FF2035" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="21" cy="17" r="2" fill="#FF2035"/>
          </svg>
        </div>
        <div>
          <p className="font-sans text-[12px] text-white/40 uppercase tracking-wider mb-1">Active Sessions</p>
          <p className="font-display font-[500] text-[48px] text-white leading-none">
            {loading ? '—' : active.length}
          </p>
          <p className="font-sans text-[13px] text-white/40 mt-1">
            {loading
              ? 'Loading…'
              : active.length === 0
                ? 'No one is currently logged in'
                : active.length === 1
                  ? '1 browser has the admin panel open'
                  : `${active.length} browsers have the admin panel open`}
          </p>
        </div>
        {!loading && sessions.length > active.length && (
          <div className="ml-auto text-right shrink-0">
            <p className="font-sans text-[12px] text-white/25">
              {sessions.length - active.length} expired
            </p>
          </div>
        )}
      </div>

      {/* Active sessions list */}
      {!loading && active.length > 0 && (
        <div className="bg-[#111111] border border-white/6 rounded-[16px] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e]" />
            <h2 className="font-sans text-[12px] text-white/40 uppercase tracking-wider">Active</h2>
            <span className="ml-auto font-sans text-[12px] text-white/40">{active.length}</span>
          </div>
          <div className="divide-y divide-white/4">
            {active.map(s => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#22c55e]/10 text-[#22c55e] shrink-0">
                  <SessionIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] text-white font-[500] truncate">{s.email}</p>
                  <p className="font-sans text-[11px] text-white/30 mt-0.5">
                    Signed in {formatDate(s.created_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-sans text-[12px] text-white/50">Last active</p>
                  <p className="font-sans text-[12px] text-[#22c55e] font-[500]">
                    {timeAgo(s.last_active)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty active */}
      {!loading && active.length === 0 && !error && (
        <div className="bg-[#111111] border border-white/6 rounded-[16px] flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-white/15">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 18h16M12 24h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="font-sans text-[14px] text-white/25">No active sessions right now</p>
        </div>
      )}

      {/* Expired / old sessions */}
      {!loading && inactive.length > 0 && (
        <div className="bg-[#111111] border border-white/6 rounded-[16px] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white/20" />
            <h2 className="font-sans text-[12px] text-white/40 uppercase tracking-wider">Expired / Logged out</h2>
            <span className="ml-auto font-sans text-[12px] text-white/40">{inactive.length}</span>
          </div>
          <div className="divide-y divide-white/4">
            {inactive.map(s => (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors opacity-50">
                <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-white/5 text-white/30 shrink-0">
                  <SessionIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] text-white/60 truncate">{s.email}</p>
                  <p className="font-sans text-[11px] text-white/25 mt-0.5">
                    Signed in {formatDate(s.created_at)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-sans text-[12px] text-white/30">Expired</p>
                  <p className="font-sans text-[12px] text-white/30">
                    {s.expires_at ? timeAgo(s.expires_at) : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
