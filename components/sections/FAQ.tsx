'use client'

import { useState } from 'react'
import FadeUp from '@/components/ui/FadeUp'

const FAQS = [
  {
    question: "Who can attend the Lagos Students Career Expo?",
    answer:
      "LSCE is open to all university students, recent graduates, and young professionals in Nigeria. Whether you are in your first year or just starting your career journey, there is something here for you.",
  },
  {
    question: "How should I prepare for the expo?",
    answer:
      "Update your CV, research the attending companies, and bring printed copies. Prepare a short personal pitch (60 seconds), dress professionally, and come with an open mind and energy to network.",
  },
  {
    question: "What kind of companies will be there?",
    answer:
      "Top Nigerian and multinational companies across tech, finance, consulting, FMCG, media, and more. Think Paystack, Moniepoint, TechCabal, and many other leading brands.",
  },
  {
    question: "Are there other activities besides networking?",
    answer:
      "Absolutely. We have workshops, masterclasses, CV clinics, mock interview sessions, panel discussions with industry leaders, and a curated expo floor with company booths.",
  },
  {
    question: "When and where is LSCE 3.0?",
    answer:
      "LSCE 3.0 holds on October 3rd, 2026 at the Landmark Event Center, Lagos. Doors open at 9am.",
  },
  {
    question: "Can I volunteer to help at the event?",
    answer:
      "Yes! We welcome passionate volunteers. Reach out to us via our social media pages or email us directly to apply as part of the event crew.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-[#F7F5F2] py-[120px]">
      <div className="section-container flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

        {/* Left — label */}
        <FadeUp className="flex flex-col gap-3 lg:w-[380px] shrink-0">
          <h2 className="font-display text-[22px] md:text-[26px] text-[#1A1A1A] leading-[1.2] font-[500]">
            Frequently{' '}
            <span className="text-[#FF2035]">Asked</span>{' '}
            Questions
          </h2>
          <p className="font-sans text-[15px] text-[#1A1A1A]/70 leading-[1.4]">
            Your guide to navigating the Lagos Students Career Expo.
          </p>
        </FadeUp>

        {/* Right — accordion */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Always-visible intro */}
          <div className="pb-5">
            <p className="font-display text-[16px] text-[#1A1A1A] font-[500] leading-[1.2]">
              What is LSCE
            </p>
            <p className="font-sans text-[13px] text-[#1A1A1A]/70 leading-[1.4] mt-2">
              The Lagos Students Career Expo (LSCE) is the largest
              student-organized career exposition in Lagos, bridging the gap
              between students and career opportunities through talks, workshops,
              and direct employer access.
            </p>
          </div>
          <hr className="border-[#1A1A1A]/15 mb-1" />

          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full py-4 text-left group"
              >
                <span className="font-sans text-[16px] text-[#1A1A1A] leading-[1.3] pr-4 group-hover:text-[#FF2035] transition-colors">
                  {faq.question}
                </span>
                <span
                  className={`shrink-0 size-6 rounded-full border border-[#1A1A1A]/30 flex items-center justify-center text-[#1A1A1A] font-sans text-[16px] leading-none transition-transform duration-200 ${
                    openIndex === i ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>

              {openIndex === i && (
                <p className="font-sans text-[13px] text-[#1A1A1A]/70 leading-[1.5] pb-4">
                  {faq.answer}
                </p>
              )}
              <hr className="border-[#1A1A1A]/15" />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
