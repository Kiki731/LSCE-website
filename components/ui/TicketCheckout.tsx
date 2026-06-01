'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { TICKET_LIST, TICKET_TYPES, type TicketTier } from '@/lib/ticket-config'

/* ─────────────────────────────────────────────
   Reactive step breadcrumb
───────────────────────────────────────────── */
function StepTrail({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-4 md:gap-8" style={{ marginBottom: '32px' }}>
      <p
        className="font-display font-[500] text-[15px] md:text-[18px] leading-[1.2] whitespace-nowrap shrink-0 transition-colors"
        style={{ color: step >= 1 ? '#1A1A1A' : 'rgba(26,26,26,0.3)' }}
      >
        Select Ticket
      </p>
      <div className="flex-1 h-px bg-[#1A1A1A]/15" />
      <div className="flex items-center gap-2 shrink-0">
        <Image
          src="/icons/Button Star red.svg"
          alt=""
          width={12}
          height={12}
          className="size-[12px] transition-opacity"
          style={{ opacity: step >= 2 ? 1 : 0.3 }}
        />
        <p
          className="font-display font-[500] text-[15px] md:text-[18px] leading-[1.2] whitespace-nowrap transition-colors"
          style={{ color: step >= 2 ? '#1A1A1A' : 'rgba(26,26,26,0.4)' }}
        >
          Buyer Info
        </p>
      </div>
      <div className="flex-1 h-px bg-[#1A1A1A]/15" />
      <div className="flex items-center gap-2 shrink-0">
        <Image
          src="/icons/Button Star red.svg"
          alt=""
          width={12}
          height={12}
          className="size-[12px] opacity-30"
        />
        <p className="font-display font-[500] text-[15px] md:text-[18px] leading-[1.2] whitespace-nowrap text-[#1A1A1A]/30">
          Payment
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface BuyerInfo {
  name: string
  email: string
  phone: string
  belongsToMe: boolean
  attendeeEmails: string[]
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatNaira(amount: number) {
  return '₦' + amount.toLocaleString('en-NG')
}


/* ─────────────────────────────────────────────
   Step indicator
───────────────────────────────────────────── */
function StepBadge({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className="flex items-center justify-center w-6 h-6 rounded shrink-0 text-[11px] font-semibold"
      style={{
        background: active ? '#1A1A1A' : '#E5E5E5',
        color: active ? '#fff' : '#999',
      }}
    >
      {n}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Ticket card
───────────────────────────────────────────── */
function TicketCard({
  tier,
  selected,
  onSelect,
  quantity,
  onQuantityChange,
}: {
  tier: TicketTier
  selected: boolean
  onSelect: () => void
  quantity: number
  onQuantityChange: (q: number) => void
}) {
  const t = TICKET_TYPES[tier]
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left rounded-[16px] border-2 p-5 flex flex-col gap-3 transition-all duration-150"
      style={{
        borderColor: selected ? '#FF2035' : '#E5E5E5',
        backgroundColor: selected ? '#FFF5F5' : '#FFFFFF',
      }}
    >
      {/* Header row: name + price */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-display font-[500] text-[16px] text-[#1A1A1A] leading-[1.2]">
            {t.name}
          </span>
          <span className="font-sans text-[12px] text-[#1A1A1A]/50 leading-none">
            {t.tagline}
          </span>
        </div>
        {/* Price + quantity stepper stacked on the right */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex flex-col items-end gap-0.5">
            <span className="font-display font-[500] text-[18px] leading-none" style={{ color: '#FF2035' }}>
              {formatNaira(t.price)}
            </span>
            <span className="font-sans text-[11px] text-[#1A1A1A]/40">per ticket</span>
          </div>

          {/* Quantity stepper — only shown when this card is selected */}
          {selected && (
            <div
              className="flex items-center gap-2 mt-1"
              onClick={(e) => e.stopPropagation()} // prevent card deselect on stepper click
            >
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center font-sans text-[14px] text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
              >
                −
              </button>
              <span className="font-display font-[500] text-[15px] text-[#1A1A1A] w-5 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
                className="w-7 h-7 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center font-sans text-[14px] text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="font-sans text-[12px] text-[#1A1A1A]/60 leading-[1.5]">
        {t.description}
      </p>

      {/* Perks */}
      <ul className="flex flex-col gap-1.5">
        {t.perks.map((perk, i) => (
          <li key={i} className="flex items-center gap-2">
            <Image
              src="/icons/Button Star red.svg"
              alt=""
              width={10}
              height={10}
              className="shrink-0"
            />
            <span className="font-sans text-[12px] text-[#1A1A1A]/70">{perk}</span>
          </li>
        ))}
      </ul>

      {/* Selected indicator */}
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
   Order Summary panel (right side)
───────────────────────────────────────────── */
function OrderSummary({
  tier,
  quantity,
  discountCode,
  discountApplied,
  discountPct,
  onDiscountChange,
  onApplyDiscount,
  applyingCoupon,
  step,
  onContinue,
  onPay,
  buyerInfoValid,
  paystackReady,
  paying,
}: {
  tier: TicketTier | null
  quantity: number
  discountCode: string
  discountApplied: boolean
  discountPct: number
  onDiscountChange: (v: string) => void
  onApplyDiscount: () => void
  applyingCoupon: boolean
  step: 1 | 2
  onContinue: () => void
  onPay: () => void
  buyerInfoValid: boolean
  paystackReady?: boolean
  paying: boolean
}) {
  const ticket = tier ? TICKET_TYPES[tier] : null
  const subtotal = ticket ? ticket.price * quantity : 0
  const discountAmount = discountApplied ? Math.round(subtotal * (discountPct / 100)) : 0
  const total = subtotal - discountAmount

  const canContinue = !!tier && quantity > 0
  const canPay = canContinue && buyerInfoValid

  return (
    <div
      className="rounded-[16px] border border-[#E5E5E5] bg-white overflow-hidden lg:sticky lg:top-32"
    >
      {/* Header */}
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
            {/* Line item */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-[500] text-[13px] text-[#1A1A1A]">
                  {ticket.name}
                </p>
                <p className="font-sans text-[12px] text-[#1A1A1A]/50">
                  {quantity} × {formatNaira(ticket.price)}
                </p>
              </div>
              <span className="font-display font-[500] text-[13px] text-[#1A1A1A] shrink-0">
                {formatNaira(subtotal)}
              </span>
            </div>

            {/* Discount */}
            {discountApplied ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-[12px] text-[#1A1A1A]/60">
                    Discount ({discountCode.toUpperCase()} · {discountPct}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => { onDiscountChange('') }}
                    className="font-sans text-[11px] text-[#FF2035] underline"
                  >
                    Remove
                  </button>
                </div>
                <span className="font-sans text-[13px] text-[#1A1A1A]/70">
                  −{formatNaira(discountAmount)}
                </span>
              </div>
            ) : (
              /* Discount code input */
              <div className="flex flex-col gap-2">
                <label className="font-sans text-[12px] text-[#1A1A1A]/60">Discount code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => onDiscountChange(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 border border-[#E5E5E5] rounded-[8px] px-3 py-2 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#FF2035] transition-colors uppercase placeholder:uppercase placeholder:text-[#1A1A1A]/30"
                  />
                  <button
                    type="button"
                    onClick={onApplyDiscount}
                    disabled={applyingCoupon || discountCode.length < 3}
                    className="px-3 py-2 rounded-[8px] font-sans text-[12px] font-semibold transition-colors shrink-0"
                    style={{
                      background: discountCode.length > 2 && !applyingCoupon ? '#1A1A1A' : '#E5E5E5',
                      color: discountCode.length > 2 && !applyingCoupon ? '#fff' : '#999',
                    }}
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-[#E5E5E5]" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-display font-[500] text-[14px] text-[#1A1A1A]">Total</span>
              <span className="font-display font-[500] text-[18px] text-[#1A1A1A]">
                {formatNaira(total)}
              </span>
            </div>
          </>
        )}

        {/* CTA */}
        {step === 1 ? (
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="w-full py-3 rounded-[60px] font-sans text-[14px] font-semibold transition-all duration-150"
            style={{
              background: canContinue ? '#FF2035' : '#E5E5E5',
              color: canContinue ? '#fff' : '#999',
              cursor: canContinue ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={onPay}
            disabled={!canPay || paying}
            className="w-full py-3 rounded-[60px] font-sans text-[14px] font-semibold transition-all duration-150"
            style={{
              background: canPay && !paying ? '#FF2035' : '#E5E5E5',
              color: canPay && !paying ? '#fff' : '#999',
              cursor: canPay && !paying ? 'pointer' : 'not-allowed',
            }}
          >
            {paying ? 'Redirecting to payment…' : 'Proceed to Pay'}
          </button>
        )}
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
  const [buyer, setBuyer] = useState<BuyerInfo>({
    name: '',
    email: '',
    phone: '',
    belongsToMe: true,
    attendeeEmails: [],
  })
  const [attendeeEmailInput, setAttendeeEmailInput] = useState('')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  /* ── Discount — validated server-side (codes never in client bundle) ── */
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const handleApplyDiscount = useCallback(async () => {
    if (!selectedTier || !discountCode.trim()) return
    setApplyingCoupon(true)
    setDiscountError('')
    try {
      const res = await fetch('/api/tickets/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, tier: selectedTier, quantity }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscountApplied(true)
        setDiscountPct(data.pct)
        setDiscountError('')
      } else {
        setDiscountError(data.message ?? 'Invalid discount code')
        setDiscountApplied(false)
      }
    } catch {
      setDiscountError('Could not validate code. Try again.')
    } finally {
      setApplyingCoupon(false)
    }
  }, [discountCode, selectedTier, quantity])

  const handleRemoveDiscount = useCallback((v: string) => {
    if (v === '') {
      setDiscountApplied(false)
      setDiscountPct(0)
      setDiscountError('')
    }
    setDiscountCode(v)
  }, [])

  /* ── Pre-select tier from URL ?tier=bronze|silver|gold ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tier = params.get('tier') as TicketTier | null
    if (tier && ['bronze', 'silver', 'gold'].includes(tier)) {
      setSelectedTier(tier)
    }
  }, [])

  /* ── Buyer info validation ── */
  const buyerInfoValid =
    buyer.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email) &&
    buyer.phone.trim().length > 6

  /* ── Attendee email tag input ── */
  const addAttendeeEmail = (raw: string) => {
    const email = raw.trim().toLowerCase()
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !buyer.attendeeEmails.includes(email)) {
      setBuyer((b) => ({ ...b, attendeeEmails: [...b.attendeeEmails, email] }))
    }
    setAttendeeEmailInput('')
  }

  /* ── Totals ── */
  const ticket = selectedTier ? TICKET_TYPES[selectedTier] : null
  const subtotal = ticket ? ticket.price * quantity : 0
  const discountAmount = discountApplied ? Math.round(subtotal * (discountPct / 100)) : 0
  const total = subtotal - discountAmount

  /* ── Paystack redirect flow ──────────────────────────────────────────────────
     Server initialises the transaction (amount set server-side, tamper-proof).
     We redirect to Paystack's hosted payment page. After payment, Paystack
     redirects back to /tickets/success?reference=xxx where we verify + save.
  ── */
  const handlePay = useCallback(async () => {
    if (!selectedTier || !buyerInfoValid) return
    setPayError('')
    setPaying(true)

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier:          selectedTier,
          quantity,
          buyer_email:   buyer.email,
          buyer_name:    buyer.name,
          buyer_phone:   buyer.phone || undefined,
          discount_code: discountApplied ? discountCode : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.authorization_url) {
        setPayError(data.error ?? 'Could not initialise payment. Please try again.')
        setPaying(false)
        return
      }

      // Store buyer info so the success page can save the order after redirect
      sessionStorage.setItem('lsce_pending_order', JSON.stringify({
        buyer_name:      buyer.name,
        buyer_email:     buyer.email,
        buyer_phone:     buyer.phone,
        ticket_type:     selectedTier,
        quantity,
        unit_price:      ticket!.price,
        discount_code:   discountApplied ? discountCode : null,
        discount_amount: discountAmount,
        total_amount:    total,
        attendee_emails: buyer.belongsToMe
          ? [buyer.email, ...buyer.attendeeEmails].slice(0, quantity)
          : buyer.attendeeEmails.slice(0, quantity),
      }))

      // Redirect to Paystack's hosted payment page
      window.location.href = data.authorization_url
    } catch {
      setPayError('Network error. Please check your connection and try again.')
      setPaying(false)
    }
  }, [selectedTier, buyer, total, ticket, quantity, discountApplied, discountCode, discountAmount, buyerInfoValid])

  // No Paystack script needed — we use the redirect (authorization_url) flow

  return (
    <>

      {/* Step breadcrumb — reactive to step state */}
      <StepTrail step={step} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

        {/* ── LEFT PANEL ── */}
        <div className="flex flex-col gap-4">

          {/* ── STEP 1: TICKET SELECTION — only shown on step 1 ── */}
          {step === 1 && (
            <div className="bg-white rounded-[16px] border border-[#E5E5E5] overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E5E5]">
                <StepBadge n={1} active={true} />
                <div>
                  <h2 className="font-display font-[500] text-[15px] text-[#1A1A1A] leading-none">
                    Select your ticket
                  </h2>
                  <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">
                    Choose the pass that works for you
                  </p>
                </div>
              </div>

              {/* Ticket cards */}
              <div className="p-4 flex flex-col gap-3">
                {TICKET_LIST.map((t) => (
                  <TicketCard
                    key={t.id}
                    tier={t.id}
                    selected={selectedTier === t.id}
                    quantity={quantity}
                    onQuantityChange={setQuantity}
                    onSelect={() => {
                      setSelectedTier(t.id)
                      // Reset discount when ticket changes
                      setDiscountApplied(false)
                      setDiscountCode('')
                      setDiscountPct(0)
                    }}
                  />
                ))}
              </div>

              {/* OLD quantity selector — commented out in case you want to restore the bottom bar
              {selectedTier && (
                <div className="px-4 pb-4 flex items-center justify-between border-t border-[#E5E5E5] pt-4">
                  <div>
                    <p className="font-display font-[500] text-[13px] text-[#1A1A1A]">Number of tickets</p>
                    <p className="font-sans text-[11px] text-[#1A1A1A]/40">Maximum 10 per order</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-full border border-[#E5E5E5] flex items-center justify-center font-sans text-[16px] text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">−</button>
                    <span className="font-display font-[500] text-[16px] text-[#1A1A1A] w-6 text-center">{quantity}</span>
                    <button type="button" onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-8 h-8 rounded-full border border-[#E5E5E5] flex items-center justify-center font-sans text-[16px] text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">+</button>
                  </div>
                </div>
              )}
              */}
            </div>
          )}

          {/* ── STEP 2: collapsed ticket summary + buyer form ── */}
          {step === 2 && (
            <>
              {/* Collapsed ticket summary — shows what was selected, with a back/edit link */}
              {selectedTier && (
                <div className="bg-white rounded-[16px] border border-[#E5E5E5] px-5 py-4 flex items-center justify-between">
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
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="font-sans text-[12px] text-[#FF2035] hover:underline shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

            <div className="bg-white rounded-[16px] border border-[#E5E5E5] overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E5E5]">
                <StepBadge n={2} active={true} />
                <div>
                  <h2 className="font-display font-[500] text-[15px] text-[#1A1A1A] leading-none">
                    Buyer Information
                  </h2>
                  <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">
                    Tell us who&apos;s buying
                  </p>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/70">
                    Full Name <span className="text-[#FF2035]">*</span>
                  </label>
                  <input
                    type="text"
                    value={buyer.name}
                    onChange={(e) => setBuyer((b) => ({ ...b, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/70">
                    Email Address <span className="text-[#FF2035]">*</span>
                  </label>
                  <input
                    type="email"
                    value={buyer.email}
                    onChange={(e) => setBuyer((b) => ({ ...b, email: e.target.value }))}
                    placeholder="Enter your email"
                    className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[12px] font-semibold text-[#1A1A1A]/70">
                    Phone Number <span className="text-[#FF2035]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={buyer.phone}
                    onChange={(e) => setBuyer((b) => ({ ...b, phone: e.target.value }))}
                    placeholder="+234 000 000 0000"
                    className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"
                  />
                </div>

                {/* Belongs to me */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={buyer.belongsToMe}
                    onChange={(e) => setBuyer((b) => ({ ...b, belongsToMe: e.target.checked }))}
                    className="w-4 h-4 accent-[#FF2035] cursor-pointer"
                  />
                  <span className="font-sans text-[13px] text-[#1A1A1A]/70 group-hover:text-[#1A1A1A] transition-colors">
                    {quantity > 1 ? 'One of these tickets is for me' : 'This ticket is for me'}
                  </span>
                </label>

                {/* Attendee emails if quantity > 1 */}
                {quantity > 1 && (
                  <div className="flex flex-col gap-2 border-t border-[#E5E5E5] pt-4">
                    <div>
                      <p className="font-display font-[500] text-[13px] text-[#1A1A1A]">
                        Attendee emails
                      </p>
                      <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">
                        Press Enter after each email. {quantity - (buyer.belongsToMe ? 1 : 0)} more needed.
                      </p>
                    </div>

                    {/* Tags */}
                    {buyer.attendeeEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {buyer.attendeeEmails.map((email, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#E5E5E5] rounded-[6px] px-2.5 py-1 font-sans text-[12px] text-[#1A1A1A]"
                          >
                            {email}
                            <button
                              type="button"
                              onClick={() =>
                                setBuyer((b) => ({
                                  ...b,
                                  attendeeEmails: b.attendeeEmails.filter((_, j) => j !== i),
                                }))
                              }
                              className="text-[#1A1A1A]/40 hover:text-[#FF2035] transition-colors leading-none"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <input
                      type="email"
                      value={attendeeEmailInput}
                      onChange={(e) => setAttendeeEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault()
                          addAttendeeEmail(attendeeEmailInput)
                        }
                      }}
                      onBlur={() => attendeeEmailInput && addAttendeeEmail(attendeeEmailInput)}
                      placeholder="attendee@email.com"
                      className="border border-[#E5E5E5] rounded-[8px] px-4 py-3 font-sans text-[13px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#1A1A1A]/30"
                    />
                  </div>
                )}

                {payError && (
                  <p className="font-sans text-[12px] text-[#FF2035] bg-[#FFF5F5] border border-[#FFD5D5] rounded-[8px] px-3 py-2">
                    {payError}
                  </p>
                )}
              </div>
            </div>
            </>
          )}

          {/* Continue button (mobile — mirrors right panel) */}
          {step === 1 && selectedTier && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="lg:hidden w-full py-3.5 rounded-[60px] font-sans text-[14px] font-semibold bg-[#FF2035] text-white"
            >
              Continue
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              onClick={handlePay}
              disabled={!buyerInfoValid || paying}
              className="lg:hidden w-full py-3.5 rounded-[60px] font-sans text-[14px] font-semibold transition-all"
              style={{
                background: buyerInfoValid && !paying ? '#FF2035' : '#E5E5E5',
                color: buyerInfoValid && !paying ? '#fff' : '#999',
              }}
            >
              {paying ? 'Redirecting to payment…' : 'Proceed to Pay'}
            </button>
          )}
        </div>

        {/* ── RIGHT PANEL: Order Summary ── */}
        <OrderSummary
          tier={selectedTier}
          quantity={quantity}
          discountCode={discountCode}
          discountApplied={discountApplied}
          discountPct={discountPct}
          onDiscountChange={handleRemoveDiscount}
          onApplyDiscount={handleApplyDiscount}
          applyingCoupon={applyingCoupon}
          step={step}
          onContinue={() => setStep(2)}
          onPay={handlePay}
          buyerInfoValid={buyerInfoValid}
          paying={paying}
        />
      </div>

      {discountError && !discountApplied && (
        <p className="font-sans text-[12px] text-[#FF2035] mt-2 text-right">{discountError}</p>
      )}
    </>
  )
}
