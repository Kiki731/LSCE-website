'use client'

import { useState } from 'react'
import Image from 'next/image'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function ReferralSection() {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [code, setCode]   = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrMsg('')
    try {
      const res  = await fetch('/api/ambassadors/referral', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrMsg(data.error ?? 'Something went wrong.')
        setState('error')
        return
      }
      setCode(data.code)
      setState('success')
    } catch {
      setErrMsg('Something went wrong. Please try again.')
      setState('error')
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section id="referral" className="section-container py-[80px] md:py-[120px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

        {/* ── Left: copy ── */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="font-sans text-[13px] text-[#FF2035] uppercase tracking-[0.1em]">
              Ambassador Referral
            </p>
            <h2 className="font-display font-[500] text-[28px] md:text-[36px] text-[#1A1A1A] leading-[1.15]">
              Your code.{' '}
              <span className="text-[#FF2035]">Your impact.</span>
            </h2>
            <p className="font-sans text-[14px] md:text-[15px] text-[#1A1A1A]/65 leading-[1.7]">
              As an approved LSCE ambassador, you get a unique referral code tied to your name.
              Share it with your campus — every ticket sold through your code is tracked and rewarded.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: 'Unique to you', desc: 'Your code is linked to your name and campus — no one else shares it.' },
              { label: 'Every sale tracked', desc: "We log each ticket bought through your code in real time." },
              { label: 'You get notified', desc: 'An email lands in your inbox every time someone uses your code.' },
              { label: 'Top ambassadors rewarded', desc: 'The LSCE team recognises and rewards the ambassadors driving the most sales.' },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FF2035]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Image src="/icons/Button Star red.svg" alt="" width={10} height={10} className="size-[10px]" />
                </div>
                <div>
                  <p className="font-sans text-[14px] text-[#1A1A1A] font-[500] leading-none mb-1">{label}</p>
                  <p className="font-sans text-[13px] text-[#1A1A1A]/55 leading-[1.5]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: form / result ── */}
        <div>
          <div className="bg-[#F7F5F2] rounded-[24px] p-6 md:p-8 flex flex-col gap-6">

            {state !== 'success' ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-display font-[500] text-[20px] text-[#1A1A1A] leading-[1.2]">
                    Generate your referral code
                  </h3>
                  <p className="font-sans text-[13px] text-[#1A1A1A]/50 leading-[1.5]">
                    Only approved LSCE ambassadors can claim a code. Enter the name and email you applied with.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] text-[#1A1A1A]/60 uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Tunde Adeyemi"
                      className="w-full bg-white border border-[#E5E5E5] rounded-[12px] px-4 py-3 font-sans text-[14px] text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#FF2035]/40"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] text-[#1A1A1A]/60 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="the email you applied with"
                      className="w-full bg-white border border-[#E5E5E5] rounded-[12px] px-4 py-3 font-sans text-[14px] text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 focus:outline-none focus:border-[#FF2035]/40"
                    />
                  </div>

                  {state === 'error' && (
                    <p className="font-sans text-[13px] text-[#FF2035] leading-[1.5]">{errMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={state === 'loading' || !name.trim() || !email.trim()}
                    className="flex items-center justify-center gap-2 bg-[#FF2035] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-white px-6 py-3.5 rounded-[60px] font-sans text-[14px] font-[500]"
                  >
                    {state === 'loading' ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Get my referral code
                        <Image src="/icons/Button star.svg" alt="" width={12} height={12} className="size-[12px]" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 9l4 4 8-8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-[500] text-[16px] text-[#1A1A1A]">You&apos;re set!</p>
                    <p className="font-sans text-[13px] text-[#1A1A1A]/50">Your referral code is ready to share.</p>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-sans text-[11px] text-[#1A1A1A]/40 uppercase tracking-wider mb-1">Your code</p>
                    <p className="font-display font-[500] text-[28px] text-[#1A1A1A] leading-none tracking-wide">
                      {code}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-[60px] border border-[#E5E5E5] hover:border-[#1A1A1A]/20 transition-colors font-sans text-[13px] text-[#1A1A1A]"
                  >
                    {copied ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 7l3.5 3.5 6.5-7" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                          <path d="M10 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v6a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <p className="font-sans text-[13px] text-[#1A1A1A]/50 leading-[1.6]">
                  Share this code with students on your campus. Ask them to enter it at checkout on{' '}
                  <span className="text-[#1A1A1A]">thelscexpo.com/tickets</span>. Every sale through it is tracked to you.
                </p>

                <button
                  onClick={() => { setState('idle'); setName(''); setEmail(''); setCode('') }}
                  className="font-sans text-[13px] text-[#FF2035] hover:underline text-left w-fit"
                >
                  Look up a different code
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
