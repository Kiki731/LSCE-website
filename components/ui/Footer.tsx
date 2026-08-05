import Image from 'next/image'
import Link from 'next/link'

const QUICK_LINKS = [
  { label: 'Register', href: '/tickets' },
  { label: 'Exhibit', href: 'mailto:lagosstudentcareerexpo@gmail.com' },
  { label: 'Sponsor', href: 'mailto:lagosstudentcareerexpo@gmail.com' },
  { label: 'Ambassador', href: '/ambassadors' },
]

const SOCIAL_LINKS = [
  { label: 'X/Twitter', href: 'https://twitter.com/lscelagos' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/lsce' },
  { label: 'Instagram', href: 'https://instagram.com/lscelagos' },
  { label: 'Youtube', href: 'https://youtube.com/@lscelagos' },
]

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] overflow-hidden relative">
      <div className="section-container py-12 md:py-16 relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 md:gap-16">
          {/* Left — brand + about */}
          <div className="flex flex-col gap-5 md:gap-6 max-w-[520px]">
            <div className="flex flex-col gap-4 md:gap-6">
              <Link href="/">
                <Image
                  src="/images/lsce-logo.png"
                  alt="Lagos Students Career Expo"
                  width={184}
                  height={42}
                  className="h-[32px] md:h-[42px] w-auto object-contain"
                />
              </Link>
              <p className="font-sans text-[13px] md:text-[16px] leading-[1.4] text-white/80 md:text-white capitalize">
                The Lagos Student Career Expo is the largest student-organized
                career exposition, aimed at bridging the gap between students
                and career opportunities.
              </p>
            </div>
            <p className="font-sans text-[12px] md:text-[16px] leading-[1.2] text-white/60 md:text-white capitalize">
              © 2026 Lagos Students Career Expo. All rights reserved.
            </p>
          </div>

          {/* Right — links */}
          <div className="flex items-start gap-10 md:gap-16 pt-0 md:pt-15 shrink-0">
            {/* Quick Links */}
            <div className="flex flex-col gap-4 md:gap-6">
              <p className="font-sans font-medium text-[15px] md:text-[20px] leading-[1.2] text-white capitalize">
                Quick Links
              </p>
              <div className="flex flex-col gap-3 md:gap-5">
                {QUICK_LINKS.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="font-sans text-[13px] md:text-[16px] leading-[1.2] text-white/80 md:text-white capitalize hover:text-[#FF2035] transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Follow Us */}
            <div className="flex flex-col gap-4 md:gap-6">
              <p className="font-sans font-medium text-[15px] md:text-[20px] leading-[1.2] text-white capitalize">
                Follow us
              </p>
              <div className="flex flex-col gap-3 md:gap-5">
                {SOCIAL_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[13px] md:text-[16px] leading-[1.2] text-white/80 md:text-white capitalize hover:text-[#FF2035] transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LSCE 3.0 watermark — bottom of footer */}
      <div className="w-full overflow-hidden px-4 md:px-10">
        <Image
          src="/images/lsce-30-watermark.png"
          alt="LSCE 3.0"
          width={1300}
          height={179}
          className="w-full object-cover opacity-80"
        />
      </div>
    </footer>
  )
}
