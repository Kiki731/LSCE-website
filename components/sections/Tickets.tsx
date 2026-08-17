import Image from 'next/image'
import Link from 'next/link'
import FadeUp from '@/components/ui/FadeUp'

const TICKETS = [
  {
    tier: 'bronze' as const,
    label: 'The Spark',
    ticketImage: '/gallery/The Spark.png',
    price: '₦4,000',
    description:
      'The essential pass to get you into the room. Perfect for students looking to explore opportunities and expand their network.',
    bg: '#BAFFBA',
    border: '#00CF01',
    starIcon: '/icons/Star Green.png',
    perks: [
      'Entry to all general panel discussions',
      'Digital LSCE event guide and floor map',
      'Standard networking lounge access',
      'Access to the main expo floor and company booths',
    ],
  },
  {
    tier: 'silver' as const,
    label: 'The Rise',
    ticketImage: '/gallery/The Rise.png',
    price: '₦8,000',
    description:
      'Level up your expo experience with hands-on career prep, priority access, and exclusive workshops.',
    bg: '#FDF0D9',
    border: '#FFBD4D',
    starIcon: '/icons/Star Yellow.png',
    perks: [
      'Everything in The Spark, plus:',
      'Guaranteed spot in the CV Review Clinic',
      'Priority seating at all general panel sessions',
      'Access to 2 specialized skill masterclasses',
      'Official LSCE tote bag and basic swag',
    ],
  },
  {
    tier: 'gold' as const,
    label: 'The Emergence',
    ticketImage: '/gallery/The Emergence.png',
    price: 'Strictly by Invite',
    description:
      'The ultimate all-access experience. Maximise your visibility and get one-on-one facetime with top industry recruiters.',
    bg: '#FFE3E6',
    border: '#F11429',
    starIcon: '/icons/Star Red.png',
    perks: [
      'Everything in The Rise, plus:',
      '1-on-1 Mock Interview session with an HR expert',
      'Invite to the exclusive VIP networking lunch with recruiters',
      'Fast-track priority check-in at the venue',
      'Premium LSCE swag box (T-shirt, notebook, and sponsor gifts)',
    ],
  },
]

export default function Tickets() {
  return (
    <section className="relative bg-white overflow-hidden rounded-tl-[120px] md:rounded-tl-[280px] py-[80px] md:py-[120px]">

      {/* Decorative star — top right, overlapping Emergence card */}
      <div className="absolute top-[100px] md:top-[140px] right-[80px] md:right-[100px] pointer-events-none z-20" aria-hidden>
        <Image
          src="/gallery/red star asset.png"
          alt=""
          width={120}
          height={120}
          className="w-[80px] md:w-[130px] h-auto"
        />
      </div>

      {/* Decorative image — bottom left, sitting below the wall/edge */}
      <div className="absolute bottom-[-60px] md:bottom-[-80px] left-0 pointer-events-none z-0" aria-hidden>
        <Image
          src="/gallery/LSCE 3.0 Assets ! (11) 2.png"
          alt=""
          width={280}
          height={280}
          className="w-[160px] md:w-[280px] h-auto object-contain object-bottom"
        />
      </div>

      <div className="relative z-10 section-container flex flex-col gap-12 items-center">
        {/* Heading */}
        <FadeUp>
          <div className="flex flex-col gap-2 items-center text-center max-w-[520px]">
            <h2 className="font-display text-[22px] md:text-[28px] text-[#1A1A1A] leading-[1.2] font-[500]">
              Secure{' '}
              <span className="text-[#FF2035]">Your Spot</span>{' '}
              Before They&apos;re Gone.
            </h2>
            <p className="font-sans text-[14px] text-[#1A1A1A]/60 leading-[1.3]">
              Your guide to navigating the Lagos Students Career Expo.
            </p>
          </div>
        </FadeUp>

        {/* Cards */}
        <FadeUp delay={80} className="flex flex-col min-[1000px]:flex-row gap-6 min-[1000px]:gap-4 w-full items-center min-[1000px]:items-stretch">
          {TICKETS.map(({ tier, label, ticketImage, price, description, bg, border, starIcon, perks }) => (
            <div
              key={tier}
              className="flex-1 flex flex-col overflow-hidden rounded-[9px] w-full max-w-[460px] min-[1000px]:max-w-none"
              style={{
                backgroundColor: bg,
                border: `7px solid ${border}`,
              }}
            >
              {/* Header — ticket image */}
              <div className="flex items-center justify-center px-6 py-4 border-b-4" style={{ borderColor: border + '60' }}>
                <Image
                  src={ticketImage}
                  alt={label}
                  width={480}
                  height={180}
                  className="w-full max-w-[260px] h-auto object-contain"
                />
              </div>

              {/* Body */}
              <div className="flex flex-col gap-4 px-6 py-5 flex-1">
                <div className="flex flex-col gap-1">
                  <p className={`text-[#1A1A1A] font-[500] leading-[1.2] ${tier === 'gold' ? 'font-sans text-[13px] opacity-60' : 'font-display text-[22px] md:text-[26px]'}`}>
                    {price}
                  </p>
                  <p className="font-sans text-[13px] text-[#1A1A1A]/70 leading-[1.4]">
                    {description}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Image
                        src={starIcon}
                        alt=""
                        width={16}
                        height={16}
                        className="size-[16px] shrink-0 mt-[1px]"
                      />
                      <span className="font-sans text-[13px] text-[#1A1A1A] leading-[1.4]">
                        {perk}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-auto pt-4">
                  {tier === 'gold' ? (
                    <span className="flex items-center justify-center gap-1.5 w-full bg-[#1A1A1A]/10 text-[#1A1A1A] px-4 py-3 rounded-[24px] font-sans text-[13px] leading-none">
                      Strictly by Invite
                    </span>
                  ) : (
                    <Link
                      href={`/tickets?tier=${tier}`}
                      className="flex items-center justify-center gap-2 w-full bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[13px] leading-none hover:opacity-90 transition-opacity"
                    >
                      Get {label}
                      <Image src="/icons/Button star.svg" alt="" width={12} height={12} className="size-[12px]" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </FadeUp>

        {/* Bottom CTA */}
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
        >
          View all tickets
          <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
        </Link>
      </div>
    </section>
  )
}
