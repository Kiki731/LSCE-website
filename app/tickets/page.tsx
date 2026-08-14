import type { Metadata } from 'next'
import Image from 'next/image'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FadeUp from '@/components/ui/FadeUp'
import TicketCheckout from '@/components/ui/TicketCheckout'

export const metadata: Metadata = {
  title: 'Get a Ticket | LSCE 3.0 — Lagos Students Career Expo 2026',
  description: 'Secure your spot at LSCE 3.0 — Lagos Students Career Expo, October 3rd 2026 at Landmark Event Centre, Lagos. Bronze, Silver and Gold passes available.',
}

export default function TicketsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#F7F5F2] min-h-screen overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="relative pt-[110px] md:pt-[200px] pb-[40px] md:pb-[80px] overflow-hidden">

          {/* Decorative star — top right (desktop only) */}
          <div
            aria-hidden
            className="hidden md:block pointer-events-none absolute top-10 right-[-130px] md:right-[-180px]"
            style={{ width: 600, height: 600, zIndex: 0 }}
          >
            <Image src="/icons/Star 4 top right.png" alt="" fill className="object-contain" />
          </div>

          {/* Decorative star — mid left */}
          {/* <div
            aria-hidden
            className="pointer-events-none absolute top-[140px] left-[-180px]"
            style={{ width: 600, height: 600, zIndex: 0 }}
          >
            <Image src="/icons/Star Mid left.png" alt="" fill className="object-contain" />
          </div> */}

          <div className="relative z-10 section-container flex flex-col items-center gap-4 text-center max-w-[720px] mx-auto">
            <FadeUp>
              <h1 className="font-display font-[500] leading-[1.15] text-[#1A1A1A] text-[36px] md:text-[52px] lg:text-[64px]">
                Get your{' '}
                <span className="text-[#FF2035]">Tickets.</span>
                {' '}
                <span className="inline-flex items-center justify-center align-middle">
                  <span
                    className="inline-flex items-center justify-center rounded-[32px] shrink-0 ml-1 p-1.5"
                    style={{
                      background: 'linear-gradient(127deg, rgba(255,32,53,0.9) 0%, rgba(224,0,21,0.9) 100%)',
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
              <p className="font-sans text-[15px] md:text-[17px] text-[#1A1A1A]/70 leading-[1.5] max-w-[560px] mx-auto mt-4">
                LSCE 2026 is happening once. Pick your pass, lock in your spot, and show up ready.
              </p>
            </FadeUp>
          </div>

          {/* Step breadcrumb is rendered inside <TicketCheckout> so it reacts to step state */}
        </section>

        {/* ── Checkout ── */}
        <section className="section-container pb-[80px] md:pb-[120px]">
          <TicketCheckout />
        </section>

      </main>

      <Footer />
    </>
  )
}
