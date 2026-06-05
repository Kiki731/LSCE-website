'use client'

import { useState, useEffect, useCallback } from 'react'

interface Coupon {
  id: string
  code: string
  description: string | null
  discount_pct: number
  max_uses: number | null
  times_used: number
  valid_from: string | null
  valid_until: string | null
  is_active: boolean
  ticket_types: string[] | null
  created_by: string | null
  created_at: string
}

type FormState = {
  description: string
  discount_pct: string
  max_uses: string
  valid_from: string
  valid_until: string
  ticket_types: string[]
  is_active: boolean
}

const BLANK_FORM: FormState = {
  description: '', discount_pct: '', max_uses: '',
  valid_from: '', valid_until: '',
  ticket_types: [], is_active: true,
}

/* Convert an ISO timestamp → datetime-local value (YYYY-MM-DDTHH:mm) */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
}

function couponStatus(c: Coupon): { label: string; color: string } {
  if (!c.is_active) return { label: 'Disabled', color: '#6b7280' }
  const now = new Date()
  if (c.valid_from  && new Date(c.valid_from)  > now) return { label: 'Scheduled', color: '#D4AF37' }
  if (c.valid_until && new Date(c.valid_until) < now) return { label: 'Expired',   color: '#CD7F32' }
  if (c.max_uses    && c.times_used >= c.max_uses)    return { label: 'Used up',   color: '#6b7280' }
  return { label: 'Active', color: '#22c55e' }
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      {[120, 60, 60, 120, 80, 70, 100].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3 rounded-full bg-white/8 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

/* ── Shared form fields used by both Create and Edit ── */
function CouponFormFields({
  form,
  setForm,
  codeValue,         // only for create (read-only in edit)
  onCodeChange,
  isEdit = false,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  codeValue?: string
  onCodeChange?: (v: string) => void
  isEdit?: boolean
}) {
  function toggleTier(tier: string) {
    setForm(f => ({
      ...f,
      ticket_types: f.ticket_types.includes(tier)
        ? f.ticket_types.filter(t => t !== tier)
        : [...f.ticket_types, tier],
    }))
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Code — shown in create only */}
        {!isEdit && (
          <Field label="Code *" hint="e.g. SUMMER25">
            <input
              required value={codeValue ?? ''}
              onChange={e => onCodeChange?.(e.target.value.toUpperCase())}
              placeholder="SUMMER25"
              className="input-dark"
            />
          </Field>
        )}

        <Field label="Discount % *" hint="1–100">
          <input
            required type="number" min={1} max={100}
            value={form.discount_pct}
            onChange={e => setForm(f => ({ ...f, discount_pct: e.target.value }))}
            placeholder="10"
            className="input-dark"
          />
        </Field>

        <Field label="Description" hint="Internal note">
          <input
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What is this code for?"
            className="input-dark"
          />
        </Field>

        <Field label="Max Uses" hint="Leave blank for unlimited">
          <input
            type="number" min={1}
            value={form.max_uses}
            onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
            placeholder="Unlimited"
            className="input-dark"
          />
        </Field>

        <Field label="Valid From" hint="Leave blank = active immediately">
          <input
            type="datetime-local"
            value={form.valid_from}
            onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))}
            className="input-dark"
          />
        </Field>

        <Field label="Valid Until" hint="Leave blank = never expires">
          <input
            type="datetime-local"
            value={form.valid_until}
            onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))}
            className="input-dark"
          />
        </Field>
      </div>

      {/* Tier restriction */}
      <Field label="Applies to" hint="Leave all unselected to apply to every tier">
        <div className="flex gap-2 flex-wrap">
          {['bronze', 'silver', 'gold'].map(tier => (
            <button
              key={tier} type="button"
              onClick={() => toggleTier(tier)}
              className="px-3 py-1.5 rounded-[8px] font-sans text-[12px] font-semibold capitalize transition-colors border"
              style={{
                background:  form.ticket_types.includes(tier) ? '#FF2035' : 'transparent',
                borderColor: form.ticket_types.includes(tier) ? '#FF2035' : 'rgba(255,255,255,0.15)',
                color:       form.ticket_types.includes(tier) ? 'white'   : 'rgba(255,255,255,0.5)',
              }}
            >
              {tier}
            </button>
          ))}
        </div>
      </Field>

      {/* Active toggle — only in edit */}
      {isEdit && (
        <label className="flex items-center gap-3 cursor-pointer group w-fit">
          <div
            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
            className="relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0"
            style={{ background: form.is_active ? '#FF2035' : 'rgba(255,255,255,0.12)' }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              style={{ transform: form.is_active ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </div>
          <span className="font-sans text-[13px] text-white/60 group-hover:text-white transition-colors">
            {form.is_active ? 'Active' : 'Disabled'}
          </span>
        </label>
      )}
    </>
  )
}

/* ── Main manager ── */
export default function CouponsManager() {
  const [coupons, setCoupons]         = useState<Coupon[]>([])
  const [loading, setLoading]         = useState(true)
  const [mode, setMode]               = useState<'none' | 'create' | 'edit'>('none')
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [saving, setSaving]           = useState(false)
  const [formError, setFormError]     = useState('')

  /* Create-only field */
  const [newCode, setNewCode]         = useState('')

  /* Shared form fields */
  const [form, setForm]               = useState<FormState>(BLANK_FORM)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data.coupons ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /* Open create form */
  function openCreate() {
    setMode('create')
    setEditingCoupon(null)
    setNewCode('')
    setForm(BLANK_FORM)
    setFormError('')
  }

  /* Open edit form pre-populated with coupon values */
  function openEdit(c: Coupon) {
    setMode('edit')
    setEditingCoupon(c)
    setForm({
      description:  c.description  ?? '',
      discount_pct: String(c.discount_pct),
      max_uses:     c.max_uses != null ? String(c.max_uses) : '',
      valid_from:   toDatetimeLocal(c.valid_from),
      valid_until:  toDatetimeLocal(c.valid_until),
      ticket_types: c.ticket_types ?? [],
      is_active:    c.is_active,
    })
    setFormError('')
    // scroll form into view
    setTimeout(() => document.getElementById('coupon-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function closeForm() {
    setMode('none')
    setEditingCoupon(null)
    setFormError('')
  }

  /* Create */
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError('')

    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code:         newCode,
        description:  form.description  || null,
        discount_pct: Number(form.discount_pct),
        max_uses:     form.max_uses ? Number(form.max_uses) : null,
        valid_from:   form.valid_from  || null,
        valid_until:  form.valid_until || null,
        ticket_types: form.ticket_types.length ? form.ticket_types : null,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setFormError(data.error ?? 'Failed to create coupon'); setSaving(false); return }

    closeForm()
    setSaving(false)
    load()
  }

  /* Edit / Save */
  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCoupon) return
    setSaving(true)
    setFormError('')

    const res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description:  form.description  || null,
        discount_pct: Number(form.discount_pct),
        max_uses:     form.max_uses ? Number(form.max_uses) : null,
        valid_from:   form.valid_from  || null,
        valid_until:  form.valid_until || null,
        ticket_types: form.ticket_types.length ? form.ticket_types : null,
        is_active:    form.is_active,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setFormError(data.error ?? 'Failed to save changes'); setSaving(false); return }

    closeForm()
    setSaving(false)
    load()
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !c.is_active }),
    })
    load()
  }

  async function deleteCoupon(c: Coupon) {
    if (!confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' })
    if (editingCoupon?.id === c.id) closeForm()
    load()
  }

  const isCreate = mode === 'create'
  const isEdit   = mode === 'edit'

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-[500] text-white text-[24px] leading-none">Coupons</h1>
          <p className="font-sans text-[13px] text-white/40 mt-1.5">
            {coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => mode === 'none' ? openCreate() : closeForm()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-sans text-[13px] font-semibold transition-colors"
          style={{ background: mode !== 'none' ? 'rgba(255,255,255,0.08)' : '#FF2035', color: 'white' }}
        >
          {mode !== 'none' ? '✕ Cancel' : '+ New Coupon'}
        </button>
      </div>

      {/* Create / Edit form */}
      {mode !== 'none' && (
        <form
          id="coupon-form"
          onSubmit={isCreate ? handleCreate : handleEdit}
          className="bg-[#161616] border border-white/12 rounded-[16px] p-6 flex flex-col gap-4"
        >
          {/* Form header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-[500] text-white text-[15px]">
                {isCreate ? 'New Coupon' : `Edit — ${editingCoupon?.code}`}
              </p>
              {isEdit && (
                <p className="font-sans text-[11px] text-white/35 mt-0.5">
                  Code cannot be changed · Used {editingCoupon?.times_used ?? 0} time{editingCoupon?.times_used !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {isEdit && (
              /* Quick toggle in the header for convenience */
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] font-sans text-[11px] font-semibold cursor-pointer select-none"
                style={{
                  background: form.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                  color:      form.is_active ? '#22c55e'               : 'rgba(255,255,255,0.4)',
                }}
                onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: form.is_active ? '#22c55e' : 'rgba(255,255,255,0.3)' }} />
                {form.is_active ? 'Active' : 'Disabled'}
              </span>
            )}
          </div>

          <CouponFormFields
            form={form}
            setForm={setForm}
            codeValue={newCode}
            onCodeChange={setNewCode}
            isEdit={isEdit}
          />

          {formError && (
            <p className="font-sans text-[12px] text-[#FF2035] bg-[#FF2035]/10 border border-[#FF2035]/20 rounded-[8px] px-3 py-2">
              {formError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-[10px] font-sans text-[13px] font-semibold text-white transition-colors"
              style={{ background: saving ? 'rgba(255,32,53,0.4)' : '#FF2035' }}
            >
              {saving ? (isCreate ? 'Creating…' : 'Saving…') : (isCreate ? 'Create Coupon' : 'Save Changes')}
            </button>
            <button
              type="button" onClick={closeForm}
              className="px-5 py-2.5 rounded-[10px] font-sans text-[13px] text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
        {loading ? (
          <table className="w-full">
            <tbody>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        ) : coupons.length === 0 ? (
          <p className="px-5 py-8 text-center font-sans text-[13px] text-white/25">No coupons yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/6">
                  {['Code', 'Discount', 'Uses', 'Validity', 'Applies to', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-[11px] text-white/30 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const status   = couponStatus(c)
                  const isEditing = editingCoupon?.id === c.id

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-white/4 last:border-0 transition-colors"
                      style={{ background: isEditing ? 'rgba(255,32,53,0.04)' : undefined }}
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-display font-[500] text-white text-[13px] tracking-wider">{c.code}</p>
                        {c.description && <p className="font-sans text-[11px] text-white/35 mt-0.5">{c.description}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-display font-[500] text-[#FF2035] text-[14px]">{c.discount_pct}%</span>
                      </td>
                      <td className="px-4 py-3.5 font-sans text-[13px] text-white/70">
                        {c.times_used}{c.max_uses ? ` / ${c.max_uses}` : ''}
                        {c.max_uses && (
                          <div className="mt-1 h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#FF2035]"
                              style={{ width: `${Math.min(100, (c.times_used / c.max_uses) * 100)}%` }} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-sans text-[12px] text-white/50 whitespace-nowrap">
                        {c.valid_from || c.valid_until
                          ? <>{fmtDate(c.valid_from)} → {fmtDate(c.valid_until)}</>
                          : <span className="text-white/30">Always</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        {c.ticket_types?.length
                          ? <div className="flex gap-1 flex-wrap">{c.ticket_types.map(t => (
                              <span key={t} className="font-sans text-[10px] capitalize px-1.5 py-0.5 rounded-[4px] bg-white/8 text-white/50">{t}</span>
                            ))}</div>
                          : <span className="font-sans text-[11px] text-white/30">All tiers</span>
                        }
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold" style={{ color: status.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => isEditing ? closeForm() : openEdit(c)}
                            className="flex items-center gap-1 font-sans text-[11px] px-2 py-1 rounded-[6px] transition-colors"
                            style={{
                              color:      isEditing ? '#FF2035'              : 'rgba(255,255,255,0.5)',
                              background: isEditing ? 'rgba(255,32,53,0.1)' : 'transparent',
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {isEditing ? 'Editing' : 'Edit'}
                          </button>
                          {/* Enable / Disable */}
                          <button
                            onClick={() => toggleActive(c)}
                            className="font-sans text-[11px] text-white/40 hover:text-white transition-colors px-2 py-1 rounded-[6px] hover:bg-white/8"
                          >
                            {c.is_active ? 'Disable' : 'Enable'}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => deleteCoupon(c)}
                            className="font-sans text-[11px] text-[#FF2035]/50 hover:text-[#FF2035] transition-colors px-2 py-1 rounded-[6px] hover:bg-[#FF2035]/8"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="font-sans text-[11px] font-semibold text-white/50 uppercase tracking-wider">{label}</label>
        {hint && <span className="font-sans text-[10px] text-white/25">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
