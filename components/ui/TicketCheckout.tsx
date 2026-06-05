'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { TICKET_LIST, TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

/* ─────────────────────────────────────────────
   Step breadcrumb
───────────────────────────────────────────── */
function StepTrail({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 md:gap-8 mb-6 md:mb-8">
      <p
        className="font-display font-[500] text-[14px] md:text-[18px] leading-[1.2] whitespace-nowrap shrink-0 transition-colors"
        style={{ color: step >= 1 ? '#1A1A1A' : 'rgba(26,26,26,0.3)' }}
      >
        Select Ticket
      </p>
      <div className="flex-1 h-px bg-[#1A1A1A]/15" />
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <Image src="/icons/Button Star red.svg" alt="" width={12} height={12}
          className="size-[10px] md:size-[12px] transition-opacity"
          style={{ opacity: step >= 2 ? 1 : 0.3 }}
        />
        <p className="font-display font-[500] text-[14px] md:text-[18px] leading-[1.2] whitespace-nowrap transition-colors"
          style={{ color: step >= 2 ? '#1A1A1A' : 'rgba(26,26,26,0.4)' }}>
          Buyer Info
        </p>
      </div>
      <div className="flex-1 h-px bg-[#1A1A1A]/15" />
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <Image src="/icons/Button Star red.svg" alt="" width={12} height={12}
          className="size-[10px] md:size-[12px] opacity-30" />
        <p className="font-display font-[500] text-[14px] md:text-[18px] leading-[1.2] whitespace-nowrap text-[#1A1A1A]/30">
          Payment
        </p>
      </div>
    </div>
  )
}

interface BuyerInfo {
  name: string; email: string; phone: string
  belongsToMe: boolean; attendeeEmails: string[]
}

function formatNaira(n: number) { return '₦' + n.toLocaleString('en-NG') }

function StepBadge({ n, active }: { n: number; active: boolean }) {
  return (
    <span className="flex items-center justify-center w-6 h-6 rounded shrink-0 text-[11px] font-semibold"
      style={{ background: active ? '#1A1A1A' : '#E5E5E5', color: active ? '#fff' : '#999' }}>
      {n}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Desktop full ticket card (lg+)
───────────────────────────────────────────── */
function TicketCard({ tier, selected, onSelect, quantity, onQuantityChange }: {
  tier: TicketTier; selected: boolean; onSelect: () => void
  quantity: number; onQuantityChange: (q: number) => void
}) {
  const t = TICKET_TYPES[tier]
  return (
    <button type="button" onClick={onSelect}
      className="w-full text-left rounded-[16px] border-2 p-5 flex flex-col gap-3 transition-all duration-150"
      style={{ borderColor: selected ? '#FF2035' : '#E5E5E5', backgroundColor: selected ? '#FFF5F5' : '#FFFFFF' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-display font-[500] text-[16px] text-[#1A1A1A] leading-[1.2]">{t.name}</span>
          <span className="font-sans text-[12px] text-[#1A1A1A]/50 leading-none">{t.tagline}</span>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-display font-[500] text-[18px] leading-none" style={{ color: '#FF2035' }}>
              {formatNaira(t.price)}
            </span>
            <span className="font-sans text-[11px] text-[#1A1A1A]/40">per ticket</span>
          </div>
          {selected && (
            <div className="flex items-center gap-2 mt-1" onClick={e => e.stopPropagation()}>
              <button type="button" onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center font-sans text-[14px] text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">−</button>
              <span className="font-display font-[500] text-[15px] text-[#1A1A1A] w-5 text-center">{quantity}</span>
              <button type="button" onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
                className="w-7 h-7 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center font-sans text-[14px] text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">+</button>
            </div>
          )}
        </div>
      </div>
      <p className="font-sans text-[12px] text-[#1A1A1A]/60 leading-[1.5]">{t.description}</p>
      <ul className="flex flex-col gap-1.5">
        {t.perks.map((perk, i) => (
          <li key={i} className="flex items-center gap-2">
            <Image src="/icons/Button Star red.svg" alt="" width={10} height={10} className="shrink-0" />
            <span className="font-sans text-[12px] text-[#1A1A1A]/70">{perk}</span>
          </li>
        ))}
      </ul>
      {selected && (
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-2 h-2 rounded-full bg-[#FF2035]" />
          <span className="font-sans text-[11px] font-semibold text-[#FF2035]">Selected</span>
        </div>
      )}
    </button>
  )
}

/* ─────────────────────────────────────────────
   Mobile compact accordion ticket row
───────────────────────────────────────────── */
function MobileTicketRow({ tier, selected, onSelect, quantity, onQuantityChange }: {
  tier: TicketTier; selected: boolean; onSelect: () => void
  quantity: number; onQuantityChange: (q: number) => void
}) {
  const t = TICKET_TYPES[tier]
  return (
    <div
      className="rounded-[14px] border-2 overflow-hidden transition-all duration-200"
      style={{ borderColor: selected ? '#FF2035' : '#E5E5E5', background: selected ? '#FFF5F5' : '#FFFFFF' }}
    >
      {/* Always-visible row — tap to select */}
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          {/* Radio dot */}
          <span
            className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
            style={{ borderColor: selected ? '#FF2035' : '#CCCCCC' }}
          >
            {selected && <span className="w-2 h-2 rounded-full bg-[#FF2035]" />}
          </span>
          <div>
            <p className="font-display font-[500] text-[14px] text-[#1A1A1A] leading-none">{t.name}</p>
            <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">{t.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-display font-[500] text-[15px]" style={{ color: '#FF2035' }}>
            {formatNaira(t.price)}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            className="transition-transform duration-200"
            style={{ transform: selected ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M2 5l5 5 5-5" stroke="#1A1A1A" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Expanded details — only when selected */}
      {selected && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-[#FF2035]/15">
          <p className="font-sans text-[12px] text-[#1A1A1A]/60 leading-[1.5] pt-3">{t.description}</p>
          <ul className="flex flex-col gap-1.5">
            {t.perks.map((perk, i) => (
              <li key={i} className="flex items-center gap-2">
                <Image src="/icons/Button Star red.svg" alt="" width={9} height={9} className="shrink-0" />
                <span className="font-sans text-[11px] text-[#1A1A1A]/70">{perk}</span>
              </li>
            ))}
          </ul>
          {/* Quantity stepper */}
          <div className="flex items-center justify-between pt-2 border-t border-[#FF2035]/10">
            <p className="font-sans text-[12px] text-[#1A1A1A]/60">Quantity</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center font-sans text-[14px] text-[#1A1A1A]">−</button>
              <span className="font-display font-[500] text-[15px] text-[#1A1A1A] w-5 text-center">{quantity}</span>
              <button type="button" onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
                className="w-7 h-7 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center font-sans text-[14px] text-[#1A1A1A]">+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Order Summary (desktop right panel)
───────────────────────────────────────────── */
function OrderSummary({
  tier, quantity, discountCode, discountApplied, discountPct,
  onDiscountChange, onApplyDiscount, applyingCoupon,
  step, onContinue, onPay, buyerInfoValid, paying,
}: {
  tier: TicketTier | null; quantity: number; discountCode: string
  discountApplied: boolean; discountPct: number
  onDiscountChange: (v: string) => void; onApplyDiscount: () => void; applyingCoupon: boolean
  step: 1 | 2; onContinue: () => void; onPay: () => void; buyerInfoValid: boolean; paying: boolean
}) {
  const ticket = tier ? TICKET_TYPES[tier] : null
  const subtotal = ticket ? ticket.price * quantity : 0
  const discountAmount = discountApplied ? Math.round(subtotal * (discountPct / 100)) : 0
  const total = subtotal - discountAmount
  const canContinue = !!tier && quantity > 0
  const canPay = canContinue && buyerInfoValid

  return (
    <div className="rounded-[16px] border border-[#E5E5E5] bg-white overflow-hidden lg:sticky lg:top-32">
      <div className="px-5 py-4 border-b border-[#E5E5E5]">
        <h3 className="font-display font-[500] text-[15px] text-[#1A1A1A]">Order Summary</h3>
      </div>
      <div className="px-5 py-5 flex flex-col gap-5">
        {!ticket ? (
          <p className="font-sans text-[13px] text-[#1A1A1A]/40 text-center py-4">
            Select a ticket type to see your order summary
          </p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-[500] text-[13px] text-[#1A1A1A]">{ticket.name}</p>
                <p className="font-sans text-[12px] text-[#1A1A1A]/50">{quantity} × {formatNaira(ticket.price)}</p>
              </div>
              <span className="font-display font-[500] text-[13px] text-[#1A1A1A] shrink-0">{formatNaira(subtotal)}</span>
            </div>
            {discountApplied ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[12px] text-[#1A1A1A]/60">
                    Discount ({discountCode.toUpperCase()} · {discountPct}%)
                  </span>
                  <button type="button" onClick={() => onDiscountChange('')}
                    className="font-sans text-[11px] text-[#FF2035] underline">Remove</button>
                </div>
                <span className="font-sans text-[13px] text-[#1A1A1A]/70">−{formatNaira(discountAmount)}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[12px] text-[#1A1A1A]/60">Discount code</label>
                <div className="flex gap-2">
                  <input type="text" value={discountCode} onChange={e => onDiscountChange(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 border border-[#E5E5E5] rounded-[8px] px-3 py-2 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#FF2035] transition-colors uppercase placeholder:uppercase placeholder:text-[#1A1A1A]/30"
                  />
                  <button type="button" onClick={onApplyDiscount} disabled={applyingCoupon || discountCode.length < 3}
                    className="px-3 py-2 rounded-[8px] font-sans text-[12px] font-semibold transition-colors shrink-0"
                    style={{
                      background: discountCode.length > 2 && !applyingCoupon ? '#1A1A1A' : '#E5E5E5',
                      color: discountCode.length > 2 && !applyingCoupon ? '#fff' : '#999',
                    }}>
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              </div>
            )}
            <div className="h-px bg-[#E5E5E5]" />
            <div className="flex items-center justify-between">
              <span className="font-display font-[500] text-[14px] text-[#1A1A1A]">Total</span>
              <span className="font-display font-[500] text-[18px] text-[#1A1A1A]">{formatNaira(total)}</span>
            </div>
          </>
        )}
        {step === 1 ? (
          <button type="button" onClick={onContinue} disabled={!canContinue}
            className="w-full py-3 rounded-[60px] font-sans text-[14px] font-semibold transition-all duration-150"
            style={{ background: canContinue ? '#FF2035' : '#E5E5E5', color: canContinue ? '#fff' : '#999', cursor: canContinue ? 'pointer' : 'not-allowed' }}>
            Continue
          </button>
        ) : (
          <button type="button" onClick={onPay} disabled={!canPay || paying}
            className="w-full py-3 rounded-[60px] font-sans text-[14px] font-semibold transition-all duration-150"
            style={{ background: canPay && !paying ? '#FF2035' : '#E5E5E5', color: canPay && !paying ? '#fff' : '#999', cursor: canPay && !paying ? 'pointer' : 'not-allowed' }}>
            {paying ? 'Opening payment…' : 'Proceed to Pay'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Mobile step-2 mini order summary
   (shown inline in left column, above Pay btn)
───────────────────────────────────────────── */
function MobileOrderSummary({ tier, quantity, discountCode, discountApplied, discountPct, onDiscountChange, onApplyDiscount, applyingCoupon }: {
  tier: TicketTier; quantity: number; discountCode: string
  discountApplied: boolean; discountPct: number
  onDiscountChange: (v: string) => void; onApplyDiscount: () => void; applyingCoupon: boolean
}) {
  const ticket = TICKET_TYPES[tier]
  const subtotal = ticket.price * quantity
  const discountAmount = discountApplied ? Math.round(subtotal * (discountPct / 100)) : 0
  const total = subtotal - discountAmount

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-[14px] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E5E5E5]">
        <p className="font-display font-[500] text-[13px] text-[#1A1A1A]">Order Summary</p>
      </div>
      <div className="px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-[500] text-[13px] text-[#1A1A1A]">{ticket.name}</p>
            <p className="font-sans text-[11px] text-[#1A1A1A]/50">{quantity} × {formatNaira(ticket.price)}</p>
          </div>
          <span className="font-display font-[500] text-[13px] text-[#1A1A1A]">{formatNaira(subtotal)}</span>
        </div>
        {/* Discount */}
        {discountApplied ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-[11px] text-[#1A1A1A]/60">
                {discountCode.toUpperCase()} · {discountPct}% off
              </span>
              <button type="button" onClick={() => onDiscountChange('')}
                className="font-sans text-[10px] text-[#FF2035] underline">Remove</button>
            </div>
            <span className="font-sans text-[12px] text-[#1A1A1A]/60">−{formatNaira(discountAmount)}</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input type="text" value={discountCode} onChange={e => onDiscountChange(e.target.value)}
              placeholder="Discount code"
              className="flex-1 border border-[#E5E5E5] rounded-[8px] px-3 py-2 font-sans text-[12px] text-[#1A1A1A] outline-none focus:border-[#FF2035] transition-colors uppercase placeholder:normal-case placeholder:text-[#1A1A1A]/30"
            />
            <button type="button" onClick={onApplyDiscount} disabled={applyingCoupon || discountCode.length < 3}
              className="px-3 py-2 rounded-[8px] font-sans text-[11px] font-semibold shrink-0 transition-colors"
              style={{ background: discountCode.length > 2 && !applyingCoupon ? '#1A1A1A' : '#E5E5E5', color: discountCode.length > 2 && !applyingCoupon ? '#fff' : '#999' }}>
              {applyingCoupon ? '...' : 'Apply'}
            </button>
          </div>
        )}
        <div className="h-px bg-[#E5E5E5]" />
        <div className="flex items-center justify-between">
          <span className="font-display font-[500] text-[13px] text-[#1A1A1A]">Total</span>
          <span className="font-display font-[500] text-[17px] text-[#1A1A1A]">{formatNaira(total)}</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main checkout component
───────────────────────────────────────────── */
export default function TicketCheckout() {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountPct, setDiscountPct] = useState(0)
  const [discountError, setDiscountError] = useState('')
  const [buyer, setBuyer] = useState<BuyerInfo>({ name: '', email: '', phone: '', belongsToMe: true, attendeeEmails: [] })
  const [attendeeEmailInput, setAttendeeEmailInput] = useState('')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const handleApplyDiscount = useCallback(async () => {
    if (!selectedTier || !discountCode.trim()) return
    setApplyingCoupon(true)
    setDiscountError('')
    try {
      const res = await fetch('/api/tickets/apply-coupon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, tier: selectedTier, quantity }),
      })
      const data = await res.json()
      if (data.valid) { setDiscountApplied(true); setDiscountPct(data.pct) }
      else { setDiscountError(data.message ?? 'Invalid discount code'); setDiscountApplied(false) }
    } catch { setDiscountError('Could not validate code. Try again.') }
    finally { setApplyingCoupon(false) }
  }, [discountCode, selectedTier, quantity])

  const handleRemoveDiscount = useCallback((v: string) => {
    if (v === '') { setDiscountApplied(false); setDiscountPct(0); setDiscountError('') }
    setDiscountCode(v)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tier = params.get('tier') as TicketTier | null
    if (tier && ['bronze', 'silver', 'gold'].includes(tier)) setSelectedTier(tier)
  }, [])

  // How many additional attendee emails are needed beyond the buyer's own seat
  const maxAdditionalEmails = buyer.belongsToMe ? quantity - 1 : quantity
  // All seats other than the buyer's are accounted for
  const attendeeEmailsFull  = buyer.attendeeEmails.length >= maxAdditionalEmails
  // Remaining slots
  const slotsLeft           = Math.max(0, maxAdditionalEmails - buyer.attendeeEmails.length)

  const buyerInfoValid =
    buyer.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email) &&
    buyer.phone.trim().length > 6 &&
    // For multi-seat: require all non-buyer seats to have an email
    (quantity === 1 || attendeeEmailsFull)

  const addAttendeeEmail = (raw: string) => {
    const email = raw.trim().toLowerCase()
    // Cap: don't add if we've already filled every non-buyer slot
    if (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      !buyer.attendeeEmails.includes(email) &&
      buyer.attendeeEmails.length < maxAdditionalEmails
    ) {
      setBuyer(b => ({ ...b, attendeeEmails: [...b.attendeeEmails, email] }))
    }
    setAttendeeEmailInput('')
  }

  const ticket = selectedTier ? TICKET_TYPES[selectedTier] : null
  const subtotal = ticket ? ticket.price * quantity : 0
  const discountAmount = discountApplied ? Math.round(subtotal * (discountPct / 100)) : 0
  const total = subtotal - discountAmount

  // Load Paystack inline script once on mount
  useEffect(() => {
    if (document.getElementById('paystack-inline-js')) return
    const script = document.createElement('script')
    script.id = 'paystack-inline-js'
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const handlePay = useCallback(async () => {
    if (!selectedTier || !buyerInfoValid) return
    setPayError('')
    setPaying(true)
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier, quantity,
          buyer_email: buyer.email, buyer_name: buyer.name,
          buyer_phone: buyer.phone || undefined,
          discount_code: discountApplied ? discountCode : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.access_code) {
        setPayError(data.error ?? 'Could not initialise payment. Please try again.')
        setPaying(false)
        return
      }
      sessionStorage.setItem('lsce_pending_order', JSON.stringify({
        buyer_name: buyer.name, buyer_email: buyer.email, buyer_phone: buyer.phone,
        ticket_type: selectedTier, quantity, unit_price: ticket!.price,
        discount_code: discountApplied ? discountCode : null,
        discount_amount: discountAmount, total_amount: total,
        attendee_emails: buyer.belongsToMe
          ? [buyer.email, ...buyer.attendeeEmails].slice(0, quantity)
          : buyer.attendeeEmails.slice(0, quantity),
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PaystackPop = (window as any).PaystackPop
      if (!PaystackPop) {
        window.location.href = `https://checkout.paystack.com/${data.access_code}`
        return
      }
      PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: buyer.email, amount: data.amountNaira * 100,
        currency: 'NGN', ref: data.reference, access_code: data.access_code,
        callback: (response: { reference: string }) => {
          window.location.href = `/tickets/success?reference=${response.reference}`
        },
        onClose: () => setPaying(false),
      }).openIframe()
    } catch {
      setPayError('Network error. Please check your connection and try again.')
      setPaying(false)
    }
  }, [selectedTier, buyer, total, ticket, quantity, discountApplied, discountCode, discountAmount, buyerInfoValid])

  return (
    <>
      <StepTrail step={step} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* ── LEFT PANEL ── */}
        <div className="flex flex-col gap-4">

          {/* ── STEP 1: Ticket selection ── */}
          {step === 1 && (
            <div className="bg-white rounded-[16px] border border-[#E5E5E5] overflow-hidden">
              <div className="flex items-center gap-3 px-4 md:px-5 py-4 border-b border-[#E5E5E5]">
                <StepBadge n={1} active />
                <div>
                  <h2 className="font-display font-[500] text-[14px] md:text-[15px] text-[#1A1A1A] leading-none">
                    Select your ticket
                  </h2>
                  <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">Choose the pass that works for you</p>
                </div>
              </div>

              {/* Mobile: compact accordion rows */}
              <div className="p-3 md:hidden flex flex-col gap-2">
                {TICKET_LIST.map(t => (
                  <MobileTicketRow
                    key={t.id} tier={t.id}
                    selected={selectedTier === t.id}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    onSelect={() => {
                      setSelectedTier(t.id)
                      setDiscountApplied(false); setDiscountCode(''); setDiscountPct(0)
                    }}
                  />
                ))}
              </div>

              {/* Desktop: full cards */}
              <div className="hidden md:flex p-4 flex-col gap-3">
                {TICKET_LIST.map(t => (
                  <TicketCard
                    key={t.id} tier={t.id}
                    selected={selectedTier === t.id}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    onSelect={() => {
                      setSelectedTier(t.id)
                      setDiscountApplied(false); setDiscountCode(''); setDiscountPct(0)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Collapsed ticket + buyer form ── */}
          {step === 2 && (
            <>
              {/* Collapsed ticket chip */}
              {selectedTier && (
                <div className="bg-white rounded-[14px] md:rounded-[16px] border border-[#E5E5E5] px-4 md:px-5 py-3.5 md:py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StepBadge n={1} active={false} />
                    <div>
                      <p className="font-display font-[500] text-[13px] text-[#1A1A1A] leading-none">
                        {TICKET_TYPES[selectedTier].name}
                      </p>
                      <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">
                        {quantity} × {formatNaira(TICKET_TYPES[selectedTier].price)}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep(1)}
                    className="font-sans text-[12px] text-[#FF2035] hover:underline shrink-0">Change</button>
                </div>
              )}

              {/* Buyer info form */}
              <div className="bg-white rounded-[14px] md:rounded-[16px] border border-[#E5E5E5] overflow-hidden">
                <div className="flex items-center gap-3 px-4 md:px-5 py-4 border-b border-[#E5E5E5]">
                  <StepBadge n={2} active />
                  <div>
                    <h2 className="font-display font-[500] text-[14px] md:text-[15px] text-[#1A1A1A] leading-none">
                      Buyer Information
                    </h2>
                    <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">Tell us who&apos;s buying</p>
                  </div>
                </div>
                <div className="p-4 md:p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/70">
                      Full Name <span className="text-[#FF2035]">*</span>
                    </label>
                    <input type="text" value={buyer.name}
                      onChange={e => setBuyer(b => ({ ...b, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/70">
                      Email Address <span className="text-[#FF2035]">*</span>
                    </label>
                    <input type="email" value={buyer.email}
                      onChange={e => setBuyer(b => ({ ...b, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/70">
                      Phone Number <span className="text-[#FF2035]">*</span>
                    </label>
                    <input type="tel" value={buyer.phone}
                      onChange={e => setBuyer(b => ({ ...b, phone: e.target.value }))}
                      placeholder="+234 000 000 0000"
                      className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={buyer.belongsToMe}
                      onChange={e => setBuyer(b => ({ ...b, belongsToMe: e.target.checked }))}
                      className="w-4 h-4 accent-[#FF2035] cursor-pointer"
                    />
                    <span className="font-sans text-[13px] text-[#1A1A1A]/70 group-hover:text-[#1A1A1A] transition-colors">
                      {quantity > 1 ? 'One of these tickets is for me' : 'This ticket is for me'}
                    </span>
                  </label>
                  {quantity > 1 && (
                    <div className="flex flex-col gap-3 border-t border-[#E5E5E5] pt-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display font-[500] text-[13px] text-[#1A1A1A]">
                            Attendee emails
                          </p>
                          <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">
                            {attendeeEmailsFull
                              ? 'All seats accounted for ✓'
                              : `${slotsLeft} seat${slotsLeft !== 1 ? 's' : ''} still need${slotsLeft === 1 ? 's' : ''} an email`
                            }
                          </p>
                        </div>
                        {/* Slot counter pills */}
                        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                          {Array.from({ length: maxAdditionalEmails }).map((_, i) => (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full transition-colors"
                              style={{ background: i < buyer.attendeeEmails.length ? '#FF2035' : '#E5E5E5' }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Email tags */}
                      {buyer.attendeeEmails.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {buyer.attendeeEmails.map((email, i) => (
                            <span key={i}
                              className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-[6px] px-2.5 py-1 font-sans text-[12px] text-[#1A1A1A]">
                              {email}
                              <button type="button"
                                onClick={() => setBuyer(b => ({ ...b, attendeeEmails: b.attendeeEmails.filter((_, j) => j !== i) }))}
                                className="text-[#1A1A1A]/40 hover:text-[#FF2035] transition-colors leading-none">
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Input — hidden once all slots are filled */}
                      {!attendeeEmailsFull && (
                        <input type="email" value={attendeeEmailInput}
                          onChange={e => setAttendeeEmailInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault()
                              addAttendeeEmail(attendeeEmailInput)
                            }
                          }}
                          onBlur={() => attendeeEmailInput && addAttendeeEmail(attendeeEmailInput)}
                          placeholder={`Seat ${buyer.attendeeEmails.length + (buyer.belongsToMe ? 2 : 1)} email address`}
                          className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#FF2035] transition-colors placeholder:text-[#1A1A1A]/30"
                        />
                      )}

                      {/* All filled confirmation */}
                      {attendeeEmailsFull && (
                        <div className="flex items-center gap-2 bg-[#F0FDF4] border border-green-100 rounded-[8px] px-3 py-2.5">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7l4 4 6-6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <p className="font-sans text-[12px] text-green-700">
                            All {quantity} seats have been assigned. Each person will receive their own ticket.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {payError && (
                    <p className="font-sans text-[12px] text-[#FF2035] bg-[#FFF5F5] border border-[#FFD5D5] rounded-[8px] px-3 py-2">
                      {payError}
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile-only: order summary + pay button at bottom of left column */}
              {selectedTier && (
                <div className="lg:hidden flex flex-col gap-3">
                  <MobileOrderSummary
                    tier={selectedTier} quantity={quantity}
                    discountCode={discountCode} discountApplied={discountApplied} discountPct={discountPct}
                    onDiscountChange={handleRemoveDiscount}
                    onApplyDiscount={handleApplyDiscount}
                    applyingCoupon={applyingCoupon}
                  />
                  {discountError && !discountApplied && (
                    <p className="font-sans text-[12px] text-[#FF2035] text-right">{discountError}</p>
                  )}
                  <button type="button" onClick={handlePay} disabled={!buyerInfoValid || paying}
                    className="w-full py-4 rounded-[60px] font-sans text-[14px] font-semibold transition-all"
                    style={{
                      background: buyerInfoValid && !paying ? '#FF2035' : '#E5E5E5',
                      color: buyerInfoValid && !paying ? '#fff' : '#999',
                    }}>
                    {paying ? 'Opening payment…' : 'Proceed to Pay'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Mobile step-1 continue button */}
          {step === 1 && selectedTier && (
            <button type="button" onClick={() => setStep(2)}
              className="lg:hidden w-full py-4 rounded-[60px] font-sans text-[14px] font-semibold bg-[#FF2035] text-white">
              Continue
            </button>
          )}
        </div>

        {/* ── RIGHT PANEL: Order Summary — desktop only, always visible ── */}
        <div className="hidden lg:block">
          <OrderSummary
            tier={selectedTier} quantity={quantity}
            discountCode={discountCode} discountApplied={discountApplied} discountPct={discountPct}
            onDiscountChange={handleRemoveDiscount} onApplyDiscount={handleApplyDiscount}
            applyingCoupon={applyingCoupon} step={step}
            onContinue={() => setStep(2)} onPay={handlePay}
            buyerInfoValid={buyerInfoValid} paying={paying}
          />
        </div>

      </div>

      {discountError && !discountApplied && (
        <p className="hidden lg:block font-sans text-[12px] text-[#FF2035] mt-2 text-right">{discountError}</p>
      )}
    </>
  )
}
