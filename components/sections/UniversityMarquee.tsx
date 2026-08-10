import FadeUp from '@/components/ui/FadeUp'

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

const ROW_ITEMS = buildMarqueeItems(UNIVERSITIES_BASE)

export default function UniversityMarquee() {
  return (
    <section className="bg-[#1A1A1A] py-[80px] md:py-[100px]">
      <div className="section-container mb-10 md:mb-12">
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

      {/* Row 1 — left scroll */}
      <div className="w-full overflow-hidden mb-3">
        <div
          style={{
            display: 'flex',
            gap: '32px',
            width: 'max-content',
            animation: 'marquee-left 32s linear infinite',
          }}
        >
          {ROW_ITEMS.map((item, i) => (
            <span key={i} className={
              item === '★'
                ? 'text-[#FF2035] text-[18px] shrink-0 self-center'
                : 'font-sans text-[15px] md:text-[17px] text-white/80 shrink-0 whitespace-nowrap'
            }>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 — right scroll */}
      <div className="w-full overflow-hidden mb-3">
        <div
          style={{
            display: 'flex',
            gap: '32px',
            width: 'max-content',
            animation: 'marquee-right 32s linear infinite',
          }}
        >
          {ROW_ITEMS.map((item, i) => (
            <span key={i} className={
              item === '★'
                ? 'text-[#FF2035] text-[18px] shrink-0 self-center'
                : 'font-sans text-[15px] md:text-[17px] text-white/80 shrink-0 whitespace-nowrap'
            }>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Row 3 — left scroll */}
      <div className="w-full overflow-hidden">
        <div
          style={{
            display: 'flex',
            gap: '32px',
            width: 'max-content',
            animation: 'marquee-left 36s linear infinite',
          }}
        >
          {ROW_ITEMS.map((item, i) => (
            <span key={i} className={
              item === '★'
                ? 'text-[#FF2035] text-[18px] shrink-0 self-center'
                : 'font-sans text-[15px] md:text-[17px] text-white/80 shrink-0 whitespace-nowrap'
            }>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
