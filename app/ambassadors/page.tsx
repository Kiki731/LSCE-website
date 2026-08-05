import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FadeUp from '@/components/ui/FadeUp'
import AmbassadorFAQ from '@/components/ui/AmbassadorFAQ'
import AmbassadorMarquee from '@/components/ui/AmbassadorMarquee'

/* ── University list for marquee rows ── */
const UNIVERSITIES_BASE = [
  'University of Lagos',
  'Lagos State University',
  'Yaba College of Technology',
  'Pan-Atlantic University',
  "Redeemer's University",
  'Covenant University',
  'Lagos Business School',
  'University of Ibadan',
  'Caleb University',
  'Babcock University',
]

// Build a flat list: pill, star, pill, star... then doubled for seamless -50% loop
function buildMarqueeItems(base: string[]) {
  // Interleave names with a "star" sentinel, then double for loop
  const half = base.flatMap((name) => [name, '★'])
  return [...half, ...half]
}

/* ── Carousel images ── */
const CAROUSEL_IMAGES = [
  '/images/ambassadors/amb-1.jpg',
  '/images/ambassadors/amb-2.jpg',
  '/images/ambassadors/amb-3.jpg',
  '/images/ambassadors/amb-4.jpg',
  '/images/ambassadors/amb-5.jpg',
  '/images/ambassadors/amb-6.jpg',
]

const CAROUSEL_ITEMS = [...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES]

/* ── Benefit card shell ── */
function BenefitCard({
  bg,
  title,
  description,
  children,
}: {
  bg: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-[22px] overflow-hidden flex flex-col w-full max-w-[398px]"
      style={{ minHeight: 467, backgroundColor: bg }}
    >
      {/* Text at the top */}
      <div className="p-6 pt-7 flex flex-col gap-3">
        <h3 className="font-display font-[500] text-[17px] md:text-[19px] text-[#1A1A1A] leading-[1.3]">
          {title}
        </h3>
        <p className="font-sans text-[13px] md:text-[14px] text-[#1A1A1A]/65 leading-[1.6]">
          {description}
        </p>
      </div>
      {/* Image slot — fills remaining card height */}
      <div className="relative flex-1 overflow-hidden" style={{ minHeight: 220 }}>
        {children}
      </div>
    </div>
  )
}

/* ── Pre-built marquee item lists ── */
const ROW_ITEMS = buildMarqueeItems(UNIVERSITIES_BASE)

/* ── Page ── */
export default function AmbassadorsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#F7F5F2] min-h-screen overflow-x-hidden">

        {/* ════════════════════════════════
            HERO
        ════════════════════════════════ */}
        <section className="relative pt-[160px] md:pt-[240px]">

          {/* Decorative star — top right */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-10 right-[-130px] md:right-[-180px]"
            style={{ width: 600, height: 600, zIndex: 0 }}
          >
            <Image src="/icons/Star 4 top right.png" alt="" fill className="object-contain" />
          </div>

          {/* Decorative star — mid left */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[280px] left-[-180px]"
            style={{ width: 600, height: 600, zIndex: 0 }}
          >
            <Image src="/icons/Star Mid left.png" alt="" fill className="object-contain" />
          </div>

          {/* Heading + CTA */}
          <div className="relative z-10 section-container flex flex-col items-center gap-6 text-center pb-[60px] md:pb-[80px]">
            <FadeUp>
              <div className="flex flex-col items-center gap-4 max-w-[820px] mx-auto">
                <h1 className="font-display font-[500] leading-[1.15] text-[#1A1A1A] text-[36px] md:text-[52px] lg:text-[64px]">
                  <span className="text-[#FF2035]">Lead</span>
                  {' '}the Movement on
                  <br className="hidden md:block" />
                  {' '}Your Campus.{' '}
                  <span className="inline-flex items-center justify-center align-middle">
                    <span
                      className="inline-flex items-center justify-center rounded-[32px] shrink-0 ml-1 p-1.5"
                      style={{
                        background:
                          'linear-gradient(127deg, rgba(255,32,53,0.9) 0%, rgba(224,0,21,0.9) 100%)',
                      }}
                    >
                      <Image
                        src="/images/LSCE badge.png"
                        alt="LSCE"
                        width={40}
                        height={40}
                        className="size-[28px] md:size-[38px] object-contain"
                      />
                    </span>
                  </span>
                </h1>

                <p className="font-sans text-[15px] md:text-[17px] text-[#1A1A1A]/70 leading-[1.5] max-w-[620px]">
                  Represent LSCE on your campus, unlock exclusive perks, and build
                  the kind of network that actually opens doors. This is more than
                  a role — it&apos;s a launchpad.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={150}>
              <Link
                href="/ambassadors/apply"
                className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
              >
                Apply Now
                <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
              </Link>
            </FadeUp>
          </div>

          {/* Auto-scrolling image carousel — no FadeUp wrapper so animation runs freely */}
          <div className="relative z-10 w-full overflow-hidden pb-[80px] md:pb-[100px]" aria-hidden>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                width: 'max-content',
                animation: 'marquee-left 28s linear infinite',
              }}
            >
              {CAROUSEL_ITEMS.map((src, i) => (
                <div
                  key={i}
                  className="relative shrink-0 rounded-[16px] overflow-hidden bg-[#d0d0d0]"
                  style={{ width: 280, height: 360 }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover mix-blend-luminosity"
                    sizes="280px"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section divider */}
          <div
            className="relative z-10 section-container flex items-center gap-4 md:gap-8"
            style={{ paddingBottom: '80px' }}
          >
            <p className="font-display text-[16px] md:text-[20px] text-[#1A1A1A] font-[500] leading-[1.2] whitespace-nowrap shrink-0">
              Rep the Culture.
            </p>
            <div className="flex-1 h-px bg-[#1A1A1A]/20" />
            <div className="flex items-center gap-2 shrink-0">
              <Image src="/icons/Button Star red.svg" alt="" width={14} height={14} className="size-[14px]" />
              <p className="font-display text-[16px] md:text-[20px] text-[#1A1A1A] font-[500] leading-[1.2] whitespace-nowrap">
                Join the Inner Circle
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════
            WHAT'S ON THE TABLE
        ════════════════════════════════ */}
        <section className="section-container py-[80px] md:py-[120px]">
          <FadeUp>
            {/* Centered heading */}
            <div className="flex flex-col items-center text-center gap-3 mb-10 md:mb-14">
              <p className="font-sans text-[13px] md:text-[14px] text-[#1A1A1A]/50 uppercase tracking-[0.1em]">
                Ambassador Benefits
              </p>
              <h2 className="font-display font-[500] text-[28px] md:text-[40px] lg:text-[52px] text-[#1A1A1A] leading-[1.15]">
                What&apos;s on{' '}
                <span className="text-[#FF2035]">the Table.</span>
              </h2>
            </div>
          </FadeUp>

          <FadeUp delay={80}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 justify-items-center">

              {/* ── Card 1: Networking ── */}
              <BenefitCard
                bg="#F5F0EB"
                title="The Ultimate Networking Cheat Code 🤝"
                description="Get direct access to industry professionals, hiring managers, and top brands before anyone else. Your campus role becomes your backstage pass."
              >
                {/* Wrapper shifted down — Image fill is on this inner div, parent clips the overflow */}
                <div className="absolute left-0 right-0" style={{ top: '10%', bottom: '-10%' }}>
                  <Image
                    src="/images/ambassadors/amb-card-1.jpg"
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="400px"
                  />
                </div>
                {/* Gradient fade into card bg */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, transparent 95%, #F5F0EB 100%)' }}
                />
              </BenefitCard>

              {/* ── Card 2: Leadership ── */}
              <BenefitCard
                bg="#EBF0F5"
                title="High-Impact Leadership (CV Boost) 🚀"
                description="Build a verifiable leadership track record that sets you apart. Your ambassador role will be something you're proud to put on your CV."
              >
                <div className="absolute left-0 right-0" style={{ top: '10%', bottom: '-10%' }}>
                  <Image
                    src="/images/ambassadors/amb-card-2.jpg"
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="398px"
                  />
                </div>
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, transparent 95%, #EBF0F5 100%)' }}
                />
              </BenefitCard>

              {/* ── Card 3: VIP — image tilted right ── */}
              <BenefitCard
                bg="#F5EBEE"
                title="VIP Perks & Insider Access 🎟️"
                description="Walk into the expo as a VIP. Merch, exclusive sessions, front-row brand activations — the kind of access your classmates can only dream of."
              >
                {/* Tilted image wrapper — overflow hidden on parent clips the rotated corners */}
                <div
                  className="absolute"
                  style={{
                    inset: '-15%',
                    transform: 'rotate(14deg)',
                    transformOrigin: 'center 30%',
                  }}
                >
                  <Image
                    src="/images/ambassadors/amb-card-3.jpg"
                    alt=""
                    fill
                    className="object-cover object-center"
                    sizes="500px"
                  />
                </div>
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to bottom, transparent 95%, #F5EBEE 100%)' }}
                />
              </BenefitCard>

            </div>
          </FadeUp>
        </section>

        {/* ════════════════════════════════
            BUILDING FUTURES — dark section
        ════════════════════════════════ */}
        <section
          className="relative bg-[#1A1A1A] overflow-hidden"
          style={{ paddingTop: 80, paddingBottom: 80 }}
        >

          {/* Decorative star — bottom right (Star Mid left, mirrored horizontally) */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-220px] right-[-280px]"
            style={{ width: 900, height: 900, zIndex: 0, transform: 'scaleX(-1)' }}
          >
            <Image src="/icons/Star Mid left.png" alt="" fill className="object-contain" />
          </div>

          {/* Heading — centered */}
          <div className="relative z-10 section-container" style={{ marginBottom: 48 }}>
            <FadeUp>
              <div className="flex flex-col items-center text-center">
                <h2 className="font-display font-[500] text-[28px] md:text-[40px] lg:text-[36px] text-white leading-[1.15]">
                  Building{' '}
                  <span className="text-[#FF2035]">futures</span>
                  {' '}across Lagos,
                  <br />
                  one degree at a time.
                </h2>
              </div>
            </FadeUp>
          </div>

          {/* Three alternating marquee rows — interactive client component */ }
          <div className="relative z-10">
            <AmbassadorMarquee items={ROW_ITEMS} />
          </div>

          {/* CTA */}
          <div className="relative z-10 section-container" style={{ marginTop: 56 }}>
            <FadeUp delay={100}>
              <div className="flex justify-center">
                <Link
                  href="/ambassadors/apply"
                  className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
                >
                  Find your Campus
                  <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ════════════════════════════════
            FAQ
        ════════════════════════════════ */}
        <section id="faq" className="section-container py-[80px] md:py-[120px]">
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 lg:gap-16 items-start">

            {/* Left — sticky title + CTA */}
            <FadeUp>
              <div className="flex flex-col gap-6 lg:sticky lg:top-32">
                <div className="flex flex-col gap-3">
                  <p className="font-sans text-[13px] md:text-[14px] text-[#1A1A1A]/50 uppercase tracking-[0.1em]">
                    Got questions?
                  </p>
                  <h2 className="font-display font-[500] text-[28px] md:text-[36px] text-[#1A1A1A] leading-[1.15]">
                    Everything you need to{' '}
                    <span className="text-[#FF2035]">know.</span>
                  </h2>
                  <p className="font-sans text-[14px] md:text-[15px] text-[#1A1A1A]/65 leading-[1.6]">
                    Still have questions? Reach out to us on Instagram{' '}
                    <span className="text-[#FF2035]">@lagoscareerexpo</span> and
                    we&apos;ll get back to you.
                  </p>
                </div>

                <Link
                  href="mailto:team@thelscexpo.com"
                  className="inline-flex items-center gap-1.5 bg-[#1A1A1A] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-80 transition-opacity w-fit"
                >
                  Contact Us
                  <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
                </Link>
              </div>
            </FadeUp>

            {/* Right — accordion */}
            <FadeUp delay={80}>
              <AmbassadorFAQ />
            </FadeUp>

          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
