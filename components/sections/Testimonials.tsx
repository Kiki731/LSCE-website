'use client'

import { useState } from 'react'
import FadeUp from '@/components/ui/FadeUp'

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      'Building interest in tech and taking up courses. It led to me becoming an Administrative Virtual Assistant and a Product Manager — decisions I would never have made without attending LSCE.',
    name: 'Deborah Akinyemi',
    school: 'Lagos State College Of Nursing, Igando',
    editions: 'LSCE 1.0 & 2.0',
  },
  {
    id: 2,
    quote:
      'LSCE really changed the way I viewed my goals and career. One of the speakers talked about being "delulu," and I realised that mindset was affecting the decisions I was making. I walked away with a completely different perspective. I really love the growth I\'ve experienced and the person I\'m becoming.',
    name: 'Ibrahim AbdulQuadri',
    school: 'Yaba College of Technology',
    editions: 'LSCE 1.0',
  },
  {
    id: 3,
    quote:
      'I came in thinking networking was just exchanging contacts. LSCE showed me it\'s about building real relationships with people genuinely invested in your growth. Six months later I landed my first internship through a connection I made at the expo.',
    name: 'Tolu Adeyemi',
    school: 'University of Lagos',
    editions: 'LSCE 2.0',
  },
  {
    id: 4,
    quote:
      'Before LSCE I had zero confidence pitching myself to anyone. After sitting in on the sessions and watching speakers own their stories, something just clicked. I went back to campus and started the entrepreneurship club. Best decision I\'ve ever made.',
    name: 'Chisom Eze',
    school: 'Caleb University',
    editions: 'LSCE 2.0',
  },
  {
    id: 5,
    quote:
      'I had been applying for internships for months with no luck. After one afternoon at LSCE, a recruiter from a panel session reviewed my CV on the spot and told me exactly what was wrong. I fixed it that weekend and got a callback the following week.',
    name: 'Seun Makinde',
    school: 'Covenant University',
    editions: 'LSCE 2.0',
  },
  {
    id: 6,
    quote:
      'What struck me most was seeing people my age already building things that mattered. I left feeling like I had been playing too small. LSCE didn\'t just inspire me — it set a new standard for what I thought was possible for someone still in school.',
    name: 'Amara Obi',
    school: 'Babcock University',
    editions: 'LSCE 2.0',
  },
]

// Duplicate for seamless infinite loop — 6 unique cards means no visible repeat
const ITEMS = [...TESTIMONIALS, ...TESTIMONIALS]

export default function Testimonials() {
  const [paused, setPaused] = useState(false)

  return (
    <section className="bg-[#1A1A1A] py-[80px] md:py-[120px] overflow-hidden">
      {/* Heading */}
      <div className="section-container mb-12 md:mb-16">
        <FadeUp>
          <div className="flex flex-col gap-3 items-center text-center max-w-[620px] mx-auto">
            <h2 className="font-display text-[22px] md:text-[32px] text-white leading-[1.2] font-[500]">
              Hear it from those who{' '}
              <span className="text-[#FF2035]">were there.</span>
            </h2>
            <p className="font-sans text-[15px] text-white/60 leading-[1.5]">
              Real stories from past attendees whose careers shifted after a single day at LSCE.
            </p>
          </div>
        </FadeUp>
      </div>

      {/* Auto-scrolling row */}
      <div
        className="w-full overflow-hidden cursor-default"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          style={{
            display: 'flex',
            gap: '20px',
            width: 'max-content',
            animation: 'marquee-left 60s linear infinite',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {ITEMS.map((t, i) => (
            <div
              key={i}
              className="shrink-0 w-[340px] md:w-[420px] rounded-[20px] p-6 md:p-8 flex flex-col gap-5"
              style={{ background: '#242424' }}
            >
              {/* Quote */}
              <p className="font-sans text-[14px] md:text-[15px] text-white/80 leading-[1.65] flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Divider */}
              <div className="w-full h-px bg-white/10" />

              {/* Attribution */}
              <div className="flex flex-col gap-0.5">
                <p className="font-display text-[14px] text-white font-[500] leading-[1.2]">
                  {t.name}
                </p>
                <p className="font-sans text-[12px] text-white/40 leading-[1.3]">
                  {t.school} · {t.editions}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
