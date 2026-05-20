import Image from 'next/image'
import Link from 'next/link'
import FadeUp from '@/components/ui/FadeUp'

const TICKETS = [
  {
    tier: 'bronze' as const,
    emoji: '🥉',
    label: 'Bronze Pass',
    starIcon: '/icons/Star Bronzilocks.png',
    description:
      'The essential pass to get you into the room. Perfect for students looking to explore opportunities and expand their network.',
    borderColor: '#e6a87c',
    headerGradient:
      'linear-gradient(172.73deg, rgba(230,168,124,0.6) 22.105%, rgba(184,115,51,0.6) 77.918%, rgba(128,74,32,0.6) 177.94%)',
    perks: [
      'Entry to all general panel discussions',
      'Digital LSCE event guide and floor map',
      'Standard networking lounge access',
      'Access to the main expo floor and company booths',
    ],
  },
  {
    tier: 'silver' as const,
    emoji: '🥈',
    label: 'Silver Pass',
    starIcon: '/icons/Star Silverlocks.png',
    description:
      'Level up your expo experience with hands-on career prep, priority access, and exclusive workshops.',
    borderColor: '#fafafa',
    headerGradient:
      'linear-gradient(172.79deg, rgba(250,250,250,0.6) 22.105%, rgba(189,189,189,0.6) 77.918%, rgba(189,189,189,0.6) 177.94%)',
    perks: [
      'Everything in the Bronze Pass, plus:',
      'Guaranteed spot in the CV Review Clinic',
      'Priority seating at all general panel sessions',
      'Access to 2 specialized skill masterclasses',
      'Official LSCE tote bag and basic swag',
    ],
  },
  {
    tier: 'gold' as const,
    emoji: '🥇',
    label: 'Gold Pass',
    starIcon: '/icons/Star Goldilocks.png',
    description:
      'The ultimate all-access pass. Maximize your visibility and get one-on-one facetime with top industry recruiters.',
    borderColor: '#fde047',
    headerGradient:
      'linear-gradient(106.35deg, rgba(253,224,71,0.2) 13.324%, rgba(245,158,11,0.2) 65.864%, rgba(217,119,6,0.2) 145.05%)',
    perks: [
      'Everything in the Silver Pass, plus:',
      '1-on-1 Mock Interview session with an HR expert',
      'Invite to the exclusive VIP networking lunch with recruiters',
      'Fast-track priority check-in at the venue',
      'Premium LSCE swag box (T-shirt, notebook, and sponsor gifts)',
    ],
  },
]

export default function Tickets() {
  return (
    <section className="relative bg-[#1A1A1A] py-[120px]">
      {/* Background decorative element */}
      <div className="absolute -inset-x-0 -top-24 -bottom-24 pointer-events-none">
        <Image
          src="/images/tickets-bg.png"
          alt=""
          fill
          className="object-cover opacity-50"
        />
      </div>

      <div className="relative z-10 section-container flex flex-col gap-12 items-center">
        {/* Heading */}
        <FadeUp>
          <div className="flex flex-col gap-2 items-center text-center max-w-[500px]">
            <h2 className="font-display text-[26px] text-white leading-[1.2] font-[500]">
              Secure{' '}
              <span className="text-[#FF2035]">Your Spot</span>{' '}
              Before They&apos;re Gone.
            </h2>
            <p className="font-sans text-[15px] text-white/70 leading-[1.3]">
              Your guide to navigating the Lagos Students Career Expo.
            </p>
          </div>
        </FadeUp>

        {/* Cards */}
        <div className="flex flex-col md:flex-row gap-4 w-full items-center md:items-stretch">
          {TICKETS.map(({ tier, emoji, label, description, borderColor, headerGradient, perks, starIcon }) => (
            <div
              key={tier}
              className="flex-1 flex flex-col overflow-hidden rounded-[20px] w-full max-w-[360px]"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: `1px solid ${borderColor}`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-center py-5"
                style={{ background: headerGradient }}
              >
                <span className="font-display text-[18px] text-white leading-[1.2] font-[500] text-center">
                  {emoji} {label}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-4 px-6 py-5 flex-1">
                <p className="font-sans text-[13px] text-white/80 leading-[1.4]">
                  {description}
                </p>
                <div className="flex flex-col gap-3">
                  {perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Image
                        src={starIcon}
                        alt=""
                        width={14}
                        height={14}
                        className="size-[14px] shrink-0 mt-[2px]"
                      />
                      <span className="font-sans text-[13px] text-white/80 leading-[1.4]">
                        {perk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
        >
          Get a ticket
          <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
        </Link>
      </div>
    </section>
  )
}
