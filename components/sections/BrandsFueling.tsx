import Image from 'next/image'
import FadeUp from '@/components/ui/FadeUp'

const LOGOS = [
  { name: 'ALX', src: '/partners/alx.png', width: 108, height: 55 },
  { name: 'Education USA', src: '/partners/Education Usa.png', width: 165, height: 70 },
  { name: 'Utiva', src: '/partners/utiva.png', width: 120, height: 34 },
  { name: 'Enoverlab', src: '/partners/Enoverlab.png', width: 207, height: 36 },
  { name: 'AIESEC', src: '/partners/Aiesec.png', width: 200, height: 28 },
  { name: 'TFN', src: '/partners/TFN-Logo-1536x254 1.png', width: 231, height: 38 },
  { name: 'Marble Capital', src: '/partners/Marble-Capital-Limited-Logo-1-removebg-preview-1-e1752153108479 1.png', width: 139, height: 66 },
  { name: 'Work Nigeria', src: '/partners/Work Nigeria.png', width: 200, height: 36 },
  { name: 'Mariam Grey', src: '/partners/cropped-Mariam-Grey-Logo-01 2.png', width: 228, height: 55 },
  { name: 'GoNomad', src: '/partners/Gonomad.png', width: 200, height: 32 },
  { name: 'Niteon', src: '/partners/Niteon.png', width: 127, height: 111 },
  { name: 'TechCabal', src: '/partners/techcabal.png', width: 180, height: 40 },
  { name: 'Cowrywise', src: '/partners/cowrywise.png', width: 167, height: 31 },
  { name: 'Paystack', src: '/partners/paystack.png', width: 151, height: 27 },
  { name: 'Moniepoint', src: '/partners/moniepoint.png', width: 150, height: 37 },
]

export default function BrandsFueling() {
  return (
    /* relative + z-10 so this card sits on top of the FAQ dark background below */
    <section className="relative z-10 bg-[#F7F5F2] py-[80px] md:py-[120px] rounded-br-[60px] md:rounded-br-[120px] rounded-bl-[60px] md:rounded-bl-[120px]">
      <div className="section-container flex flex-col gap-14 items-center">

        {/* Heading */}
        <FadeUp>
          <div className="flex flex-col gap-3 items-center text-center max-w-[620px]">
            <h2 className="font-display text-[22px] md:text-[26px] text-[#1A1A1A] leading-[1.2] font-[500]">
              The Brands{' '}
              <span className="text-[#0cd56d]">Fueling</span>{' '}
              the Future.
            </h2>
            <p className="font-sans text-[15px] text-[#1A1A1A]/70 leading-[1.4]">
              Meet the industry heavyweights and forward-thinking brands powering
              the expo and hiring the next generation of Lagos talent.
            </p>
          </div>
        </FadeUp>

        {/* Logo grid */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-12 md:gap-x-10 md:gap-y-16 w-full">
          {LOGOS.map(({ name, src, width, height }) => (
            <div key={name} className="flex items-center justify-center shrink-0">
              <Image
                src={src}
                alt={name}
                width={width}
                height={height}
                className="object-contain opacity-80 hover:opacity-100 transition-opacity"
                style={{ maxHeight: '28px', width: 'auto' }}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
