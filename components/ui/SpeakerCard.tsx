'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import type { Speaker } from '@/lib/types'

interface SpeakerCardProps {
  speaker: Partial<Speaker>
  className?: string
}

export default function SpeakerCard({ speaker, className = '' }: SpeakerCardProps) {
  const [flipped, setFlipped] = useState(false)
  const touchRef = useRef(false)

  /* ── Desktop: hover ── */
  const handleMouseEnter = () => {
    if (!touchRef.current) setFlipped(true)
  }
  const handleMouseLeave = () => {
    if (!touchRef.current) setFlipped(false)
    touchRef.current = false
  }

  /* ── Mobile: tap toggle ── */
  const handleTouchStart = () => {
    touchRef.current = true
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault() // stop the browser firing mouse events after touch
    setFlipped((f) => !f)
  }

  const hasBio = !!speaker.bio
  const isFlipped = flipped

  return (
    <div
      className={`group bg-[#c8c8c8] flex flex-col overflow-hidden rounded-[16px] shrink-0 cursor-pointer select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Flip zone (image area only) ── */}
      <div
        className="relative h-[260px] md:h-[320px]"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front — photo */}
          <div
            className="absolute inset-0 bg-[#e5e5e5] overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {speaker.image_url && (
              <Image
                src={speaker.image_url}
                alt={speaker.name ?? ''}
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 340px"
              />
            )}
          </div>

          {/* Back — bio (red) */}
          <div
            className="absolute inset-0 bg-[#FF2035] flex flex-col items-center justify-center gap-5 px-6"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Social icons — clickable links */}
            <div className="flex items-center gap-4">
              {/* LinkedIn */}
              <a
                href={speaker.linkedin_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { if (!speaker.linkedin_url) e.preventDefault() }}
                className="opacity-90 hover:opacity-100 transition-opacity"
                aria-label={`${speaker.name} on LinkedIn`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path
                    d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                  <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </a>

              {/* X (formerly Twitter) — official logo */}
              <a
                href={speaker.twitter_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { if (!speaker.twitter_url) e.preventDefault() }}
                className="opacity-90 hover:opacity-100 transition-opacity"
                aria-label={`${speaker.name} on X`}
              >
                <svg width="20" height="20" viewBox="0 0 1200 1227" fill="none" className="text-white">
                  <path
                    d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>

            {/* Bio text */}
            <p className="font-sans text-[13px] text-white/90 leading-[1.6] text-center">
              {hasBio ? speaker.bio : 'Bio coming soon.'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Name plate — always visible, never flips ── */}
      <div className="flex flex-col items-center justify-center px-8 py-6 border-t-2 border-[#f7f5f2] bg-[#282828] group-hover:bg-[#2a2a2a] transition-colors duration-200">
        <p className="font-sans font-semibold text-[17px] text-white leading-[1.2] text-center w-full">
          {speaker.name}
        </p>
        <p className="font-sans text-[13px] text-white leading-[1.2] text-center w-full opacity-80 mt-1">
          {speaker.role}
        </p>
      </div>
    </div>
  )
}
