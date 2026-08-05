'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Speakers', href: '/speakers' },
  { label: 'Our Teams', href: '/our-team' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Ambassadors', href: '/ambassadors' },
  { label: 'Contact Us', href: '/contact' },
]

const LIGHT_PATHS = ['/gallery', '/speakers', '/ambassadors']

function useNavVariant() {
  const pathname = usePathname()
  return LIGHT_PATHS.includes(pathname) ? 'light' : 'dark'
}

export default function Navbar() {
  const variant = useNavVariant()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isDark = variant === 'dark'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? '' : 'px-5 pt-5 md:px-[120px]'
      }`}
    >
      {/* Desktop — only show at lg (1024px+) */}
      <nav
        className={`hidden lg:flex items-center justify-between py-4 transition-all duration-300 ${
          scrolled ? 'px-[120px]' : 'px-8 rounded-[40px]'
        } ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'}`}
      >
        <Link href="/" className="shrink-0">
          <Image
            src={isDark ? '/images/lsce-logo.png' : '/images/Lsce logo black.png'}
            alt="Lagos Students Career Expo"
            width={120}
            height={28}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-7">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`font-sans text-[15px] leading-none transition-opacity hover:opacity-70 ${
                pathname === href ? 'opacity-100' : 'opacity-80'
              } ${isDark ? 'text-white' : 'text-[#1E1E1E]'}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/sponsor"
            className={`px-5 py-[10px] rounded-[24px] font-sans text-[15px] leading-none transition-opacity hover:opacity-80 ${
              isDark
                ? 'bg-white text-[#FF2035]'
                : 'text-[#FF2035]'
            }`}
          >
            Become a Sponsor
          </Link>
          <Link
            href="/tickets"
            className="flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-[10px] rounded-[24px] font-sans text-[15px] leading-none transition-opacity hover:opacity-90"
          >
            Get a ticket
            <Image
              src="/icons/Button star.svg"
              alt=""
              width={14}
              height={14}
              className="size-[14px]"
            />
          </Link>
        </div>
      </nav>

      {/* Mobile + Tablet — show below lg (1024px) */}
      <nav
        className={`lg:hidden flex items-center justify-between px-5 py-3 transition-all duration-300 ${
          scrolled ? '' : 'rounded-[24px]'
        } ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'}`}
      >
        <Link href="/" className="shrink-0">
          <Image
            src={isDark ? '/images/lsce-logo.png' : '/images/Lsce logo black.png'}
            alt="Lagos Students Career Expo"
            width={90}
            height={21}
            className="h-5 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/tickets"
            className="bg-[#FF2035] text-white px-4 py-2 rounded-[20px] font-sans text-[13px] leading-none"
          >
            Get a ticket
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            className="flex flex-col gap-[5px] p-1"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`block w-5 h-[1.5px] transition-all ${isDark ? 'bg-white' : 'bg-[#1E1E1E]'} ${
                  i === 0 && mobileOpen ? 'rotate-45 translate-y-[6.5px]' :
                  i === 1 && mobileOpen ? 'opacity-0' :
                  i === 2 && mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''
                }`}
              />
            ))}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className={`lg:hidden mt-2 rounded-[20px] px-5 py-5 flex flex-col gap-4 ${
            isDark ? 'bg-[#1E1E1E]' : 'bg-white'
          }`}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`font-sans text-[15px] leading-none ${
                isDark ? 'text-white' : 'text-[#1E1E1E]'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/sponsor"
            onClick={() => setMobileOpen(false)}
            className="font-sans text-[15px] text-[#FF2035]"
          >
            Become a Sponsor
          </Link>
        </div>
      )}
    </header>
  )
}
