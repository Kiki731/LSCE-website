'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'

const YEAR_OPTIONS = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Postgraduate']

type State = 'idle' | 'submitting' | 'success' | 'error'

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-sans text-[13px] font-semibold text-[#1A1A1A]/70">
        {label}{required && <span className="text-[#FF2035] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "border border-[#D5D3CF] rounded-[10px] px-4 py-3 font-sans text-[14px] text-[#1A1A1A] bg-white outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"

export default function AmbassadorApplyPage() {
  const [form, setForm] = useState({
    full_name:  '',
    email:      '',
    phone:      '',
    university: '',
    course:     '',
    year:       '',
    instagram:  '',
    why_apply:  '',
  })
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const valid =
    form.full_name.trim().length > 1 &&
    form.email.includes('@') &&
    form.phone.trim().length > 6 &&
    form.university.trim().length > 1 &&
    form.course.trim().length > 1 &&
    form.year !== '' &&
    form.why_apply.trim().length >= 50

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setState('submitting')
    setError('')

    const res  = await fetch('/api/ambassadors/apply', {
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

  if (state === 'success') {
    return (
      <>
        <Navbar />
        <main className="bg-[#F7F5F2] min-h-screen">
          <div className="section-container pt-[160px] pb-[120px] flex flex-col items-center gap-6 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full"
              style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M6 18L14 26L30 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="max-w-[500px]">
              <h1 className="font-display font-[500] text-[36px] md:text-[48px] text-[#1A1A1A] leading-[1.15]">
                Application<br />submitted! 🎉
              </h1>
              <p className="font-sans text-[15px] text-[#1A1A1A]/60 mt-4 leading-[1.7]">
                We&apos;ve received your application and will review it shortly. Keep an eye on your inbox — we&apos;ll be in touch with next steps.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Link
                href="/ambassadors"
                className="inline-flex items-center gap-1.5 border border-[#1A1A1A]/15 text-[#1A1A1A] px-5 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:bg-[#1A1A1A]/5 transition-colors"
              >
                ← Back to Ambassadors
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:opacity-90 transition-opacity"
              >
                Go to Homepage
                <Image src="/icons/Button star.svg" alt="" width={12} height={12} className="size-[12px]" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="bg-[#F7F5F2] min-h-screen">
        <div className="section-container pt-[140px] pb-[100px]">
          <div className="max-w-[680px] mx-auto">

            {/* Header */}
            <div className="mb-10">
              <Link
                href="/ambassadors"
                className="inline-flex items-center gap-1.5 font-sans text-[13px] text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors mb-6"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Ambassadors
              </Link>
              <p className="font-sans text-[13px] text-[#FF2035] font-semibold uppercase tracking-wider mb-2">
                Campus Ambassador Programme
              </p>
              <h1 className="font-display font-[500] text-[36px] md:text-[48px] text-[#1A1A1A] leading-[1.15] mb-3">
                Apply Now
              </h1>
              <p className="font-sans text-[15px] text-[#1A1A1A]/60 leading-[1.6] max-w-[520px]">
                Tell us about yourself. Applications are reviewed on a rolling basis — we&apos;ll be in touch within 5 business days.
              </p>
            </div>

            {/* Form card */}
            <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E5] rounded-[20px] overflow-hidden">

              {/* Personal Info */}
              <div className="px-6 py-5 border-b border-[#F0EEEB]">
                <p className="font-display font-[500] text-[15px] text-[#1A1A1A]">Personal Information</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#F0EEEB]">
                <Field label="Full Name" required>
                  <input
                    type="text" required value={form.full_name}
                    onChange={e => set('full_name', e.target.value)}
                    placeholder="Your full name"
                    className={inputCls}
                  />
                </Field>
                <Field label="Email Address" required>
                  <input
                    type="email" required value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone Number" required>
                  <input
                    type="tel" required value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+234 000 000 0000"
                    className={inputCls}
                  />
                </Field>
                <Field label="Instagram Handle">
                  <input
                    type="text" value={form.instagram}
                    onChange={e => set('instagram', e.target.value)}
                    placeholder="@yourhandle"
                    className={inputCls}
                  />
                </Field>
              </div>

              {/* Academic Info */}
              <div className="px-6 py-5 border-b border-[#F0EEEB]">
                <p className="font-display font-[500] text-[15px] text-[#1A1A1A]">Academic Details</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#F0EEEB]">
                <Field label="University / School" required>
                  <input
                    type="text" required value={form.university}
                    onChange={e => set('university', e.target.value)}
                    placeholder="e.g. University of Lagos"
                    className={`${inputCls} md:col-span-2`}
                  />
                </Field>
                <Field label="Course of Study" required>
                  <input
                    type="text" required value={form.course}
                    onChange={e => set('course', e.target.value)}
                    placeholder="e.g. Computer Science"
                    className={inputCls}
                  />
                </Field>
                <Field label="Year of Study" required>
                  <select
                    required value={form.year}
                    onChange={e => set('year', e.target.value)}
                    className={`${inputCls} cursor-pointer`}
                  >
                    <option value="" disabled>Select year</option>
                    {YEAR_OPTIONS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Why apply */}
              <div className="px-6 py-5 border-b border-[#F0EEEB]">
                <p className="font-display font-[500] text-[15px] text-[#1A1A1A]">Your Application</p>
              </div>
              <div className="p-6 border-b border-[#F0EEEB]">
                <Field label="Why do you want to be an LSCE Ambassador?" required>
                  <textarea
                    required value={form.why_apply}
                    onChange={e => set('why_apply', e.target.value)}
                    placeholder="Tell us what excites you about this role and what you'd bring to the programme…"
                    rows={6}
                    className={`${inputCls} resize-none`}
                  />
                  <p className="font-sans text-[11px] mt-1"
                    style={{ color: form.why_apply.length >= 50 ? '#22c55e' : '#1A1A1A40' }}>
                    {form.why_apply.length >= 50
                      ? `${form.why_apply.length} characters ✓`
                      : `Minimum 50 characters (${Math.max(0, 50 - form.why_apply.length)} more needed)`}
                  </p>
                </Field>
              </div>

              {/* Error + Submit */}
              <div className="p-6 flex flex-col gap-4">
                {(state === 'error') && error && (
                  <div className="bg-[#FFF5F5] border border-[#FFD5D5] rounded-[10px] px-4 py-3 font-sans text-[13px] text-[#FF2035]">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!valid || state === 'submitting'}
                  className="w-full py-4 rounded-[60px] font-sans text-[15px] font-semibold transition-all"
                  style={{
                    background: valid && state !== 'submitting' ? '#FF2035' : '#E5E5E5',
                    color:      valid && state !== 'submitting' ? 'white'   : '#999',
                    cursor:     valid && state !== 'submitting' ? 'pointer' : 'not-allowed',
                  }}
                >
                  {state === 'submitting' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Submitting…
                    </span>
                  ) : 'Submit Application →'}
                </button>
                <p className="font-sans text-[12px] text-[#1A1A1A]/35 text-center">
                  By applying you agree to be contacted by the LSCE team regarding your application.
                </p>
              </div>

            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
