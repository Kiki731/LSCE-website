'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type State = 'verifying' | 'success' | 'error'

export default function TicketSuccessClient() {
  const [state, setState] = useState<State>('verifying')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [ref, setRef] = useState('')

  useEffect(() => {
    async function process() {
      // Paystack appends ?trxref=xxx&reference=xxx to the callback URL
      const params = new URLSearchParams(window.location.search)
      const reference = params.get('reference') || params.get('trxref')

      if (!reference) {
        setErrorMsg('No payment reference found. If you completed a payment, contact support.')
        setState('error')
        return
      }

      setRef(reference)

      try {
        // 1 — Verify with Paystack server-side
        const verifyRes = await fetch('/api/tickets/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        })
        const verifyData = await verifyRes.json()

        if (!verifyData.valid) {
          setErrorMsg('Payment could not be verified. Reference: ' + reference)
          setState('error')
          return
        }

        // 2 — Retrieve buyer info stored before redirect
        const pendingRaw = sessionStorage.getItem('lsce_pending_order')
        const pending = pendingRaw ? JSON.parse(pendingRaw) : null

        // 3 — Save order (use pending data if available; fallback to Paystack metadata)
        const meta = verifyData.metadata ?? {}
        const orderPayload = pending ?? {
          buyer_name:      meta.buyer_name   ?? verifyData.email,
          buyer_email:     verifyData.email,
          buyer_phone:     meta.buyer_phone  ?? null,
          ticket_type:     meta.ticket_type  ?? 'bronze',
          quantity:        meta.quantity     ?? 1,
          unit_price:      Math.round(verifyData.amountNaira / (meta.quantity ?? 1)),
          discount_code:   meta.discount_code   ?? null,
          discount_amount: meta.discount_amount ?? 0,
          total_amount:    verifyData.amountNaira,
          attendee_emails: [verifyData.email],
        }

        const orderRes = await fetch('/api/tickets/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...orderPayload, paystack_reference: reference }),
        })
        const orderData = await orderRes.json()

        if (orderData.success || orderData.duplicate) {
          setOrderId(orderData.orderId)
          sessionStorage.removeItem('lsce_pending_order')
          setState('success')
        } else {
          setErrorMsg('Payment received but order save failed. Keep your ref: ' + reference)
          setState('error')
        }
      } catch {
        setErrorMsg('Something went wrong. Keep your ref: ' + reference)
        setState('error')
      }
    }

    process()
  }, [])

  /* ── Verifying ── */
  if (state === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 pt-[160px]">
        <div className="w-10 h-10 rounded-full border-2 border-[#FF2035] border-t-transparent animate-spin" />
        <p className="font-sans text-[14px] text-[#1A1A1A]/60">Confirming your payment…</p>
      </div>
    )
  }

  /* ── Error ── */
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-5 pt-[160px] text-center">
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
  return (
    <div className="relative overflow-hidden">

      {/* Decorative stars */}
      <div aria-hidden className="pointer-events-none absolute top-10 right-[-130px] md:right-[-180px]" style={{ width: 600, height: 600, zIndex: 0 }}>
        <Image src="/icons/Star 4 top right.png" alt="" fill className="object-contain" />
      </div>
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-[-180px]" style={{ width: 600, height: 600, zIndex: 0 }}>
        <Image src="/icons/Star Mid left.png" alt="" fill className="object-contain" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-7 pt-[160px] pb-[120px] px-5">

        {/* Check circle */}
        <div
          className="flex items-center justify-center w-16 h-16 rounded-full"
          style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M5 14L11 20L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="flex flex-col gap-3 max-w-[500px]">
          <h1 className="font-display font-[500] text-[32px] md:text-[48px] text-[#1A1A1A] leading-[1.15]">
            You&apos;re{' '}
            <span className="text-[#FF2035]">in.</span>
          </h1>
          <p className="font-sans text-[15px] md:text-[17px] text-[#1A1A1A]/65 leading-[1.5]">
            Your ticket is confirmed and a confirmation email is on its way.
            We&apos;ll see you at LSCE 2026.
          </p>
        </div>

        {/* Ref */}
        {ref && (
          <div className="bg-white border border-[#E5E5E5] rounded-[14px] px-6 py-4 flex flex-col gap-1">
            <p className="font-sans text-[11px] text-[#1A1A1A]/40 uppercase tracking-wider">Payment Reference</p>
            <p className="font-display font-[500] text-[15px] text-[#1A1A1A]">{ref}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
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
