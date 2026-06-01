'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import Image from 'next/image'

export default function AdminShell({
  email,
  children,
}: {
  email?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  // Close sidebar when screen grows past 1240px
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1240px)')
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div className="flex min-h-screen">

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 min-[1240px]:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ──
          Desktop (≥1240px): always visible as part of flex row
          Mobile (<1240px):  fixed overlay, slides in/out        */}
      <div
        className="fixed min-[1240px]:static z-30 min-[1240px]:z-auto h-full min-[1240px]:h-auto transition-transform duration-200 min-[1240px]:translate-x-0"
        style={{ transform: open ? 'translateX(0)' : undefined }}
      >
        <div className={`min-[1240px]:block ${open ? 'block' : 'hidden'} min-[1240px]:flex`}>
          <Sidebar email={email} onClose={() => setOpen(false)} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar with hamburger */}
        <div className="flex items-center gap-3 px-5 h-14 bg-[#111111] border-b border-white/6 min-[1240px]:hidden shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col gap-[5px] p-1 group"
            aria-label="Open menu"
          >
            <span className="w-5 h-[1.5px] bg-white/60 group-hover:bg-white transition-colors rounded" />
            <span className="w-5 h-[1.5px] bg-white/60 group-hover:bg-white transition-colors rounded" />
            <span className="w-3.5 h-[1.5px] bg-white/60 group-hover:bg-white transition-colors rounded" />
          </button>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-6 h-6 rounded-[7px] shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}
            >
              <Image src="/images/LSCE badge.png" alt="" width={14} height={14} className="object-contain" />
            </div>
            <span className="font-display font-[500] text-white text-[13px]">LSCE Admin</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
