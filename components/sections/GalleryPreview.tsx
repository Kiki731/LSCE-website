import Image from 'next/image'
import Link from 'next/link'
import FadeUp from '@/components/ui/FadeUp'

const PHOTOS = [
  { src: '/images/gallery-preview-1.png', alt: 'LSCE event' },
  { src: '/images/gallery-preview-2.png', alt: 'LSCE event' },
  { src: '/images/gallery-preview-3.png', alt: 'LSCE event' },
  { src: '/images/gallery-preview-4.png', alt: 'LSCE event' },
  { src: '/images/gallery-preview-5.jpg', alt: 'LSCE event' },
]

export default function GalleryPreview() {
  return (
    <section className="hidden md:block bg-[#F7F5F2] py-[120px]">
      <div className="section-container flex flex-col gap-10 items-center">

        {/* Heading */}
        <FadeUp>
          <div className="flex flex-col gap-3 items-center text-center max-w-[620px]">
            <h2 className="font-display text-[26px] text-[#1A1A1A] leading-[1.2] font-[500]">
              We Set the Bar. Now We{' '}
              <span className="text-[#FF2035]">Break It</span>.
            </h2>
            <p className="font-sans text-[15px] text-[#1A1A1A]/70 leading-[1.4]">
              Real connections. Crazy energy. Actual hires. Last year shifted the
              culture for Lagos talent—this year, we&apos;re leveling up. You ready?
            </p>
          </div>
        </FadeUp>

        {/* Photo grid */}
        <div className="flex flex-col gap-4 w-full">
          {/* Row 1: wide landscape + square */}
          <div className="flex gap-4">
            <div className="relative flex-1 h-[280px] rounded-[12px] overflow-hidden bg-[#2a2a2a]">
              <Image
                src={PHOTOS[0].src}
                alt={PHOTOS[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 70vw"
              />
            </div>
            <div className="relative w-[300px] h-[280px] shrink-0 rounded-[12px] overflow-hidden bg-[#2a2a2a]">
              <Image
                src={PHOTOS[1].src}
                alt={PHOTOS[1].alt}
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
          </div>

          {/* Row 2: portrait + two squares + LSCE brand box */}
          <div className="flex gap-4 items-center">
            <div className="relative w-[50%] shrink-0 h-[280px] rounded-[12px] overflow-hidden bg-[#2a2a2a]">
              <Image
                src={PHOTOS[2].src}
                alt={PHOTOS[2].alt}
                fill
                className="object-cover"
                sizes="38vw"
              />
            </div>
            <div className="relative w-[50%] shrink-0 h-[280px] rounded-[12px] overflow-hidden bg-[#F7F5F2]">
              <Image
                src={PHOTOS[3].src}
                alt={PHOTOS[3].alt}
                fill
                className="object-cover"
                sizes="38vw"
              />
            </div>
            {/* <div className="relative flex-1 h-[280px] rounded-[12px] overflow-hidden bg-[#2a2a2a]">
              <Image
                src={PHOTOS[3].src}
                alt={PHOTOS[3].alt}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </div>
            <div className="shrink-0 w-[200px] h-[130px] bg-[#FF2035] rounded-[12px] flex items-center justify-center">
              <Image
                src="/images/lsce-logo.png"
                alt="LSCE"
                width={140}
                height={32}
                className="w-[140px] h-auto object-contain brightness-0 invert"
              />
            </div>
            <div className="relative flex-1 h-[280px] rounded-[12px] overflow-hidden bg-[#2a2a2a]">
              <Image
                src={PHOTOS[4].src}
                alt={PHOTOS[4].alt}
                fill
                className="object-cover"
                sizes="25vw"
              />
            </div> */}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/gallery"
          className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
        >
          View our Gallery
          <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
        </Link>

      </div>
    </section>
  )
}
