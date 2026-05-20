'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface FadeUpProps {
  children: ReactNode
  /** Stagger delay in ms (default 0) */
  delay?: number
  /** Extra Tailwind classes passed to the wrapper div */
  className?: string
}

/**
 * Lightweight scroll-triggered fade-up wrapper.
 * Uses IntersectionObserver — no library required.
 * Safe to use as a child of server components.
 */
export default function FadeUp({ children, delay = 0, className = '' }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'none'
          observer.unobserve(el)
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(20px)',
        transition: `opacity 0.65s ease, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
