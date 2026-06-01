import Image from 'next/image'
import Link from 'next/link'
import FadeUp from '@/components/ui/FadeUp'

const SPONSOR_PERKS = [
  'Premium Exposure: Dominate our marketing, digital campaigns, and main-stage displays.',
  'Thought Leadership: Secure exclusive speaking slots and position your team as industry pioneers.',
  'VIP Networking: Connect with top-tier executives and key stakeholders in the VIP lounge.',
  'High-Impact CSR: Show the city your brand is actively investing in the future of Nigerian youth.',
]

const EXHIBIT_PERKS = [
  'Recruit Top Talent: Meet and interview highly motivated candidates face-to-face.',
  'Massive Visibility: Put your brand directly in front of thousands of active job seekers.',
  'Build Your Pipeline: Collect hundreds of targeted CVs and contacts in just one day.',
  'Engage Gen Z: Build brand loyalty with a highly engaged, ambitious crowd.',
]

export default function Sponsors() {
  return (
    <section
      className="py-[60px] md:py-[80px]"
      style={{
        background: 'linear-gradient(148deg, rgb(103,19,29) 12%, rgb(37,11,14) 88%)',
      }}
    >
      <div className="section-container flex flex-col gap-10 md:gap-12 items-center">

        {/* Heading */}
        <FadeUp>
          <div className="flex flex-col gap-3 items-center text-center max-w-[620px]">
            <h2 className="font-display text-[22px] md:text-[26px] text-white leading-[1.2] font-[500]">
              Where Top Brands Meet Top{' '}
              <span className="text-[#FF2035]">Talent</span>.
            </h2>
            <p className="font-sans text-[15px] text-white/80 leading-[1.4]">
              Position your brand at the center of the largest student career
              movement in Lagos. Connect, recruit, and empower the workforce of
              tomorrow.
            </p>
          </div>
        </FadeUp>

        {/* Cards row — stacked on mobile+tablet, side-by-side on desktop */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-0 items-start justify-center w-full">

          {/* Sponsor card */}
          <div
            className="w-full lg:w-[450px] shrink-0 flex flex-col gap-6 rounded-[24px] p-8 pt-10"
            style={{
              background: 'rgba(255, 32, 53,0.07)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex flex-col gap-5">
              <h3 className="font-display text-[22px] md:text-[24px] text-white font-[500] text-center leading-[1.2]">
                🥂 Sponsor
              </h3>
              <hr className="border-white/20" />
              <p className="font-sans text-[13px] text-white/80 leading-[1.4]">
                This is for heavyweight brands looking for massive PR value,
                thought leadership, and premium placement.
              </p>
              <div className="flex flex-col gap-3">
                {SPONSOR_PERKS.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px] shrink-0 mt-[2px]" />
                    <span className="font-sans text-[13px] text-white/80 leading-[1.4]">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/sponsor"
              className="flex items-center justify-center gap-1.5 bg-white text-[#FF2035] px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity mt-auto"
            >
              Become a Sponsor
              <Image src="/icons/Button star red.svg" alt="" width={14} height={14} className="size-[14px]" />
            </Link>
          </div>

          {/* Arrow between cards — desktop only */}
          <div className="hidden lg:flex flex-col items-center justify-center self-center w-[80px] shrink-0 mt-[-24px]">
            <Image
              src="/images/Curved arrow.svg"
              alt=""
              width={60}
              height={90}
              className="w-[60px] h-auto opacity-60"
            />
          </div>

          {/* Exhibit card — offset lower on desktop */}
          <div
            className="w-full lg:w-[450px] shrink-0 flex flex-col gap-6 rounded-[24px] p-8 lg:mt-20"
            style={{
              background: 'rgba(255, 32, 53,0.07)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex flex-col gap-5">
              <h3 className="font-display text-[22px] md:text-[24px] text-white font-[500] text-center leading-[1.2]">
                🎪 Exhibit
              </h3>
              <hr className="border-white/20" />
              <p className="font-sans text-[13px] text-white/80 leading-[1.4]">
                This is for companies whose main goal is boots-on-the-ground
                recruiting and face-to-face brand awareness.
              </p>
              <div className="flex flex-col gap-3">
                {EXHIBIT_PERKS.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px] shrink-0 mt-[2px]" />
                    <span className="font-sans text-[13px] text-white/80 leading-[1.4]">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/sponsor"
              className="flex items-center justify-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity mt-auto"
            >
              Become an Exhibitor
              <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
