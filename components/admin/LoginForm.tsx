'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push(next ?? '/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-5">

      {/* Background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,32,53,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px] flex flex-col gap-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-[14px]"
            style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}
          >
            <Image src="/images/LSCE badge.png" alt="LSCE" width={28} height={28} className="object-contain" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-[500] text-white text-[22px] leading-none">
              Admin Portal
            </h1>
            <p className="font-sans text-[13px] text-white/40 mt-1">
              Lagos Students Career Expo
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#161616] border border-white/8 rounded-[20px] p-7 flex flex-col gap-5">
          <div>
            <h2 className="font-display font-[500] text-white text-[17px] leading-none">
              Sign in to continue
            </h2>
            <p className="font-sans text-[12px] text-white/40 mt-1.5">
              Admin access only. Contact your team lead for credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@thelscexpo.com"
                required
                autoComplete="email"
                className="bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 font-sans text-[14px] text-white placeholder:text-white/20 outline-none focus:border-[#FF2035] transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                className="bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 font-sans text-[14px] text-white placeholder:text-white/20 outline-none focus:border-[#FF2035] transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-[#FF2035]/10 border border-[#FF2035]/30 rounded-[8px] px-4 py-3">
                <p className="font-sans text-[13px] text-[#FF2035]">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[60px] font-sans text-[14px] font-semibold transition-all mt-1"
              style={{
                background: loading ? 'rgba(255,32,53,0.4)' : '#FF2035',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center font-sans text-[12px] text-white/20">
          No sign-up available. Admin accounts are created by existing admins.
        </p>
      </div>
    </div>
  )
}
