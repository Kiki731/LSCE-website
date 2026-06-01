'use client'

import { useState, useEffect, useCallback } from 'react'

interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in: string | null
  confirmed: boolean
}

function fmtDate(iso: string | null) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function TeamManager({ currentUserEmail }: { currentUserEmail?: string }) {
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const [form, setForm] = useState({ email: '', password: '', confirm: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/team')
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)

    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to create user')
      setSaving(false)
      return
    }

    setSuccess(`Admin account created for ${form.email}`)
    setForm({ email: '', password: '', confirm: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`Remove admin access for ${user.email}? They will no longer be able to sign in.`)) return
    const res = await fetch('/api/admin/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id }),
    })
    const data = await res.json()
    if (!res.ok) { alert(data.error); return }
    load()
  }

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-[500] text-white text-[24px] leading-none">Team</h1>
          <p className="font-sans text-[13px] text-white/40 mt-1.5">
            Admin users with portal access
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] font-sans text-[13px] font-semibold"
          style={{ background: showForm ? 'rgba(255,255,255,0.08)' : '#FF2035', color: 'white' }}
        >
          {showForm ? '✕ Cancel' : '+ Add Admin'}
        </button>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-[10px] px-4 py-3">
          <p className="font-sans text-[13px] text-green-400">{success}</p>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#161616] border border-white/8 rounded-[16px] p-6 flex flex-col gap-4">
          <div>
            <p className="font-display font-[500] text-white text-[15px]">New Admin User</p>
            <p className="font-sans text-[12px] text-white/40 mt-1">
              The user will be able to sign in immediately. No email confirmation required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-semibold text-white/50 uppercase tracking-wider">Email</label>
              <input
                required type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="newadmin@thelscexpo.com"
                className="bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 font-sans text-[14px] text-white placeholder:text-white/20 outline-none focus:border-[#FF2035] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-semibold text-white/50 uppercase tracking-wider">Password</label>
              <input
                required type="password" minLength={8}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className="bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 font-sans text-[14px] text-white placeholder:text-white/20 outline-none focus:border-[#FF2035] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-semibold text-white/50 uppercase tracking-wider">Confirm Password</label>
              <input
                required type="password"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat password"
                className="bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 font-sans text-[14px] text-white placeholder:text-white/20 outline-none focus:border-[#FF2035] transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="font-sans text-[12px] text-[#FF2035] bg-[#FF2035]/10 border border-[#FF2035]/20 rounded-[8px] px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit" disabled={saving}
            className="w-fit px-5 py-2.5 rounded-[10px] font-sans text-[13px] font-semibold text-white"
            style={{ background: saving ? 'rgba(255,32,53,0.4)' : '#FF2035' }}
          >
            {saving ? 'Creating…' : 'Create Admin'}
          </button>
        </form>
      )}

      {/* Users table */}
      <div className="bg-[#161616] border border-white/6 rounded-[16px] overflow-hidden">
        {loading ? (
          <p className="px-5 py-8 text-center font-sans text-[13px] text-white/25">Loading…</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                {['User', 'Created', 'Last Sign In', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-sans text-[11px] text-white/30 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isMe = u.email === currentUserEmail
                return (
                  <tr key={u.id} className="border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FF2035]/15 flex items-center justify-center shrink-0">
                          <span className="font-display text-[11px] text-[#FF2035] font-[500]">
                            {u.email?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-sans text-[13px] text-white">{u.email}</p>
                          {isMe && <p className="font-sans text-[10px] text-[#FF2035]">You</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-sans text-[12px] text-white/40">{fmtDate(u.created_at)}</td>
                    <td className="px-5 py-3.5 font-sans text-[12px] text-white/40">{fmtDate(u.last_sign_in)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold ${u.confirmed ? 'text-green-400' : 'text-yellow-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.confirmed ? 'bg-green-400' : 'bg-yellow-500'}`} />
                        {u.confirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {!isMe && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="font-sans text-[11px] text-[#FF2035]/50 hover:text-[#FF2035] transition-colors px-2 py-1 rounded-[6px] hover:bg-[#FF2035]/8"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
