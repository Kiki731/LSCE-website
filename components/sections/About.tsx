import Image from 'next/image'
import FadeUp from '@/components/ui/FadeUp'

const PILLARS = [
  {
    label: '🧠 Ignite Your Mindset',
    gradient: 'linear-gradient(104.17deg, rgb(12,213,109) 23.531%, rgb(6,111,57) 203.9%)',
  },
  {
    label: '⚡️ Build Your Skills',
    gradient: 'linear-gradient(109.12deg, rgb(228,76,0) 87.147%, rgb(126,42,0) 331.96%)',
  },
  {
    label: '🤝 Expand Your Network',
    gradient: 'linear-gradient(111.82deg, rgb(94,68,231) 81.804%, rgb(52,38,129) 356.76%)',
  },
]

export default function About() {
  return (
    <section className="bg-[#F7F5F2] py-[80px] md:py-[120px]">
      <div className="section-container flex flex-col gap-6">

        {/* Text + EMERGE theme photo */}
        <FadeUp className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10 w-full">
          <div className="flex flex-col gap-8 w-full lg:max-w-[460px] lg:shrink-0">
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-[24px] md:text-[34px] text-[#1A1A1A] leading-[1.15] font-[500]">
                More Than a{' '}
                <span className="text-[#FFBD4D]">Job Fair</span>.
                <br />
                A Career Revolution.
              </h2>
              <p className="font-sans text-[15px] text-[#1A1A1A]/70 leading-[1.5]">
                The Lagos Students Career Expo is the largest student-organized
                platform bridging the gap between talent and opportunity. We
                don&apos;t just connect you with top employers—we empower you
                with the mindset, skills, and network to take absolute ownership
                of your future.
              </p>
            </div>

            {/* Three Star Decoration icons */}
            <div className="flex items-center gap-3">
              {[0, 1, 2].map((i) => (
                <Image
                  key={i}
                  src="/icons/Star Decoration.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="size-[40px]"
                />
              ))}
            </div>
          </div>

          {/* EMERGE theme image */}
          <div className="hidden lg:block shrink-0 relative w-[520px] h-[387px] overflow-hidden rounded-[12px]">
            <Image
              src="/gallery/Emerge theme.png"
              alt="EMERGE 2026 theme"
              fill
              className="object-cover object-top"
            />
          </div>
        </FadeUp>

        {/* Pillars + event bar — constrained to match the text+image row above */}
        <div className="max-w-[1020px] w-full mx-auto flex flex-col gap-2">
        <FadeUp delay={100} className="flex flex-col md:flex-row gap-2 w-full">
          {PILLARS.map(({ label, gradient }) => (
            <div
              key={label}
              className="flex-1 flex items-center justify-center px-5 py-4"
              style={{ background: gradient }}
            >
              <span className="font-display text-[14px] md:text-[16px] text-white leading-[1.2] font-[500] text-center">
                {label}
              </span>
            </div>
          ))}
        </FadeUp>

        {/* Event info bar */}
        <FadeUp delay={200}>
          <div
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3 px-4 md:px-5 py-3 md:py-4 rounded-[10px] w-full"
            style={{ background: '#FF2035' }}
          >
            <span className="font-display text-[13px] md:text-[15px] text-white leading-[1.2] font-[500] whitespace-nowrap">
              Lagos, Nigeria
            </span>
            <Image
              src="/icons/Star Decoration.svg"
              alt="·"
              width={14}
              height={14}
              className="size-3.5"
            />
            <span className="font-display text-[13px] md:text-[15px] text-white leading-[1.2] font-[500] whitespace-nowrap">
              Daystar Christian Centre, Ikeja
            </span>
            <Image
              src="/icons/Star Decoration.svg"
              alt="·"
              width={14}
              height={14}
              className="size-3.5"
            />
            <span className="font-display text-[13px] md:text-[15px] text-white leading-[1.2] font-[500] whitespace-nowrap">
              November 28th, 2026
            </span>
          </div>
        </FadeUp>
        </div>

      </div>
    </section>
  )
}
