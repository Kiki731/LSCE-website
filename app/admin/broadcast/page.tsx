'use client'

import { useState } from 'react'

type Status = 'idle' | 'sending' | 'done' | 'error'

export default function BroadcastPage() {
  const [status,    setStatus]    = useState<Status>('idle')
  const [confirmed, setConfirmed] = useState(false)
  const [result,    setResult]    = useState<{ succeeded: number; failed: number; total: number } | null>(null)

  async function handleSend() {
    setStatus('sending')
    try {
      const res  = await fetch('/api/admin/broadcast/date-change', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setResult(data)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/6 shrink-0">
        <h1 className="font-display font-[500] text-[18px] text-white">Date Change Broadcast</h1>
        <p className="font-sans text-[12px] text-white/35 mt-0.5">
          Send the 17 April 2027 date update to all ticket buyers
        </p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6 flex flex-col gap-6">

        {/* Email preview */}
        <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#FF2035]" />
            <p className="font-sans text-[13px] text-white/70">Email preview</p>
          </div>
          <div className="px-5 py-5 space-y-3">
            <div className="flex gap-3">
              <span className="font-sans text-[11px] text-white/30 uppercase tracking-wider w-16 shrink-0 mt-0.5">Subject</span>
              <span className="font-sans text-[13px] text-white">A new date for LSCE 3.0, and a thank-you</span>
            </div>
            <div className="flex gap-3">
              <span className="font-sans text-[11px] text-white/30 uppercase tracking-wider w-16 shrink-0 mt-0.5">From</span>
              <span className="font-sans text-[13px] text-white/70">LSCE Tickets &lt;tickets@thelscexpo.com&gt;</span>
            </div>
            <div className="flex gap-3">
              <span className="font-sans text-[11px] text-white/30 uppercase tracking-wider w-16 shrink-0 mt-0.5">Reply-to</span>
              <span className="font-sans text-[13px] text-white/70">lagosstudentcareerexpo@gmail.com</span>
            </div>
            <div className="border-t border-white/6 pt-4 mt-2">
              <p className="font-sans text-[13px] text-white/90 font-semibold mb-2">Hi [Name],</p>
              <p className="font-sans text-[13px] text-white/55 leading-relaxed mb-3">
                First, thank you. You got your ticket, told your friends, and planned your day around LSCE 3.0.
                We are writing with news we know is not what you hoped for: due to unforeseen circumstances,
                LSCE 3.0 has moved to a new date.
              </p>
              <div className="border-l-2 border-[#FF2035] bg-[#FF2035]/6 rounded-r-[8px] px-4 py-3 mb-3">
                <p className="font-sans text-[11px] text-white/40 mb-1">New date</p>
                <p className="font-sans text-[14px] text-white font-semibold">Saturday, 17 April 2027</p>
                <p className="font-sans text-[12px] text-white/50 mt-1">Venue to be communicated soon</p>
              </div>
              <p className="font-sans text-[13px] text-white/55 leading-relaxed mb-3">
                Your ticket stays valid and no action is needed. If April does not work, they reply and{' '}
                <span className="text-[#FF2035]">get a refund</span>.
              </p>
              <p className="font-sans text-[13px] text-white/55 leading-relaxed">
                Sent with the LSCE banner header. Signed off as “With gratitude, The LSCE 3.0 Team”.
              </p>
            </div>
          </div>
        </div>

        {/* Send panel */}
        {status === 'done' && result ? (
          <div className="bg-[#161616] border border-white/6 rounded-[16px] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5L6.5 12 13 4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-display font-[500] text-[15px] text-white">Broadcast sent</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total recipients', value: result.total },
                { label: 'Delivered',        value: result.succeeded },
                { label: 'Failed',           value: result.failed },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/4 rounded-[10px] px-4 py-3">
                  <p className="font-sans text-[11px] text-white/35 uppercase tracking-wider">{label}</p>
                  <p className="font-display font-[500] text-[20px] text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : status === 'error' ? (
          <div className="bg-[#161616] border border-red-500/20 rounded-[16px] p-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-sans text-[13px] text-white">Something went wrong. Please try again.</p>
              <button
                onClick={() => { setStatus('idle'); setConfirmed(false) }}
                className="font-sans text-[12px] text-[#FF2035] mt-1 hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#161616] border border-white/6 rounded-[16px] p-5 flex flex-col gap-4">
            <div>
              <p className="font-sans text-[13px] text-white font-semibold mb-1">Ready to send?</p>
              <p className="font-sans text-[12px] text-white/40 leading-relaxed">
                This will email every buyer who has a completed order. Each person receives it once. This cannot be undone.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                className="mt-0.5 w-4 h-4 rounded-[4px] border shrink-0 flex items-center justify-center transition-colors"
                style={{
                  background: confirmed ? '#FF2035' : 'transparent',
                  borderColor: confirmed ? '#FF2035' : 'rgba(255,255,255,0.2)',
                }}
                onClick={() => setConfirmed(v => !v)}
              >
                {confirmed && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5.5L4 8 8.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span
                className="font-sans text-[12px] text-white/50 leading-relaxed select-none"
                onClick={() => setConfirmed(v => !v)}
              >
                I confirm I want to send the date change notification to all ticket buyers
              </span>
            </label>

            <button
              onClick={handleSend}
              disabled={!confirmed || status === 'sending'}
              className="self-start flex items-center gap-2 px-5 py-2.5 rounded-[100px] font-sans text-[13px] font-semibold transition-all"
              style={{
                background: confirmed && status !== 'sending' ? '#FF2035' : 'rgba(255,255,255,0.06)',
                color:      confirmed && status !== 'sending' ? '#ffffff' : 'rgba(255,255,255,0.25)',
                cursor:     confirmed && status !== 'sending' ? 'pointer' : 'not-allowed',
              }}
            >
              {status === 'sending' ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Sending…
                </>
              ) : 'Send broadcast'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
