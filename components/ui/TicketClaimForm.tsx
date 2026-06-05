'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TICKET_TYPES } from '@/lib/ticket-config'

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold:   '#D4AF37',
}

interface AttendeeOrder {
  buyer_name:   string
  buyer_email:  string
  ticket_type:  string
  total_amount: number
}

interface Attendee {
  id:          string
  email:       string
  name:        string | null
  ticket_code: string
  checked_in:  boolean
  orders:      AttendeeOrder
}

type State = 'loading' | 'ready' | 'claimed' | 'already_named' | 'not_found' | 'success'

export default function TicketClaimForm({ code }: { code: string }) {
  const [state, setState]     = useState<State>('loading')
  const [attendee, setAttendee] = useState<Attendee | null>(null)
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    fetch(`/api/tickets/claim?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.attendee) { setState('not_found'); return }
        setAttendee(data.attendee)
        // Pre-fill name if already set
        if (data.attendee.name) {
          setName(data.attendee.name)
          setState('already_named')
        } else {
          setState('ready')
        }
      })
      .catch(() => setState('not_found'))
  }, [code])

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setSubmitting(true)
    setError('')

    const res  = await fetch('/api/tickets/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name: name.trim(), phone: phone.trim() }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Try again.')
      setSubmitting(false)
      return
    }

    setAttendee(a => a ? { ...a, name: name.trim() } : a)
    setState('success')
    setSubmitting(false)
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF2035] border-t-transparent animate-spin" />
        <p className="font-sans text-[14px] text-[#1A1A1A]/50">Looking up your ticket…</p>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (state === 'not_found') {
    return (
      <div className="w-full max-w-[440px] text-center flex flex-col items-center gap-5 py-12">
        <div className="w-14 h-14 rounded-full bg-[#FF2035]/10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#FF2035" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display font-[500] text-[22px] text-[#1A1A1A]">Ticket not found</h1>
          <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2 leading-[1.6]">
            The ticket code <code className="font-mono bg-[#1A1A1A]/8 px-1.5 py-0.5 rounded text-sm">{code}</code> doesn&apos;t match any ticket.
            Check the link you received and try again.
          </p>
        </div>
        <Link href="mailto:lagosstudentcareerexpo@gmail.com"
          className="font-sans text-[13px] text-[#FF2035] hover:underline">Contact support →</Link>
      </div>
    )
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (state === 'success' && attendee) {
    const tier      = attendee.orders?.ticket_type ?? 'bronze'
    const tierColor = TIER_COLORS[tier] ?? '#FF2035'
    const ticket    = TICKET_TYPES[tier as keyof typeof TICKET_TYPES]

    return (
      <div className="w-full max-w-[480px] flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full"
          style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 14L11 20L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="text-center">
          <h1 className="font-display font-[500] text-[28px] md:text-[36px] text-[#1A1A1A] leading-[1.2]">
            Ticket claimed! 🎉
          </h1>
          <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2 leading-[1.6]">
            Welcome to LSCE 2026. You&apos;re all set — show your Ticket ID at the entrance.
          </p>
        </div>

        {/* Ticket card */}
        <div className="w-full bg-white border border-[#E5E5E5] rounded-[20px] overflow-hidden shadow-sm">
          <div className="h-1.5 w-full" style={{ background: tierColor }} />
          <div className="p-6 flex flex-col gap-5">
            <div>
              <p className="font-display font-[500] text-[18px] text-[#1A1A1A]">{name}</p>
              <p className="font-sans text-[13px] text-[#1A1A1A]/50">{attendee.email}</p>
            </div>
            <div className="h-px bg-[#E5E5E5]" />
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] font-sans text-[12px] font-semibold"
                style={{ background: tierColor + '22', color: tierColor }}>
                {ticket?.name ?? tier}
              </span>
              <span className="font-sans text-[12px] text-[#1A1A1A]/40">LSCE 2026</span>
            </div>
            <div className="h-px bg-[#E5E5E5]" />
            <div>
              <p className="font-sans text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider mb-2">Your Ticket ID</p>
              <code className="font-mono font-semibold text-[24px] text-[#1A1A1A] tracking-[0.12em]">
                {attendee.ticket_code}
              </code>
            </div>
            <div className="flex justify-center pt-1">
              {/* QR code via our hosted endpoint */}
              <img
                src={`/api/qr/${attendee.ticket_code}`}
                alt="QR Code"
                width={140}
                height={140}
                className="rounded-[10px] border-4 border-[#F7F5F2]"
              />
            </div>
            <p className="font-sans text-[11px] text-[#1A1A1A]/40 text-center leading-[1.5]">
              📅 Saturday, October 3rd, 2026 · Landmark Event Centre, Lagos
            </p>
          </div>
        </div>

        <Link href="/"
          className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-6 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:opacity-90 transition-opacity">
          Visit thelscexpo.com
          <Image src="/icons/Button star.svg" alt="" width={12} height={12} className="size-[12px]" />
        </Link>
      </div>
    )
  }

  // ── Already named (visited link again after claiming) ────────────────────────
  if (state === 'already_named' && attendee) {
    const tier      = attendee.orders?.ticket_type ?? 'bronze'
    const tierColor = TIER_COLORS[tier] ?? '#FF2035'
    const ticket    = TICKET_TYPES[tier as keyof typeof TICKET_TYPES]

    return (
      <div className="w-full max-w-[480px] flex flex-col items-center gap-6 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: tierColor + '22' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 11l7 7 9-9" stroke={tierColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display font-[500] text-[24px] text-[#1A1A1A]">Already claimed</h1>
          <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2 leading-[1.6]">
            This ticket was already claimed by <strong>{attendee.name}</strong>.
            Your {ticket?.name ?? tier} is confirmed for LSCE 2026.
          </p>
        </div>
        <code className="font-mono text-[20px] font-semibold text-[#1A1A1A] tracking-[0.12em] bg-white border border-[#E5E5E5] px-5 py-3 rounded-[10px]">
          {attendee.ticket_code}
        </code>
        <p className="font-sans text-[12px] text-[#1A1A1A]/40">
          Not you? Contact <a href="mailto:lagosstudentcareerexpo@gmail.com" className="text-[#FF2035] hover:underline">lagosstudentcareerexpo@gmail.com</a>
        </p>
      </div>
    )
  }

  // ── Claim form ───────────────────────────────────────────────────────────────
  if (!attendee) return null
  const tier      = attendee.orders?.ticket_type ?? 'bronze'
  const tierColor = TIER_COLORS[tier] ?? '#FF2035'
  const ticket    = TICKET_TYPES[tier as keyof typeof TICKET_TYPES]
  const buyerName = attendee.orders?.buyer_name ?? 'Someone'

  return (
    <div className="w-full max-w-[480px] flex flex-col gap-6">

      {/* Header */}
      <div className="text-center flex flex-col gap-3">
        <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto"
          style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="8" width="20" height="14" rx="2" stroke="white" strokeWidth="1.8"/>
            <path d="M4 12h20M10 8V6a2 2 0 014 0v2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="font-sans text-[13px] text-[#FF2035] font-semibold uppercase tracking-wider mb-1">
            Your ticket is ready
          </p>
          <h1 className="font-display font-[500] text-[26px] md:text-[32px] text-[#1A1A1A] leading-[1.2]">
            {buyerName} bought you<br />a ticket to LSCE 2026
          </h1>
          <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2 leading-[1.6]">
            Confirm your details below to claim your <strong>{ticket?.name ?? tier}</strong> and lock in your spot.
          </p>
        </div>
      </div>

      {/* Ticket preview strip */}
      <div className="bg-white border border-[#E5E5E5] rounded-[14px] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] font-sans text-[12px] font-semibold"
            style={{ background: tierColor + '22', color: tierColor }}>
            {ticket?.name ?? tier}
          </span>
          <div>
            <p className="font-sans text-[12px] text-[#1A1A1A]/50">LSCE 2026</p>
            <p className="font-sans text-[11px] text-[#1A1A1A]/30">Oct 3rd · Landmark Event Centre</p>
          </div>
        </div>
        <code className="font-mono text-[13px] text-[#1A1A1A]/50 tracking-wider">{attendee.ticket_code}</code>
      </div>

      {/* Claim form */}
      <form onSubmit={handleClaim} className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <p className="font-display font-[500] text-[14px] text-[#1A1A1A]">Your Details</p>
          <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">Complete your registration to claim this ticket</p>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Email — read only */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/70">Email Address</label>
            <input
              type="email" value={attendee.email} readOnly
              className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A]/50 bg-[#F7F5F2] cursor-not-allowed"
            />
          </div>

          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/70">
              Full Name <span className="text-[#FF2035]">*</span>
            </label>
            <input
              type="text" required value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your full name"
              className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/70">
              Phone Number <span className="text-[#FF2035]">*</span>
            </label>
            <input
              type="tel" required value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 000 000 0000"
              className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"
            />
          </div>

          {error && (
            <p className="font-sans text-[12px] text-[#FF2035] bg-[#FFF5F5] border border-[#FFD5D5] rounded-[8px] px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={submitting || name.trim().length < 2 || phone.trim().length < 6}
            className="w-full py-3.5 rounded-[60px] font-sans text-[14px] font-semibold transition-all"
            style={{
              background: (!submitting && name.trim().length >= 2 && phone.trim().length >= 6) ? '#FF2035' : '#E5E5E5',
              color:      (!submitting && name.trim().length >= 2 && phone.trim().length >= 6) ? 'white'   : '#999',
            }}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Claiming…
              </span>
            ) : 'Claim My Ticket →'}
          </button>
        </div>
      </form>

    </div>
  )
}
