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

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1240px)')
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    /*
      h-screen + overflow-hidden on the shell means the shell never grows
      taller than the viewport. The sidebar is naturally full height.
      The main content area has overflow-y-auto so IT scrolls, not the window.
    */
    <div className="flex h-screen overflow-hidden bg-[#0E0E0E]">

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 min-[1240px]:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Desktop sidebar — always visible, fills full height naturally */}
      <div className="hidden min-[1240px]:flex shrink-0">
        <Sidebar email={email} />
      </div>

      {/* Mobile sidebar — slides in from left as a fixed overlay */}
      <div
        className={`fixed top-0 left-0 z-30 h-full min-[1240px]:hidden transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar email={email} onClose={() => setOpen(false)} />
      </div>

      {/* Main content — this is the ONLY scrollable region */}
      <div className="flex-1 overflow-y-auto flex flex-col min-w-0">

        {/* Mobile top bar */}
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
