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
    <section className="bg-[#1A1A1A] py-[120px]">
      <div className="section-container flex flex-col gap-6">

        {/* Text + person photo */}
        <FadeUp className="flex items-center justify-center gap-8 md:gap-10 w-full">
          <div className="flex flex-col gap-8 max-w-[460px] shrink-0">
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-[26px] text-white leading-[1.2] font-[500] max-w-[460px]">
                More Than a{' '}
                <span className="text-[#FF2035]">Job Fair</span>. A Career
                Revolution.
              </h2>
              <p className="font-sans text-[15px] text-white/80 leading-[1.5] max-w-[460px]">
                The Lagos Students Career Expo is the largest student-organized
                platform bridging the gap between talent and opportunity. We
                don&apos;t just connect you with top employers—we empower you
                with the mindset, skills, and network to take absolute ownership
                of your future.
              </p>
            </div>

            {/* Three Star Decoration icons */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <Image
                  key={i}
                  src="/icons/Star Decoration.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6"
                />
              ))}
            </div>
          </div>

          {/* Person photo */}
          <div className="hidden md:block shrink-0 relative w-[380px] h-[420px]">
            <Image
              src="/images/about-mask.png"
              alt="LSCE speaker"
              fill
              className="object-cover object-top"
            />
          </div>
        </FadeUp>

        {/* Pillars */}
        <FadeUp delay={100} className="flex flex-col md:flex-row gap-2 w-full max-w-[950px] mx-auto mt-6">
          {PILLARS.map(({ label, gradient }) => (
            <div
              key={label}
              className="flex-1 flex items-center justify-center px-5 py-3"
              style={{ background: gradient }}
            >
              <span className="font-display text-[14px] md:text-[15px] text-white leading-[1.2] font-[500] text-center whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </FadeUp>

        {/* Event info bar */}
        <FadeUp delay={200}>
          <div
            className="flex flex-wrap items-center justify-center gap-3 px-5 py-4 rounded-[10px] w-full max-w-[950px] mx-auto"
            style={{ background: 'rgba(255, 32, 53, 0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.02)' }}
          >
            <span className="font-display text-[14px] text-white leading-[1.2] font-[500] whitespace-nowrap">
              Lagos, Nigeria
            </span>
            <Image
              src="/icons/Star Decoration.svg"
              alt="·"
              width={16}
              height={16}
              className="size-4"
            />
            <span className="font-display text-[14px] text-white leading-[1.2] font-[500] whitespace-nowrap">
              Landmark Event Center
            </span>
            <Image
              src="/icons/Star Decoration.svg"
              alt="·"
              width={16}
              height={16}
              className="size-4"
            />
            <span className="font-display text-[14px] text-white leading-[1.2] font-[500] whitespace-nowrap">
              October 3rd, 2026
            </span>
          </div>
        </FadeUp>

      </div>
    </section>
  )
}
