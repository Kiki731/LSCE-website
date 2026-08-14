import Image from 'next/image'
import Link from 'next/link'

const PARTNERS = [
  { name: 'TechCabal', logo: '/partners/techcabal.png', width: 180, height: 40 },
  { name: 'Cowrywise', logo: '/partners/cowrywise.png', width: 167, height: 31 },
  { name: 'Paystack', logo: '/partners/paystack.png', width: 151, height: 27 },
  { name: 'Moniepoint', logo: '/partners/moniepoint.png', width: 150, height: 37 },
  { name: 'Utiva', logo: '/partners/utiva.png', width: 98, height: 29 },
  { name: 'ALX', logo: '/partners/alx.png', width: 59, height: 30 },
  { name: 'AIESEC', logo: '/partners/Aiesec.png', width: 120, height: 32 },
  { name: 'Education USA', logo: '/partners/Education Usa.png', width: 140, height: 32 },
  { name: 'Enoverlab', logo: '/partners/Enoverlab.png', width: 130, height: 32 },
  { name: 'GoNomad', logo: '/partners/Gonomad.png', width: 120, height: 32 },
  { name: 'Marble Capital', logo: '/partners/Marble-Capital-Limited-Logo-1-removebg-preview-1-e1752153108479 1.png', width: 140, height: 32 },
  { name: 'Niteon', logo: '/partners/Niteon.png', width: 110, height: 32 },
  { name: 'TFN', logo: '/partners/TFN-Logo-1536x254 1.png', width: 130, height: 32 },
  { name: 'Work Nigeria', logo: '/partners/Work Nigeria.png', width: 140, height: 32 },
  { name: 'Mariam Grey', logo: '/partners/cropped-Mariam-Grey-Logo-01 2.png', width: 120, height: 32 },
]

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '70svh' }}>
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="LSCE event crowd"
          fill
          className="object-cover object-center blur-[1px] scale-105"
          priority
          quality={85}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(-50.67deg, rgba(0,0,0,0) 14.641%, rgb(26,26,26) 77.919%)',
          }}
        />
      </div>

      {/* Content — section-container keeps text within readable bounds */}
      <div className="relative z-10 section-container pt-[120px] md:pt-[180px] pb-[100px] md:pb-[120px] min-h-[90svh] flex flex-col justify-start">
        <div className="flex flex-col gap-4 max-w-[680px]">

          {/* Headline */}
          <h1 className="hero-entry font-display text-[36px] md:text-[52px] text-white leading-[1.2] font-[500]">
            Lagos Students
            <br />
            <span className="inline-flex items-center gap-3">
              Career Expo
              <Image
                src="/images/Frame 202.png"
                alt="LSCE"
                width={50}
                height={50}
                className="size-[40px] md:size-[50px] inline-block shrink-0"
              />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-entry-d1 font-sans text-[15px] md:text-[16px] text-white leading-[1.4] max-w-[560px] opacity-90">
            Join the largest student-organized expo in Lagos. Connect with
            industry experts, build your network, and step off campus ready to
            lead.
          </p>

          {/* CTA */}
          <Link
            href="/tickets"
            className="hero-entry-d2 inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[16px] leading-none w-fit mt-1 hover:opacity-90 transition-opacity"
          >
            Register for LSCE 3.0
            <Image
              src="/icons/Button star.svg"
              alt=""
              width={14}
              height={14}
              className="size-[14px]"
            />
          </Link>

          {/* Stats */}
          <div className="hero-entry-d3 flex items-center gap-8 mt-3">
            <div className="flex flex-col">
              <span className="font-display text-[22px] text-white leading-[1.2] font-[500]">2500+</span>
              <span className="font-sans text-[14px] text-white/80 leading-[1.2]">Attendees</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[22px] text-white leading-[1.2] font-[500]">15+</span>
              <span className="font-sans text-[14px] text-white/80 leading-[1.2]">Speakers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partners strip — full viewport width, outside section-container */}
      <div className="hero-entry-d4 absolute bottom-0 left-0 right-0 z-10">
        <div className="flex items-stretch border-t border-white/10">
          <div className="shrink-0 bg-[#FF2035] px-5 md:px-16 py-4 flex items-center">
            <p className="font-display text-white text-[13px] leading-[1.3] font-[500] whitespace-nowrap">
              Our Past
              <br />
              Partners
            </p>
          </div>
          <div className="flex-1 overflow-hidden bg-white/90 py-4 px-4">
            <div className="flex animate-marquee gap-10 w-max items-center h-full">
              {[...PARTNERS, ...PARTNERS].map((p, i) => (
                <div key={i} className="shrink-0 flex items-center">
                  <Image
                    src={p.logo}
                    alt={p.name}
                    width={p.width}
                    height={p.height}
                    className="object-contain"
                    style={{ maxHeight: '32px', width: 'auto' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
