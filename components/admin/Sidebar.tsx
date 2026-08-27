'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const NAV = [
  {
    label: 'Overview',
    href: '/admin/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.9"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.9"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.9"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.9"/>
      </svg>
    ),
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 3h12M2 8h12M2 13h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Attendees',
    href: '/admin/attendees',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Check-in',
    href: '/admin/checkin',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5L6.5 12 13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Coupons',
    href: '/admin/coupons',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="5" width="14" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 8h6M5 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'CVs',
    href: '/admin/cvs',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="9" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M13 4v9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M4 5h5M4 7.5h5M4 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Applications',
    href: '/admin/applications',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 5.5h6M5 8h6M5 10.5h3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/admin/contact-messages',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 3h12v8H2z" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 3l6 5 6-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <rect x="2" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    label: 'Referrals',
    href: '/admin/referrals',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="5" cy="4" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="8.5" cy="12" r="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5 6c0 2 1.5 3 3.5 3M12 6c0 2-1.5 3-3.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Recovery',
    href: '/admin/recovery',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 2.5l14 5.5-14 5.5V9.5l9-1.5-9-1.5V2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'Sessions',
    href: '/admin/sessions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M4 7h4M4 9.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'Team',
    href: '/admin/team',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M1 14c0-2.761 2.239-4.5 5-4.5s5 1.739 5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M11.5 7.5v4M9.5 9.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Sidebar({ email, onClose }: { email?: string; onClose?: () => void }) {
  const pathname = usePathname()
  const router   = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col w-[220px] shrink-0 bg-[#111111] border-r border-white/6 h-full">

      {/* Logo — always visible, never scrolls away */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/6 shrink-0">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-[8px] shrink-0"
          style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}
        >
          <Image src="/images/LSCE badge.png" alt="" width={16} height={16} className="object-contain" />
        </div>
        <div className="flex-1">
          <p className="font-display font-[500] text-white text-[13px] leading-none">LSCE Admin</p>
          <p className="font-sans text-[10px] text-white/30 mt-0.5">2026 Portal</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="min-[1240px]:hidden text-white/40 hover:text-white transition-colors p-1"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Navigation — grows to fill space, scrolls if needed */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-colors"
              style={{
                background: active ? 'rgba(255,32,53,0.12)' : 'transparent',
                color: active ? '#FF2035' : 'rgba(255,255,255,0.5)',
              }}
            >
              <span className="shrink-0" style={{ color: active ? '#FF2035' : 'rgba(255,255,255,0.35)' }}>
                {item.icon}
              </span>
              <span className="font-sans text-[13px] font-[500]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User + sign out — always pinned to bottom */}
      <div className="px-3 pb-4 border-t border-white/6 pt-3 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-[#FF2035]/20 flex items-center justify-center shrink-0">
            <span className="font-display text-[11px] text-[#FF2035] font-[500]">
              {email?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[12px] text-white/70 truncate">{email ?? 'Admin'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] hover:bg-white/5 transition-colors mt-0.5"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 7h7M9 5l2 2-2 2M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-sans text-[13px] text-white/40">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
