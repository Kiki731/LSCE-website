'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { BREAKOUT_MAP } from '@/lib/breakouts'

interface AttendeeOrder {
  buyer_name: string
  buyer_email: string
  ticket_type: string
}

interface Attendee {
  id: string
  email: string
  name: string | null
  ticket_code: string
  checked_in: boolean
  checked_in_at: string | null
  created_at: string
  breakouts: string[] | null
  orders: AttendeeOrder
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold:   '#D4AF37',
}

const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze Pass',
  silver: 'Silver Pass',
  gold:   'Gold Pass',
}

function fmtTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

/* ── Attendee result card ── */
function AttendeeCard({
  attendee,
  onCheckIn,
  loading,
}: {
  attendee: Attendee
  onCheckIn: (a: Attendee) => void
  loading: boolean
}) {
  const tier = attendee.orders?.ticket_type ?? 'bronze'
  return (
    <div
      className="bg-[#161616] border rounded-[16px] p-5 flex flex-col gap-4 transition-all"
      style={{ borderColor: attendee.checked_in ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-display font-[500] text-[15px]"
            style={{ background: (TIER_COLORS[tier] ?? '#fff') + '22', color: TIER_COLORS[tier] ?? 'white' }}
          >
            {(attendee.orders?.buyer_name ?? attendee.email)?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-display font-[500] text-white text-[15px] leading-none truncate">
              {attendee.orders?.buyer_name ?? attendee.email}
            </p>
            <p className="font-sans text-[12px] text-white/40 mt-0.5 truncate">{attendee.email}</p>
          </div>
        </div>

        {/* Check-in status */}
        {attendee.checked_in ? (
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <span className="inline-flex items-center gap-1.5 font-sans text-[12px] font-semibold text-green-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Checked in
            </span>
            <span className="font-sans text-[11px] text-white/25">{fmtTime(attendee.checked_in_at)}</span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-sans text-[12px] text-white/30 shrink-0">
            <span className="w-2 h-2 rounded-full border border-white/30" />
            Not checked in
          </span>
        )}
      </div>

      {/* Ticket info */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-[6px] font-sans text-[11px] font-semibold"
          style={{ background: (TIER_COLORS[tier] ?? '#fff') + '22', color: TIER_COLORS[tier] ?? 'white' }}
        >
          {TIER_LABELS[tier] ?? tier}
        </span>
        <code className="font-mono text-[13px] text-white/60 bg-white/6 px-2.5 py-1 rounded-[6px] tracking-widest">
          {attendee.ticket_code}
        </code>
      </div>

      {/* Breakout sessions */}
      {attendee.breakouts && attendee.breakouts.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-white/8 pt-3">
          <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider">Breakout Sessions</p>
          <div className="flex flex-col gap-1">
            {attendee.breakouts.map((id, i) => (
              <div key={id} className="flex items-center gap-2">
                <span className="font-sans text-[11px] font-semibold text-[#FF2035] shrink-0">{i + 1}.</span>
                <span className="font-sans text-[12px] text-white/70">
                  {BREAKOUT_MAP[id]?.title ?? id}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      <button
        onClick={() => onCheckIn(attendee)}
        disabled={loading}
        className="w-full py-3 rounded-[10px] font-sans text-[13px] font-semibold transition-all flex items-center justify-center gap-2"
        style={{
          background: attendee.checked_in
            ? 'rgba(255,255,255,0.06)'
            : '#FF2035',
          color: attendee.checked_in ? 'rgba(255,255,255,0.4)' : 'white',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? (
          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : attendee.checked_in ? (
          'Undo Check-in'
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Check In
          </>
        )}
      </button>
    </div>
  )
}

/* ── QR Scanner using BarcodeDetector (Chrome/Edge) or fallback ── */
function QRScanner({ onScan }: { onScan: (code: string) => void }) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const rafRef     = useRef<number>(0)
  const [active, setActive]   = useState(false)
  const [error, setError]     = useState('')
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).BarcodeDetector) setSupported(false)
  }, [])

  const startCamera = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setActive(true)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })

      const scan = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(scan)
          return
        }
        try {
          const codes = await detector.detect(videoRef.current)
          if (codes.length > 0) {
            const raw = codes[0].rawValue as string
            stopCamera()
            onScan(raw.trim().toUpperCase())
            return
          }
        } catch { /* detector not ready */ }
        rafRef.current = requestAnimationFrame(scan)
      }

      rafRef.current = requestAnimationFrame(scan)
    } catch (e) {
      setError('Could not access camera. Check permissions.')
      console.error(e)
    }
  }, [onScan])

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setActive(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  if (!supported) {
    return (
      <p className="font-sans text-[12px] text-white/30 text-center py-2">
        QR scanning not supported in this browser. Use Chrome or Edge, or type the code manually.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {!active ? (
        <button
          onClick={startCamera}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-[10px] border border-white/12 font-sans text-[13px] text-white/60 hover:text-white hover:border-white/25 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="10" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="1" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10 10h2v2h-2zM12 12h3M12 10h3M10 12v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Scan QR Code
        </button>
      ) : (
        <div className="relative rounded-[12px] overflow-hidden bg-black aspect-square w-full max-w-[280px] mx-auto">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          {/* Viewfinder overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 relative">
              {[
                'top-0 left-0 border-t-2 border-l-2',
                'top-0 right-0 border-t-2 border-r-2',
                'bottom-0 left-0 border-b-2 border-l-2',
                'bottom-0 right-0 border-b-2 border-r-2',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 ${cls} border-[#FF2035] rounded-[2px]`} />
              ))}
            </div>
          </div>
          <button
            onClick={stopCamera}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
      {error && <p className="font-sans text-[12px] text-[#FF2035] text-center">{error}</p>}
    </div>
  )
}

/* ── Main component ── */
export default function CheckinManager() {
  const [query, setQuery]           = useState('')
  const [results, setResults]       = useState<Attendee[]>([])
  const [searching, setSearching]   = useState(false)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<{ name: string; checkedIn: boolean } | null>(null)
  const [stats, setStats]           = useState({ total: 0, checkedIn: 0 })

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const inputRef    = useRef<HTMLInputElement>(null)

  // Load stats on mount
  useEffect(() => {
    fetch('/api/admin/attendees?page=1')
      .then(r => r.json())
      .then(d => setStats(d.stats ?? { total: 0, checkedIn: 0 }))
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); return }
    setSearching(true)
    const res  = await fetch(`/api/admin/checkin?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setResults(data.attendees ?? [])
    setSearching(false)
  }, [])

  function handleInput(v: string) {
    setQuery(v)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => search(v), 250)
  }

  function handleScan(code: string) {
    setQuery(code)
    inputRef.current?.focus()
    search(code)
  }

  async function handleCheckIn(a: Attendee) {
    setCheckingIn(a.id)
    const res = await fetch('/api/admin/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_code: a.ticket_code, checked_in: !a.checked_in }),
    })
    const data = await res.json()
    if (res.ok) {
      const updated = data.attendee
      setResults(prev => prev.map(x => x.id === a.id ? { ...x, ...updated } : x))
      const nowCheckedIn = updated.checked_in as boolean
      setLastAction({ name: a.orders?.buyer_name ?? a.email, checkedIn: nowCheckedIn })
      setStats(prev => ({
        ...prev,
        checkedIn: nowCheckedIn ? prev.checkedIn + 1 : prev.checkedIn - 1,
      }))
      setTimeout(() => setLastAction(null), 4000)
    }
    setCheckingIn(null)
  }

  const checkInPct = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="font-display font-[500] text-white text-[24px] leading-none">Check-in</h1>
        <p className="font-sans text-[13px] text-white/40 mt-1.5">LSCE 2026 · Event day gate management</p>
      </div>

      {/* Progress bar */}
      <div className="bg-[#161616] border border-white/6 rounded-[14px] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-sans text-[11px] text-white/40 uppercase tracking-wider">Checked In</p>
            <p className="font-display font-[500] text-[24px] text-white mt-0.5">
              {stats.checkedIn}
              <span className="text-white/30 text-[16px] ml-1">/ {stats.total}</span>
            </p>
          </div>
          <span
            className="font-display font-[500] text-[32px]"
            style={{ color: checkInPct > 70 ? '#22c55e' : checkInPct > 30 ? '#D4AF37' : 'white' }}
          >
            {checkInPct}%
          </span>
        </div>
        <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${checkInPct}%`,
              background: checkInPct > 70 ? '#22c55e' : '#FF2035',
            }}
          />
        </div>
      </div>

      {/* Toast notification */}
      {lastAction && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-[12px] font-sans text-[13px] font-semibold transition-all"
          style={{ background: lastAction.checkedIn ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', color: lastAction.checkedIn ? '#22c55e' : 'rgba(255,255,255,0.5)' }}
        >
          {lastAction.checkedIn ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l5 5 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M5 5l6 6M11 5L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          {lastAction.checkedIn ? `${lastAction.name} checked in ✓` : `Check-in reversed for ${lastAction.name}`}
        </div>
      )}

      {/* Search + Scan */}
      <div className="bg-[#161616] border border-white/8 rounded-[16px] p-5 flex flex-col gap-4">
        <p className="font-display font-[500] text-white text-[14px]">Find Attendee</p>

        {/* Search input */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            placeholder="Name, email, or ticket code (e.g. A1B2C3D4)"
            className="w-full bg-white/5 border border-white/15 rounded-[10px] pl-10 pr-4 py-3 font-sans text-[14px] text-white placeholder:text-white/20 outline-none focus:border-[#FF2035] transition-colors"
            autoComplete="off"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* QR Scanner */}
        <QRScanner onScan={handleScan} />
      </div>

      {/* Results */}
      {searching && (
        <div className="flex items-center justify-center gap-2 py-8 text-white/30 font-sans text-[13px]">
          <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          Searching…
        </div>
      )}

      {!searching && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-10">
          <p className="font-sans text-[14px] text-white/30">No attendee found for &quot;{query}&quot;</p>
          <p className="font-sans text-[12px] text-white/20 mt-1">Double-check the ticket code or try their email</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-3">
          {results.map(a => (
            <AttendeeCard
              key={a.id}
              attendee={a}
              onCheckIn={handleCheckIn}
              loading={checkingIn === a.id}
            />
          ))}
        </div>
      )}

      {/* Empty state — no query */}
      {!query && results.length === 0 && (
        <div className="text-center py-10 border border-dashed border-white/8 rounded-[16px]">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <rect x="12" y="2" width="6" height="6" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <rect x="2" y="12" width="6" height="6" rx="1" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <path d="M12 12h2v2h-2zM14 14h4M14 12h4M12 14v4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="font-sans text-[13px] text-white/25">Scan a QR code or search by name / email / ticket code</p>
        </div>
      )}

    </div>
  )
}
