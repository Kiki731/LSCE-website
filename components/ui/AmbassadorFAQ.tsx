'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Who can become an LSCE Campus Ambassador?',
    a: "Any undergraduate or postgraduate student currently enrolled in a Lagos-based university or college. If you're passionate about career development and connecting your peers, you're already halfway there.",
  },
  {
    q: 'What does the role actually involve?',
    a: "Spreading the word about LSCE on your campus, coordinating sign-ups, hosting small info sessions, and being the go-to person for everything expo-related at your school. You'll be supported every step of the way.",
  },
  {
    q: 'Do I need prior experience in events or marketing?',
    a: "Not at all. We provide full training, a brand kit, and dedicated support. All you need is energy, initiative, and a genuine desire to make a difference on your campus.",
  },
  {
    q: 'What perks do ambassadors receive?',
    a: 'Free VIP access to the expo, exclusive ambassador merch, a certificate of participation, LinkedIn recognition, and direct networking access to our brand partners and speakers.',
  },
  {
    q: 'How many ambassadors are you accepting?',
    a: 'We select a limited number of ambassadors per campus to keep the programme exclusive and impactful. Apply early — spots fill up fast.',
  },
  {
    q: 'When is the deadline to apply?',
    a: "Applications close when all campus slots are filled. There's no fixed date, so the sooner you apply the better your chances of being selected.",
  },
]

export default function AmbassadorFAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((faq, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            className="border border-[#1A1A1A]/15 rounded-[14px] overflow-hidden"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-display font-[500] text-[14px] md:text-[16px] text-[#1A1A1A] leading-[1.3]">
                {faq.q}
              </span>
              <span
                className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-[#1A1A1A]/20 transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
              >
                {/* Plus icon — visible dark cross */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M6 1V11M1 6H11" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5">
                <p className="font-sans text-[13px] md:text-[15px] text-[#1A1A1A]/70 leading-[1.6]">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
