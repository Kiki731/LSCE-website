'use client'

import { useState } from 'react'

interface Result { succeeded: number; failed: number; total: number }

export default function RecoveryPage() {
  const [raw, setRaw]         = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult]   = useState<Result | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const emails = raw
    .split(/[\n,]+/)
    .map(e => e.trim())
    .filter(e => e.includes('@'))

  async function handleSend() {
    if (emails.length === 0) return
    setSending(true)
    setResult(null)
    setError(null)
    try {
      const res  = await fetch('/api/admin/recovery', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ emails }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setResult(data)
      setRaw('')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-[680px]">

      <div>
        <h1 className="font-display font-[500] text-white text-[22px] leading-none">Recovery Emails</h1>
        <p className="font-sans text-[13px] text-white/40 mt-1.5">
          Send a follow-up email to people who started checkout but didn't complete payment.
        </p>
      </div>

      {/* Result banner */}
      {result && (
        <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-[14px] px-5 py-4 flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9l4 4 8-8" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="font-sans text-[13px] text-[#22c55e] font-semibold">
              {result.succeeded} of {result.total} emails sent successfully
            </p>
            {result.failed > 0 && (
              <p className="font-sans text-[12px] text-white/40 mt-0.5">{result.failed} failed — check Resend logs</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-[#FF2035]/10 border border-[#FF2035]/20 rounded-[14px] px-5 py-4">
          <p className="font-sans text-[13px] text-[#FF2035]">{error}</p>
        </div>
      )}

      {/* Email input */}
      <div className="flex flex-col gap-3">
        <label className="font-sans text-[12px] text-white/50 uppercase tracking-wider">
          Paste emails — one per line or comma-separated
        </label>
        <textarea
          value={raw}
          onChange={e => setRaw(e.target.value)}
          placeholder={`john@example.com\njane@example.com\nor: john@example.com, jane@example.com`}
          rows={10}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-[12px] px-4 py-3 font-mono text-[13px] text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/25 resize-y"
        />
        {emails.length > 0 && (
          <p className="font-sans text-[12px] text-white/30">
            {emails.length} valid email{emails.length !== 1 ? 's' : ''} detected
          </p>
        )}
      </div>

      {/* Preview of email */}
      <div className="bg-[#161616] border border-white/6 rounded-[14px] p-5 flex flex-col gap-3">
        <p className="font-sans text-[11px] text-white/30 uppercase tracking-wider">Email preview</p>
        <p className="font-display font-[500] text-[18px] text-white">You were this close.</p>
        <p className="font-sans text-[13px] text-white/50 leading-[1.6]">
          Reminds them they started checkout, what they&apos;re missing, and links directly back to{' '}
          <span className="text-white/70">thelscexpo.com/tickets</span>. Shows both The Spark (₦4,000) and The Rise (₦8,000).
        </p>
      </div>

      <button
        onClick={handleSend}
        disabled={sending || emails.length === 0}
        className="self-start flex items-center gap-2 bg-[#FF2035] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-white px-6 py-3 rounded-[24px] font-sans text-[14px] font-semibold"
      >
        {sending ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 2l12 5-12 5V8.5l8-1.5-8-1.5V2z" fill="currentColor"/>
            </svg>
            Send to {emails.length > 0 ? `${emails.length} ` : ''}recipient{emails.length !== 1 ? 's' : ''}
          </>
        )}
      </button>

    </div>
  )
}
