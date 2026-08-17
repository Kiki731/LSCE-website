'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { TICKET_TYPES } from '@/lib/ticket-config'

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A9AD',
  gold:   '#D4AF37',
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
  const params                    = useParams()
  const code                      = (params.code as string).toUpperCase()
  const [attendee, setAttendee]   = useState<AttendeeData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)

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
          <div className="section-container pt-[130px] pb-[100px] flex flex-col items-center gap-4">
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
          <div className="section-container pt-[130px] pb-[100px] flex flex-col items-center gap-5 text-center">
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
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const tier      = attendee.orders?.ticket_type ?? 'bronze'
  const tierColor = TIER_COLORS[tier] ?? '#FF2035'
  const ticket    = TICKET_TYPES[tier as keyof typeof TICKET_TYPES]

  return (
    <>
      <Navbar />
      <main className="bg-[#F7F5F2] min-h-screen">
        <div className="section-container pt-[130px] pb-[100px] flex flex-col items-center gap-6">

          <div className="text-center">
            <p className="font-sans text-[13px] text-[#1A1A1A]/40 uppercase tracking-wider mb-1">LSCE 2026</p>
            <h1 className="font-display font-[500] text-[28px] text-[#1A1A1A]">Your Ticket</h1>
          </div>

          {/* Ticket card */}
          <div className="w-full max-w-[400px] bg-white border border-[#E5E5E5] rounded-[20px] overflow-hidden shadow-sm">
            <div className="h-1.5 w-full" style={{ background: tierColor }} />
            <div className="p-6 flex flex-col gap-5">

              {/* Name & email */}
              <div>
                <p className="font-display font-[500] text-[20px] text-[#1A1A1A]">
                  {attendee.name ?? attendee.email}
                </p>
                {attendee.name && (
                  <p className="font-sans text-[13px] text-[#1A1A1A]/50">{attendee.email}</p>
                )}
              </div>

              <div className="h-px bg-[#E5E5E5]" />

              {/* Tier badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] font-sans text-[12px] font-semibold"
                  style={{ background: tierColor + '22', color: tierColor }}>
                  {ticket?.name ?? tier}
                </span>
                <span className="font-sans text-[12px] text-[#1A1A1A]/40">LSCE 2026</span>
              </div>

              <div className="h-px bg-[#E5E5E5]" />

              {/* Ticket ID */}
              <div>
                <p className="font-sans text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider mb-2">Ticket ID</p>
                <code className="font-mono font-semibold text-[24px] text-[#1A1A1A] tracking-[0.12em]">
                  {attendee.ticket_code}
                </code>
              </div>

              {/* QR code */}
              <div className="flex justify-center py-1">
                <img
                  src={`/api/qr/${attendee.ticket_code}`}
                  alt="QR Code"
                  width={160}
                  height={160}
                  className="rounded-[10px] border-4 border-[#F7F5F2]"
                />
              </div>

              {/* Event info */}
              <div className="bg-[#F7F5F2] rounded-[10px] p-4 text-center">
                <p className="font-sans text-[13px] text-[#1A1A1A]/70 leading-[1.7]">
                  📅 Saturday, October 3rd, 2026<br />
                  📍 Daystar Christian Centre, Ikeja, Lagos
                </p>
              </div>

            </div>
          </div>

          {/* Print / download button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-[#FF2035] text-white px-6 py-3 rounded-[24px] font-sans text-[14px] font-semibold hover:opacity-90 transition-opacity print:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6V2h8v4M4 12H3a1 1 0 01-1-1V7a1 1 0 011-1h10a1 1 0 011 1v4a1 1 0 01-1 1h-1M4 10h8v4H4v-4z" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Print / Save as PDF
          </button>

          <p className="font-sans text-[12px] text-[#1A1A1A]/30 text-center print:hidden">
            Use your browser&apos;s print dialog to save as PDF
          </p>

        </div>
      </main>
      <Footer />
    </>
  )
}
