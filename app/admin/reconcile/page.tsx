'use client'

import { useState, useEffect, useCallback } from 'react'

interface Row {
  reference: string; email: string; amount: number; channel: string
  when: string; buyerName: string; ticketType: string; quantity: number
}
interface Summary {
  paystackTotal: number; success: number; abandoned: number; failed: number
  ordersInDb: number; orphanCount: number; orphanValue: number; abandonedMailable: number
}
interface Data { checkedAt: string; summary: Summary; orphans: Row[]; abandoned: Row[] }

function naira(n: number) { return '₦' + n.toLocaleString('en-NG') }
function shortDate(s: string) { return s ? new Date(s).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' }) : '—' }

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'danger' | 'warn' | 'ok' }) {
  const color = tone === 'danger' ? '#FF2035' : tone === 'warn' ? '#F5A524' : tone === 'ok' ? '#22c55e' : '#ffffff'
  return (
    <div className="bg-[#161616] border border-white/6 rounded-[14px] px-5 py-4 min-w-0">
      <p className="font-sans text-[11px] text-white/35 uppercase tracking-wider truncate">{label}</p>
      <p className="font-display font-[500] text-[22px] mt-1.5 leading-none" style={{ color }}>{value}</p>
    </div>
  )
}

export default function ReconcilePage() {
  const [data, setData]       = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [busy, setBusy]       = useState<string | null>(null)
  const [done, setDone]       = useState<Record<string, string>>({})
  const [picked, setPicked]   = useState<Set<string>>(new Set())
  const [mailing, setMailing] = useState(false)
  const [note, setNote]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/admin/reconcile')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to load')
      setData(json)
    } catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function recover(reference: string) {
    setBusy(reference); setNote(null)
    try {
      const res  = await fetch('/api/admin/reconcile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Recovery failed')
      setDone(d => ({ ...d, [reference]: json.ticketCodes?.join(', ') || 'recovered' }))
      if (json.emailed === false) setNote('Ticket created, but the confirmation email failed to send.')
    } catch (e) { setNote((e as Error).message) }
    finally { setBusy(null) }
  }

  async function recoverAll() {
    if (!data) return
    for (const o of data.orphans) {
      if (done[o.reference]) continue
      await recover(o.reference)
    }
    load()
  }

  async function sendRecoveryEmails() {
    const emails = [...picked]
    if (!emails.length) return
    setMailing(true); setNote(null)
    try {
      const res  = await fetch('/api/admin/recovery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed')
      setNote(json.errors?.length
        ? `${json.succeeded} of ${json.total} sent — ${json.errors.length} error(s): ${json.errors.join('; ')}`
        : `${json.succeeded} of ${json.total} recovery emails sent.`)
      setPicked(new Set())
    } catch (e) { setNote((e as Error).message) }
    finally { setMailing(false) }
  }

  const toggle = (email: string) => setPicked(p => {
    const n = new Set(p); n.has(email) ? n.delete(email) : n.add(email); return n
  })

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-[1100px]">

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-[500] text-white text-[22px] leading-none">Payment Reconciliation</h1>
          <p className="font-sans text-[13px] text-white/40 mt-1.5">
            Live Paystack transactions checked against the orders table. Anything paid but missing a ticket shows up here.
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="shrink-0 flex items-center gap-2 bg-white/8 hover:bg-white/12 disabled:opacity-40 transition-colors text-white px-4 py-2.5 rounded-[20px] font-sans text-[13px] font-semibold">
          {loading ? 'Checking…' : 'Re-check'}
        </button>
      </div>

      {note && (
        <div className="bg-white/5 border border-white/10 rounded-[14px] px-5 py-3.5">
          <p className="font-sans text-[13px] text-white/70">{note}</p>
        </div>
      )}
      {error && (
        <div className="bg-[#FF2035]/10 border border-[#FF2035]/20 rounded-[14px] px-5 py-4">
          <p className="font-sans text-[13px] text-[#FF2035]">{error}</p>
        </div>
      )}

      {loading && !data && (
        <p className="font-sans text-[13px] text-white/40">Pulling live transactions from Paystack…</p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Paid but no ticket" value={String(data.summary.orphanCount)}
                  tone={data.summary.orphanCount > 0 ? 'danger' : 'ok'} />
            <Stat label="Value at risk" value={naira(data.summary.orphanValue)}
                  tone={data.summary.orphanValue > 0 ? 'danger' : 'ok'} />
            <Stat label="Successful payments" value={String(data.summary.success)} tone="ok" />
            <Stat label="Abandoned checkouts" value={String(data.summary.abandoned)} tone="warn" />
          </div>

          {/* Orphans */}
          <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display font-[500] text-white text-[15px] leading-none">Paid but no ticket</h2>
                <p className="font-sans text-[12px] text-white/35 mt-1">
                  Money received, order never saved. Recovering creates the ticket and emails it.
                </p>
              </div>
              {data.orphans.length > 0 && (
                <button onClick={recoverAll} disabled={!!busy}
                  className="shrink-0 bg-[#FF2035] hover:opacity-90 disabled:opacity-40 transition-opacity text-white px-4 py-2.5 rounded-[20px] font-sans text-[13px] font-semibold">
                  Recover all {data.orphans.length}
                </button>
              )}
            </div>

            {data.orphans.length === 0 ? (
              <div className="px-5 py-8 flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9l4 4 8-8" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="font-sans text-[13px] text-[#22c55e]">
                  Everything reconciles. Every successful payment has a ticket.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.orphans.map(o => (
                  <div key={o.reference} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[13px] text-white truncate">
                        {o.buyerName || '—'} <span className="text-white/35">· {o.email}</span>
                      </p>
                      <p className="font-mono text-[11px] text-white/30 mt-1 truncate">{o.reference}</p>
                      <p className="font-sans text-[12px] text-white/40 mt-1">
                        {naira(o.amount)} · {o.ticketType || '?'} · {o.channel} · {shortDate(o.when)}
                      </p>
                    </div>
                    {done[o.reference] ? (
                      <span className="shrink-0 font-sans text-[12px] text-[#22c55e]">
                        ✓ {done[o.reference]}
                      </span>
                    ) : (
                      <button onClick={() => recover(o.reference)} disabled={busy === o.reference}
                        className="shrink-0 bg-white/8 hover:bg-white/14 disabled:opacity-40 transition-colors text-white px-4 py-2 rounded-[18px] font-sans text-[12px] font-semibold">
                        {busy === o.reference ? 'Recovering…' : 'Recover & email'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Abandoned */}
          <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display font-[500] text-white text-[15px] leading-none">
                  Abandoned checkouts · {data.abandoned.length}
                </h2>
                <p className="font-sans text-[12px] text-white/35 mt-1">
                  Started checkout, never paid, still has no ticket. Anyone who later bought is excluded.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setPicked(p => p.size === data.abandoned.length ? new Set() : new Set(data.abandoned.map(a => a.email)))}
                  className="bg-white/8 hover:bg-white/12 transition-colors text-white px-3.5 py-2 rounded-[18px] font-sans text-[12px]">
                  {picked.size === data.abandoned.length && data.abandoned.length > 0 ? 'Clear' : 'Select all'}
                </button>
                <button onClick={sendRecoveryEmails} disabled={mailing || picked.size === 0}
                  className="bg-[#FF2035] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-white px-4 py-2 rounded-[18px] font-sans text-[12px] font-semibold">
                  {mailing ? 'Sending…' : `Email ${picked.size || ''}`.trim()}
                </button>
              </div>
            </div>

            {data.abandoned.length === 0 ? (
              <p className="px-5 py-8 font-sans text-[13px] text-white/40">No abandoned checkouts without a ticket.</p>
            ) : (
              <div className="divide-y divide-white/5 max-h-[460px] overflow-y-auto">
                {data.abandoned.map(a => (
                  <label key={a.email} className="px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors">
                    <input type="checkbox" checked={picked.has(a.email)} onChange={() => toggle(a.email)}
                      className="w-4 h-4 accent-[#FF2035] cursor-pointer shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[13px] text-white truncate">
                        {a.buyerName || '—'} <span className="text-white/35">· {a.email}</span>
                      </p>
                      <p className="font-sans text-[12px] text-white/35 mt-0.5">
                        {a.ticketType || '?'} · {naira(a.amount)} · {shortDate(a.when)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <p className="font-sans text-[11px] text-white/25">
            Last checked {new Date(data.checkedAt).toLocaleString('en-NG')} · {data.summary.ordersInDb} orders in database
          </p>
        </>
      )}
    </div>
  )
}
