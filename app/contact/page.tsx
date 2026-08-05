'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FadeUp from '@/components/ui/FadeUp'

type State = 'idle' | 'submitting' | 'success' | 'error'

const inputCls = "border border-[#D5D3CF] rounded-[10px] px-4 py-3 font-sans text-[14px] text-[#1A1A1A] bg-white outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30 w-full"

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const valid =
    form.name.trim().length > 1 &&
    form.email.includes('@') &&
    form.subject.trim().length > 1 &&
    form.message.trim().length >= 10

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setState('submitting')
    setError('')

    const res  = await fetch('/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setState('error')
      return
    }

    setState('success')
  }

  return (
    <>
      <Navbar />
      <main className="bg-[#F7F5F2] min-h-screen overflow-x-hidden">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative pt-[160px] md:pt-[200px] pb-[60px] md:pb-[80px] overflow-hidden">

          {/* Decorative star */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-[-130px] md:right-[-160px]"
            style={{ width: 560, height: 560, zIndex: 0 }}
          >
            <Image src="/icons/Star 4 top right.png" alt="" fill className="object-contain" />
          </div>

          <div className="relative z-10 section-container flex flex-col items-center text-center gap-5">
            <FadeUp>
              <div className="flex flex-col items-center gap-4 max-w-[640px]">
                <p className="font-sans text-[13px] text-[#FF2035] font-semibold uppercase tracking-wider">
                  Get in Touch
                </p>
                <h1 className="font-display font-[500] text-[40px] md:text-[56px] lg:text-[68px] text-[#1A1A1A] leading-[1.1]">
                  We&apos;d love to{' '}
                  <span className="text-[#FF2035]">hear</span>
                  {' '}from you.
                </h1>
                <p className="font-sans text-[15px] md:text-[17px] text-[#1A1A1A]/60 leading-[1.6] max-w-[480px]">
                  Questions about tickets, partnerships, sponsorships, or anything else — drop us a message and we&apos;ll get back to you.
                </p>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── Contact form + info ──────────────────────────────── */}
        <section className="section-container pb-[100px] md:pb-[140px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 max-w-[1000px] mx-auto">

            {/* Form */}
            <FadeUp>
              {state === 'success' ? (
                <div className="bg-white border border-[#E5E5E5] rounded-[20px] p-8 flex flex-col items-center gap-5 text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M5 14L11 20L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display font-[500] text-[26px] text-[#1A1A1A]">Message sent!</h2>
                    <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2 leading-[1.6]">
                      Thanks for reaching out, {form.name.split(' ')[0]}. We&apos;ll get back to you as soon as possible.
                    </p>
                  </div>
                  <button
                    onClick={() => { setForm({ name: '', email: '', subject: '', message: '' }); setState('idle') }}
                    className="font-sans text-[13px] text-[#FF2035] hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E5] rounded-[20px] overflow-hidden">
                  <div className="px-6 py-5 border-b border-[#F0EEEB]">
                    <p className="font-display font-[500] text-[15px] text-[#1A1A1A]">Send us a message</p>
                  </div>

                  <div className="p-6 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/60">
                          Full Name <span className="text-[#FF2035]">*</span>
                        </label>
                        <input
                          type="text" required value={form.name}
                          onChange={e => set('name', e.target.value)}
                          placeholder="Your name"
                          className={inputCls}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/60">
                          Email Address <span className="text-[#FF2035]">*</span>
                        </label>
                        <input
                          type="email" required value={form.email}
                          onChange={e => set('email', e.target.value)}
                          placeholder="you@example.com"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/60">
                        Subject <span className="text-[#FF2035]">*</span>
                      </label>
                      <input
                        type="text" required value={form.subject}
                        onChange={e => set('subject', e.target.value)}
                        placeholder="What's this about?"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/60">
                        Message <span className="text-[#FF2035]">*</span>
                      </label>
                      <textarea
                        required value={form.message}
                        onChange={e => set('message', e.target.value)}
                        placeholder="Tell us what's on your mind…"
                        rows={6}
                        className={`${inputCls} resize-none`}
                      />
                    </div>

                    {state === 'error' && error && (
                      <div className="bg-[#FFF5F5] border border-[#FFD5D5] rounded-[10px] px-4 py-3 font-sans text-[13px] text-[#FF2035]">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!valid || state === 'submitting'}
                      className="w-full py-4 rounded-[60px] font-sans text-[15px] font-semibold transition-all mt-1"
                      style={{
                        background: valid && state !== 'submitting' ? '#FF2035' : '#E5E5E5',
                        color:      valid && state !== 'submitting' ? 'white'   : '#999',
                        cursor:     valid && state !== 'submitting' ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {state === 'submitting' ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Sending…
                        </span>
                      ) : 'Send Message →'}
                    </button>
                  </div>
                </form>
              )}
            </FadeUp>

            {/* Info panel */}
            <FadeUp delay={100}>
              <div className="flex flex-col gap-5">

                <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-5">
                  <p className="font-display font-[500] text-[14px] text-[#1A1A1A] mb-3">Contact Details</p>
                  <div className="flex flex-col gap-3">
                    <a href="mailto:lagosstudentcareerexpo@gmail.com"
                      className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-[8px] bg-[#FF2035]/10 flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="#FF2035" strokeWidth="1.2"/>
                          <path d="M1 4.5l6 4 6-4" stroke="#FF2035" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="font-sans text-[13px] text-[#1A1A1A]/70 group-hover:text-[#FF2035] transition-colors">
                        lagosstudentcareerexpo@gmail.com
                      </span>
                    </a>
                    <a href="https://instagram.com/lagoscareerexpo" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-[8px] bg-[#FF2035]/10 flex items-center justify-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="1.5" y="1.5" width="11" height="11" rx="3" stroke="#FF2035" strokeWidth="1.2"/>
                          <circle cx="7" cy="7" r="2.5" stroke="#FF2035" strokeWidth="1.2"/>
                          <circle cx="10.5" cy="3.5" r="0.75" fill="#FF2035"/>
                        </svg>
                      </div>
                      <span className="font-sans text-[13px] text-[#1A1A1A]/70 group-hover:text-[#FF2035] transition-colors">
                        @lagoscareerexpo
                      </span>
                    </a>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5E5] rounded-[16px] p-5">
                  <p className="font-display font-[500] text-[14px] text-[#1A1A1A] mb-2">Event Details</p>
                  <p className="font-sans text-[13px] text-[#1A1A1A]/55 leading-[1.7]">
                    📅 Saturday, October 3rd, 2026<br />
                    📍 Landmark Event Centre,<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Victoria Island, Lagos
                  </p>
                </div>

                <div className="bg-[#1A1A1A] rounded-[16px] p-5">
                  <p className="font-display font-[500] text-[14px] text-white mb-2">Get your ticket</p>
                  <p className="font-sans text-[13px] text-white/50 mb-4 leading-[1.6]">
                    Ready to attend? Tickets are available now.
                  </p>
                  <Link
                    href="/tickets"
                    className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-4 py-2.5 rounded-[20px] font-sans text-[13px] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Buy Tickets
                    <Image src="/icons/Button star.svg" alt="" width={11} height={11} className="size-[11px]" />
                  </Link>
                </div>

              </div>
            </FadeUp>

          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
