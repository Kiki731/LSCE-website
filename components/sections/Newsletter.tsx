import Image from 'next/image'
import Link from 'next/link'
import FadeUp from '@/components/ui/FadeUp'

export default function Newsletter() {
  return (
    <section className="bg-[#F7F5F2] py-[120px]">
      <div className="section-container">
        <FadeUp>
          <div
            className="relative overflow-hidden rounded-[24px] px-6 py-12 md:px-16 md:py-20 flex items-center"
            style={{ background: '#440f15' }}
          >
            {/* Background photo with gradient fade */}
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="/images/news-bg.png"
                alt=""
                fill
                className="object-contain object-right opacity-40"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(98deg, #440f15 7%, rgba(68,15,21,0.6) 50%, rgba(68,15,21,0) 100%)',
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-6 max-w-[580px]">
              <div className="flex flex-col gap-3">
                <h2 className="font-display text-[26px] text-white leading-[1.2] font-[500]">
                  Be the{' '}
                  <span className="text-[#FF2035]">First</span>{' '}
                  to Know.
                </h2>
                <p className="font-sans text-[15px] text-white/80 leading-[1.5]">
                  Get early access to ticket drops, major speaker announcements,
                  and exclusive career cheat codes sent straight to your inbox. No
                  spam, just the good stuff.
                </p>
              </div>
              <Link
                href="/tickets"
                className="inline-flex items-center gap-1.5 bg-white text-[#440f15] px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity w-fit font-[500]"
              >
                Join our Waitlist
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
