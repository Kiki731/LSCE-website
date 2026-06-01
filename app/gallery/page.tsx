import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FadeUp from '@/components/ui/FadeUp'

/* ── Reusable bento cell ── */
function GalleryCell({
  src,
  alt = '',
  className = '',
  objectPosition = 'center',
}: {
  src: string
  alt?: string
  className?: string
  objectPosition?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[12px] bg-[#e6e6e6] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ objectPosition }}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  )
}

/* ── Page ── */
export default function GalleryPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#F7F5F2] min-h-screen overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="relative pt-[160px] pb-[100px] md:pt-[240px] md:pb-[160px]">

          {/* Decorative star — top right */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-10 right-[-130px] md:right-[-180px] opacity-100"
            style={{ width: 600, height: 600, zIndex: 0 }}
          >
            <Image src="/icons/Star 4 top right.png" alt="" fill className="object-contain" />
          </div>

          {/* Decorative star — mid left */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[280px] left-[-180px] opacity-100"
            style={{ width: 600, height: 600, zIndex: 0 }}
          >
            <Image src="/icons/Star Mid left.png" alt="" fill className="object-contain" />
          </div>

          {/* Content */}
          <div className="relative z-10 section-container flex flex-col items-center gap-6 text-center">
            <FadeUp>
              <div className="flex flex-col items-center gap-4 max-w-[820px] mx-auto">
                <h1 className="font-display font-[500] leading-[1.15] text-[#1A1A1A] text-[36px] md:text-[52px] lg:text-[64px]">
                  The{' '}
                  <span className="text-[#FF2035]">Proof</span>
                  {' '}is in the Room.{' '}
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

                <p className="font-sans text-[15px] md:text-[17px] text-[#1A1A1A]/70 leading-[1.5] max-w-[780px]">
                  Pure energy. Real connections. Unfiltered moments. Scroll through the
                  highlights that defined our past expos and get ready for the next drop.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={150}>
              <Link
                href="/tickets"
                className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
              >
                Get your Tickets
                <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
              </Link>
            </FadeUp>
          </div>

          {/* Section divider */}
          <div className="relative z-10 section-container flex items-center gap-4 md:gap-8" style={{ marginTop: '160px' }}>
            <p className="font-display text-[16px] md:text-[20px] text-[#1A1A1A] font-[500] leading-[1.2] whitespace-nowrap shrink-0">
              The Archives.
            </p>
            <div className="flex-1 h-px bg-[#1A1A1A]/20" />
            <div className="flex items-center gap-2 shrink-0">
              <Image src="/icons/Button Star red.svg" alt="" width={14} height={14} className="size-[14px]" />
              <p className="font-display text-[16px] md:text-[20px] text-[#1A1A1A] font-[500] leading-[1.2] whitespace-nowrap">
                For the Culture
              </p>
            </div>
          </div>
        </section>

        {/* ── Bento Grid ── */}
        <FadeUp>
          <section className="px-5 md:px-12 lg:px-20 pb-[80px] md:pb-[120px] flex flex-col gap-4">

            {/* Row 1 — full width banner */}
            <GalleryCell
              src="/images/gallery/gallery-1.jpg"
              className="h-[220px] md:h-[280px] lg:h-[371px]"
              objectPosition="center 40%"
            />

            {/* Row 2 — wide left + fixed right */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_478px] gap-4">
              <GalleryCell
                src="/images/gallery/gallery-2.jpg"
                className="h-[220px] md:h-[371px]"
              />
              <GalleryCell
                src="/images/gallery/gallery-3.jpg"
                className="h-[220px] md:h-[371px]"
              />
            </div>

            {/* Row 3 — fixed left + wide right */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[478px_1fr] gap-4">
              <GalleryCell
                src="/images/gallery/gallery-4.jpg"
                className="h-[220px] md:h-[371px]"
              />
              <GalleryCell
                src="/images/gallery/gallery-5.jpg"
                className="h-[220px] md:h-[371px]"
              />
            </div>

            {/* Row 4 — three columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[1fr_542px_1fr] gap-4">
              <GalleryCell
                src="/images/gallery/gallery-6.jpg"
                className="h-[220px] md:h-[371px]"
                objectPosition="center top"
              />
              <GalleryCell
                src="/images/gallery/gallery-7.jpg"
                className="h-[220px] md:h-[371px]"
              />
              <GalleryCell
                src="/images/gallery/gallery-8.jpg"
                className="h-[220px] md:h-[371px]"
              />
            </div>

            {/* Row 5 — two stacked left + tall right */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_478px] gap-4 items-start">
              {/* Left: two stacked cells */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                <GalleryCell
                  src="/images/gallery/gallery-9.jpg"
                  className="h-[220px] md:h-[371px]"
                />
                <GalleryCell
                  src="/images/gallery/gallery-10.jpg"
                  className="h-[220px] md:h-[371px]"
                />
              </div>
              {/* Right: tall spanning cell */}
              <GalleryCell
                src="/images/gallery/gallery-11.jpg"
                className="h-[460px] md:h-[540px] lg:h-[758px]"
                objectPosition="center top"
              />
            </div>

          </section>
        </FadeUp>

      </main>

      <Footer />
    </>
  )
}
