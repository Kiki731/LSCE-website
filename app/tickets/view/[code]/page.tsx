'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { TICKET_TYPES } from '@/lib/ticket-config'

const TIER_COLORS: Record<string, string> = {
  bronze: '#00CF01',
  silver: '#FFBD4D',
  gold:   '#F11429',
}

const TIER_BG: Record<string, string> = {
  bronze: '#BAFFBA',
  silver: '#FDF0D9',
  gold:   '#FFE3E6',
}

const TICKET_IMAGES: Record<string, string> = {
  bronze: '/gallery/The Spark.png',
  silver: '/gallery/The Rise.png',
  gold:   '/gallery/The Emergence.png',
}

interface AttendeeData {
  id:          string
  email:       string
  name:        string | null
  ticket_code: string
  checked_in:  boolean
  orders: {
    ticket_type:  string
    buyer_name:   string
    total_amount: number
  }
}

export default function TicketViewPage() {
  const params                  = useParams()
  const code                    = (params.code as string).toUpperCase()
  const [attendee, setAttendee] = useState<AttendeeData | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/tickets/claim?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.attendee) { setNotFound(true); return }
        setAttendee(data.attendee)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="bg-[#F7F5F2] min-h-screen">
          <div className="section-container pt-[140px] pb-[100px] flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF2035] border-t-transparent animate-spin" />
            <p className="font-sans text-[14px] text-[#1A1A1A]/50">Loading your ticket…</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (notFound || !attendee) {
    return (
      <>
        <Navbar />
        <main className="bg-[#F7F5F2] min-h-screen">
          <div className="section-container pt-[140px] pb-[100px] flex flex-col items-center gap-5 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FF2035]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#FF2035" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="font-display font-[500] text-[22px] text-[#1A1A1A]">Ticket not found</h1>
              <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2">
                Code <code className="font-mono bg-[#1A1A1A]/8 px-1.5 py-0.5 rounded">{code}</code> doesn&apos;t match any ticket.
              </p>
            </div>
            <Link href="/tickets"
              className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:opacity-90 transition-opacity">
              Get a Ticket
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const tier        = attendee.orders?.ticket_type ?? 'bronze'
  const tierColor   = TIER_COLORS[tier] ?? '#FF2035'
  const tierBg      = TIER_BG[tier] ?? '#F7F5F2'
  const ticket      = TICKET_TYPES[tier as keyof typeof TICKET_TYPES]
  const ticketImage = TICKET_IMAGES[tier]
  const displayName = attendee.name ?? attendee.email

  return (
    <>
      <Navbar />
      <main className="bg-[#F7F5F2] min-h-screen">
        <div className="section-container pt-[130px] pb-[100px] flex flex-col items-center gap-6">

          {/* Page title */}
          <div className="text-center">
            <p className="font-sans text-[12px] text-[#1A1A1A]/35 uppercase tracking-widest mb-1">
              Lagos Students Career Expo 2026
            </p>
            <h1 className="font-display font-[500] text-[26px] md:text-[32px] text-[#1A1A1A]">
              Your Ticket
            </h1>
          </div>

          {/* ── Ticket card ── */}
          <div
            className="w-full max-w-[400px] rounded-[22px] overflow-hidden"
            style={{
              border:     `2px solid ${tierColor}70`,
              boxShadow:  `0 8px 40px ${tierColor}20`,
            }}
          >

            {/* ── Ticket image header ── */}
            <div
              className="flex items-center justify-center px-8 py-6"
              style={{ backgroundColor: tierBg, borderBottom: `2px solid ${tierColor}40` }}
            >
              {ticketImage && (
                <Image
                  src={ticketImage}
                  alt={ticket?.name ?? tier}
                  width={320}
                  height={120}
                  className="w-full max-w-[240px] h-auto object-contain"
                  priority
                />
              )}
            </div>

            {/* ── Card body ── */}
            <div className="bg-white px-6 py-5 flex flex-col gap-5">

              {/* Attendee */}
              <div>
                <p className="font-display font-[500] text-[20px] text-[#1A1A1A] leading-tight">
                  {displayName}
                </p>
                {attendee.name && (
                  <p className="font-sans text-[13px] text-[#1A1A1A]/45 mt-1">{attendee.email}</p>
                )}
              </div>

              <div className="h-px bg-[#EBEBEB]" />

              {/* Ticket ID */}
              <div>
                <p className="font-sans text-[10px] text-[#1A1A1A]/35 uppercase tracking-widest mb-2">
                  Ticket ID
                </p>
                <code
                  className="font-mono font-bold text-[22px] tracking-[0.1em]"
                  style={{ color: tierColor }}
                >
                  {attendee.ticket_code}
                </code>
              </div>

              {/* QR code */}
              <div className="flex flex-col items-center gap-2 py-1">
                <div
                  className="p-3 rounded-[14px]"
                  style={{ backgroundColor: tierBg }}
                >
                  <img
                    src={`/api/qr/${attendee.ticket_code}`}
                    alt="QR Code"
                    width={160}
                    height={160}
                    className="block rounded-[6px]"
                  />
                </div>
                <p className="font-sans text-[11px] text-[#1A1A1A]/35 uppercase tracking-wider">
                  Scan at entrance
                </p>
              </div>

              <div className="h-px bg-[#EBEBEB]" />

              {/* Event info */}
              <div
                className="rounded-[12px] px-4 py-4 flex flex-col gap-1.5"
                style={{ backgroundColor: tierBg }}
              >
                <p className="font-sans text-[13px] text-[#1A1A1A]/75">
                  📅 Saturday, November 28th, 2026
                </p>
                <p className="font-sans text-[13px] text-[#1A1A1A]/75">
                  📍 Daystar Christian Centre, Ikeja, Lagos
                </p>
              </div>

              {/* Check-in status */}
              {attendee.checked_in && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-[10px] px-4 py-3">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="font-sans text-[12px] text-green-700 font-semibold">Checked in</p>
                </div>
              )}

            </div>

            {/* ── Bottom strip ── */}
            <div
              className="flex items-center justify-between px-6 py-3"
              style={{ backgroundColor: tierColor + '18', borderTop: `1px solid ${tierColor}30` }}
            >
              <p className="font-sans text-[11px] font-semibold uppercase tracking-wider" style={{ color: tierColor }}>
                {ticket?.name ?? tier}
              </p>
              <p className="font-sans text-[11px] text-[#1A1A1A]/30 uppercase tracking-wider">
                LSCE 2026
              </p>
            </div>

          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:opacity-80 transition-opacity"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M3.5 5V2h8v3M3.5 11H2.5a1 1 0 01-1-1V6.5a1 1 0 011-1h10a1 1 0 011 1V10a1 1 0 01-1 1h-1M3.5 9h8v4h-8V9z" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Print / Save as PDF
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-[#1A1A1A]/8 text-[#1A1A1A] px-6 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:bg-[#1A1A1A]/15 transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <p className="font-sans text-[11px] text-[#1A1A1A]/25 text-center print:hidden">
            Use your browser&apos;s print dialog and choose &quot;Save as PDF&quot;
          </p>

        </div>
      </main>
      <Footer />
    </>
  )
}
