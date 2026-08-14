'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  items: string[]       // interleaved names + '★' sentinels
  animation: string     // e.g. 'marquee-left 35s linear infinite'
}

function Row({ items, animation }: Props) {
  const [paused, setPaused] = useState(false)

  return (
    <div
      className="overflow-hidden w-full cursor-default"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          width: 'max-content',
          animation,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {items.map((item, i) =>
          item === '★' ? (
            <Image
              key={i}
              src="/icons/Button Star red.svg"
              alt=""
              width={12}
              height={12}
              style={{ width: 12, height: 12, flexShrink: 0 }}
            />
          ) : (
            <div
              key={i}
              className="group/pill shrink-0 px-5 py-2.5 rounded-[60px] border border-white/20 bg-white/5 hover:bg-white transition-colors duration-150 cursor-default"
            >
              <span className="font-display text-[13px] text-white font-[500] whitespace-nowrap leading-none group-hover/pill:text-[#1A1A1A] transition-colors duration-150">
                {item}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default function AmbassadorMarquee({ items }: { items: string[] }) {
  return (
    <div className="flex flex-col gap-10 md:gap-14">
      <Row items={items} animation="marquee-left 35s linear infinite" />
      <Row items={items} animation="marquee-right 42s linear infinite" />
      <Row items={items} animation="marquee-left 30s linear infinite" />
    </div>
  )
}
