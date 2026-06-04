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

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
}

function couponStatus(c: Coupon): { label: string; color: string } {
  if (!c.is_active) return { label: 'Disabled', color: '#6b7280' }
  const now = new Date()
  if (c.valid_from && new Date(c.valid_from) > now) return { label: 'Scheduled', color: '#D4AF37' }
  if (c.valid_until && new Date(c.valid_until) < now) return { label: 'Expired', color: '#CD7F32' }
  if (c.max_uses && c.times_used >= c.max_uses) return { label: 'Used up', color: '#6b7280' }
  return { label: 'Active', color: '#22c55e' }
}

export default function CouponsManager() {
  const [coupons, setCoupons]   = useState<Coupon[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const [form, setForm] = useState({
    code: '', description: '', discount_pct: '', max_uses: '',
    valid_from: '', valid_until: '',
    ticket_types: [] as string[],
  })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data.coupons ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code:         form.code,
        description:  form.description || null,
        discount_pct: Number(form.discount_pct),
        max_uses:     form.max_uses ? Number(form.max_uses) : null,
        valid_from:   form.valid_from || null,
        valid_until:  form.valid_until || null,
        ticket_types: form.ticket_types.length ? form.ticket_types : null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to create coupon')
      setSaving(false)
      return
    }

    setForm({ code: '', description: '', discount_pct: '', max_uses: '', valid_from: '', valid_until: '', ticket_types: [] })
    setShowForm(false)
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
    load()
  }

  function toggleTier(tier: string) {
    setForm(f => ({
      ...f,
      ticket_types: f.ticket_types.includes(tier)
        ? f.ticket_types.filter(t => t !== tier)
        : [...f.ticket_types, tier],
    }))
  }

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
          onClick={() => { setShowForm(!showForm); setError('') }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-sans text-[13px] font-semibold transition-colors"
          style={{ background: showForm ? 'rgba(255,255,255,0.08)' : '#FF2035', color: 'white' }}
        >
          {showForm ? '✕ Cancel' : '+ New Coupon'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#161616] border border-white/12 rounded-[16px] p-6 flex flex-col gap-4">
          <p className="font-display font-[500] text-white text-[15px]">New Coupon</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Code *" hint="e.g. SUMMER25">
              <input
                required value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER25"
                className="input-dark"
              />
            </Field>
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

          {/* Ticket type restriction */}
          <Field label="Applies to" hint="Leave all unselected to apply to every tier">
            <div className="flex gap-2 flex-wrap">
              {['bronze', 'silver', 'gold'].map(tier => (
                <button
                  key={tier} type="button"
                  onClick={() => toggleTier(tier)}
                  className="px-3 py-1.5 rounded-[8px] font-sans text-[12px] font-semibold capitalize transition-colors border"
                  style={{
                    background: form.ticket_types.includes(tier) ? '#FF2035' : 'transparent',
                    borderColor: form.ticket_types.includes(tier) ? '#FF2035' : 'rgba(255,255,255,0.15)',
                    color: form.ticket_types.includes(tier) ? 'white' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {tier}
                </button>
              ))}
            </div>
          </Field>

          {error && (
            <p className="font-sans text-[12px] text-[#FF2035] bg-[#FF2035]/10 border border-[#FF2035]/20 rounded-[8px] px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={saving}
            className="w-fit px-5 py-2.5 rounded-[10px] font-sans text-[13px] font-semibold text-white transition-colors"
            style={{ background: saving ? 'rgba(255,32,53,0.4)' : '#FF2035' }}
          >
            {saving ? 'Creating…' : 'Create Coupon'}
          </button>
        </form>
      )}

      {/* Coupons table */}
      <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-center font-sans text-[13px] text-white/25">Loading…</p>
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
                  const status = couponStatus(c)
                  return (
                    <tr key={c.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
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
                            <div
                              className="h-full rounded-full bg-[#FF2035]"
                              style={{ width: `${Math.min(100, (c.times_used / c.max_uses) * 100)}%` }}
                            />
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
                        <span
                          className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold"
                          style={{ color: status.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleActive(c)}
                            className="font-sans text-[11px] text-white/40 hover:text-white transition-colors px-2 py-1 rounded-[6px] hover:bg-white/8"
                          >
                            {c.is_active ? 'Disable' : 'Enable'}
                          </button>
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
