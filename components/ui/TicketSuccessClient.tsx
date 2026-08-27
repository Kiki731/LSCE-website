'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TICKET_TYPES } from '@/lib/ticket-config'

type State = 'verifying' | 'success' | 'error'

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

interface OrderDetails {
  orderId:     string
  buyerName:   string
  buyerEmail:  string
  ticketType:  string
  quantity:    number
  totalAmount: number
  ticketCodes: string[]
  reference:   string
}

function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

export default function TicketSuccessClient() {
  const [state, setState]           = useState<State>('verifying')
  const [details, setDetails]       = useState<OrderDetails | null>(null)
  const [errorMsg, setErrorMsg]     = useState('')
  const [downloading, setDownloading] = useState(false)

  function handleDownload(d: OrderDetails) {
    setDownloading(true)
    try {
      const { generateTicketPDF } = require('@/lib/generate-ticket-pdf')
      generateTicketPDF({
        buyerName:   d.buyerName,
        buyerEmail:  d.buyerEmail,
        ticketType:  d.ticketType,
        quantity:    d.quantity,
        totalAmount: d.totalAmount,
        ticketCodes: d.ticketCodes,
        reference:   d.reference,
      })
    } catch (e) {
      console.error('Download failed:', e)
      alert('Pop-ups may be blocked. Please allow pop-ups for this site and try again.')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    async function process() {
      const params    = new URLSearchParams(window.location.search)
      const reference = params.get('reference') || params.get('trxref')

      if (!reference) {
        setErrorMsg('No payment reference found. If you completed a payment, contact support.')
        setState('error')
        return
      }

      try {
        const isFree = sessionStorage.getItem('lsce_free_ref') === reference

        let verifyData: { valid: boolean; email?: string; amountNaira?: number; metadata?: Record<string, unknown> } = { valid: true }
        if (!isFree) {
          const verifyRes = await fetch('/api/tickets/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference }),
          })
          verifyData = await verifyRes.json()

          if (!verifyData.valid) {
            setErrorMsg('Payment could not be verified. Reference: ' + reference)
            setState('error')
            return
          }
        }

        const pendingRaw = sessionStorage.getItem('lsce_pending_order')
        const pending    = pendingRaw ? JSON.parse(pendingRaw) : null

        const meta = verifyData.metadata ?? {}
        const orderPayload = pending ?? {
          buyer_name:      meta.buyer_name   ?? verifyData.email,
          buyer_email:     verifyData.email,
          buyer_phone:     meta.buyer_phone  ?? null,
          ticket_type:     meta.ticket_type  ?? 'bronze',
          quantity:        meta.quantity     ?? 1,
          unit_price:      Math.round((verifyData.amountNaira ?? 0) / (meta.quantity as number ?? 1)),
          discount_code:   meta.discount_code   ?? null,
          discount_amount: meta.discount_amount ?? 0,
          total_amount:    verifyData.amountNaira ?? 0,
          attendee_emails: [verifyData.email],
        }

        const orderRes  = await fetch('/api/tickets/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...orderPayload, paystack_reference: reference }),
        })
        const orderData = await orderRes.json()

        if (orderData.success || orderData.duplicate) {
          sessionStorage.removeItem('lsce_pending_order')
          sessionStorage.removeItem('lsce_free_ref')

          const confirmedTotal    = orderData.totalAmount ?? orderPayload.total_amount
          const confirmedTier     = orderData.ticketType  ?? orderPayload.ticket_type
          const confirmedQuantity = orderData.quantity    ?? orderPayload.quantity

          // Only fire Purchase on fresh orders, not duplicates (page refresh)
          if (orderData.success && !orderData.duplicate) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(window as any).fbq?.('track', 'Purchase', {
              value:        confirmedTotal,
              currency:     'NGN',
              num_items:    confirmedQuantity,
              content_type: 'product',
              content_ids:  [confirmedTier],
            })
          }

          setDetails({
            orderId:     orderData.orderId,
            buyerName:   orderData.buyerName   ?? orderPayload.buyer_name,
            buyerEmail:  orderData.buyerEmail  ?? orderPayload.buyer_email,
            ticketType:  confirmedTier,
            quantity:    confirmedQuantity,
            totalAmount: confirmedTotal,
            ticketCodes: orderData.ticketCodes ?? [],
            reference,
          })
          setState('success')
        } else {
          setErrorMsg('Payment received but order save failed. Keep your ref: ' + reference)
          setState('error')
        }
      } catch {
        setErrorMsg('Something went wrong. Keep your reference: ' + reference)
        setState('error')
      }
    }

    process()
  }, [])

  /* ── Verifying ── */
  if (state === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-5">
        <div className="w-10 h-10 rounded-full border-2 border-[#FF2035] border-t-transparent animate-spin" />
        <p className="font-sans text-[14px] text-[#1A1A1A]/60">Confirming your payment…</p>
      </div>
    )
  }

  /* ── Error ── */
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-5 text-center">
        <div className="w-14 h-14 rounded-full bg-[#FF2035]/10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#FF2035" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display font-[500] text-[24px] text-[#1A1A1A]">Something went wrong</h1>
          <p className="font-sans text-[14px] text-[#1A1A1A]/60 mt-2 max-w-[420px]">{errorMsg}</p>
        </div>
        <Link
          href="mailto:lagosstudentcareerexpo@gmail.com"
          className="inline-flex items-center gap-1.5 bg-[#1A1A1A] text-white px-5 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:opacity-80 transition-opacity"
        >
          Contact Support
        </Link>
      </div>
    )
  }

  /* ── Success ── */
  const d           = details!
  const ticket      = TICKET_TYPES[d.ticketType as keyof typeof TICKET_TYPES]
  const tierColor   = TIER_COLORS[d.ticketType] ?? '#FF2035'
  const tierBg      = TIER_BG[d.ticketType] ?? '#F7F5F2'
  const ticketImage = TICKET_IMAGES[d.ticketType]
  const firstName   = d.buyerName.split(' ')[0]

  return (
    <div className="min-h-screen bg-[#F7F5F2]">

      {/* ── Full-width event banner — sits flush under the navbar ── */}
      <div className="w-full" style={{ paddingTop: 72 }}>
        <Image
          src="/images/EMERGE Themee Reveal Header.png"
          alt="Lagos Students Career Expo 3.0 — Emerge Beyond"
          width={1440}
          height={480}
          className="w-full h-auto block"
          priority
        />
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-col items-center gap-8 px-5 py-[60px] md:py-[80px]">

        {/* Success badge + headline */}
        <div className="flex flex-col items-center gap-4 text-center max-w-[520px]">
          <div
            className="flex items-center justify-center w-[60px] h-[60px] rounded-full"
            style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}
          >
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path d="M5 14L11 20L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="font-display font-[500] text-[36px] md:text-[52px] text-[#1A1A1A] leading-[1.1]">
              You&apos;re{' '}
              <span className="text-[#FF2035]">in,</span>{' '}
              {firstName}.
            </h1>
            <p className="font-sans text-[14px] md:text-[15px] text-[#1A1A1A]/60 leading-[1.6] mt-2">
              Payment confirmed. Your confirmation and QR code have been sent to{' '}
              <span className="font-semibold text-[#1A1A1A]">{d.buyerEmail}</span>.
            </p>
          </div>
        </div>

        {/* ── Ticket card ── */}
        <div
          className="w-full max-w-[460px] bg-white rounded-[20px] overflow-hidden"
          style={{ border: `2px solid ${tierColor}60`, boxShadow: `0 4px 32px ${tierColor}18` }}
        >

          {/* Ticket type image header */}
          <div
            className="flex items-center justify-center px-8 py-6"
            style={{ backgroundColor: tierBg, borderBottom: `2px solid ${tierColor}40` }}
          >
            {ticketImage && (
              <Image
                src={ticketImage}
                alt={ticket?.name ?? d.ticketType}
                width={320}
                height={120}
                className="w-full max-w-[260px] h-auto object-contain"
              />
            )}
          </div>

          <div className="p-6 flex flex-col gap-5">

            {/* Buyer */}
            <div>
              <p className="font-display font-[500] text-[20px] text-[#1A1A1A] leading-none">{d.buyerName}</p>
              <p className="font-sans text-[13px] text-[#1A1A1A]/50 mt-1">{d.buyerEmail}</p>
            </div>

            <div className="h-px bg-[#E5E5E5]" />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-sans text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider mb-1">Ticket</p>
                <p className="font-display font-[500] text-[15px] text-[#1A1A1A]">{ticket?.name ?? d.ticketType}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider mb-1">Seats</p>
                <p className="font-display font-[500] text-[15px] text-[#1A1A1A]">{d.quantity}</p>
              </div>
              <div>
                <p className="font-sans text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider mb-1">Total Paid</p>
                <p className="font-display font-[500] text-[15px] text-[#1A1A1A]">{formatNaira(d.totalAmount)}</p>
              </div>
            </div>

            <div className="h-px bg-[#E5E5E5]" />

            {/* Ticket IDs */}
            <div>
              <p className="font-sans text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider mb-3">
                {d.ticketCodes.length > 1 ? 'Your Ticket IDs' : 'Your Ticket ID'}
              </p>
              <div className="flex flex-col gap-2">
                {d.ticketCodes.length > 0 ? (
                  d.ticketCodes.map((code, i) => (
                    <div key={code} className="flex items-center bg-[#F7F5F2] rounded-[10px] px-4 py-3">
                      {d.ticketCodes.length > 1 && (
                        <span className="font-sans text-[11px] text-[#1A1A1A]/40 mr-3 shrink-0">Seat {i + 1}</span>
                      )}
                      <code className="font-mono font-semibold text-[18px] text-[#1A1A1A] tracking-[0.12em] flex-1 min-w-0">
                        {code}
                      </code>
                      <button
                        onClick={() => navigator.clipboard?.writeText(code)}
                        className="ml-3 text-[#1A1A1A]/30 hover:text-[#FF2035] transition-colors shrink-0"
                        title="Copy code"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <rect x="1" y="3" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                          <path d="M4 3V2a1 1 0 011-1h7a1 1 0 011 1v9a1 1 0 01-1 1h-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="font-sans text-[12px] text-[#1A1A1A]/40">
                    Check your email — your ticket ID(s) are in the confirmation we just sent.
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-[#E5E5E5]" />

            {/* Event info */}
            <div className="flex flex-col gap-1.5">
              <p className="font-sans text-[13px] text-[#1A1A1A]/70">📅 Saturday, November 28th, 2026</p>
              <p className="font-sans text-[13px] text-[#1A1A1A]/70">📍 Daystar Christian Centre, Ikeja, Lagos</p>
            </div>

            {/* Email notice */}
            <div className="flex items-start gap-3 bg-[#F0FDF4] rounded-[10px] px-4 py-3.5 border border-green-100">
              <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1.5 4.5l6.5 5 6.5-5" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="#22c55e" strokeWidth="1.4"/>
              </svg>
              <p className="font-sans text-[12px] text-green-700 leading-[1.5]">
                Full confirmation with QR code sent to <strong>{d.buyerEmail}</strong>. Check your inbox and spam folder.
              </p>
            </div>

            {/* Payment ref */}
            <div className="flex items-center justify-between">
              <p className="font-sans text-[11px] text-[#1A1A1A]/35 uppercase tracking-wider">Payment Ref</p>
              <p className="font-mono text-[11px] text-[#1A1A1A]/40">{d.reference}</p>
            </div>

          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-center">
          <button
            onClick={() => handleDownload(d)}
            disabled={downloading}
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {downloading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                Generating…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 1v9M4 7l3.5 3.5L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1.5 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Download Ticket
              </>
            )}
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-6 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:opacity-90 transition-opacity"
          >
            Back to Home
            <Image src="/icons/Button star.svg" alt="" width={12} height={12} className="size-[12px]" />
          </Link>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 bg-[#1A1A1A]/8 text-[#1A1A1A] px-6 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:bg-[#1A1A1A]/15 transition-colors"
          >
            View Gallery
          </Link>
        </div>

      </div>
    </div>
  )
}
