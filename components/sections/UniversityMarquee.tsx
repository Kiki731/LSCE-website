import Link from 'next/link'
import Image from 'next/image'
import FadeUp from '@/components/ui/FadeUp'
import AmbassadorMarquee from '@/components/ui/AmbassadorMarquee'

const UNIVERSITIES_BASE = [
  'University of Lagos',
  'Lasustech',
  'Caleb University',
  'Pan-Atlantic University',
  'Yaba College of Technology',
  'Lagos State University',
  'Adekunle Ajasin University',
  'Covenant University',
  'Babcock University',
  "Redeemer's University",
]

function buildMarqueeItems(base: string[]) {
  const half = base.flatMap(name => [name, '★'])
  return [...half, ...half]
}

const MARQUEE_ITEMS = buildMarqueeItems(UNIVERSITIES_BASE)

export default function UniversityMarquee() {
  return (
    <section className="bg-[#1A1A1A] pt-[80px] md:pt-[100px] pb-[100px] md:pb-[140px] overflow-hidden">
      <div className="section-container pb-20 md:pb-28">
        <FadeUp>
          <div className="flex flex-col items-center text-center">
            <h2 className="font-display font-[500] text-[24px] md:text-[32px] text-white leading-[1.15]">
              Building{' '}
              <span className="text-[#FF2035]">futures</span>
              {' '}across Lagos,
              <br className="hidden md:block" />
              {' '}one degree at a time.
            </h2>
          </div>
        </FadeUp>
      </div>

      <AmbassadorMarquee items={MARQUEE_ITEMS} />

      <div className="flex justify-center mt-14 md:mt-20">
        <Link
          href="/ambassadors"
          className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
        >
          Become an Ambassador
          <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
        </Link>
      </div>
    </section>
  )
}
