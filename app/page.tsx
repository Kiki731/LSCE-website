import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Tickets from '@/components/sections/Tickets'
import SpeakersPreview from '@/components/sections/SpeakersPreview'
import GalleryPreview from '@/components/sections/GalleryPreview'
import Sponsors from '@/components/sections/Sponsors'
import BrandsFueling from '@/components/sections/BrandsFueling'
import FAQ from '@/components/sections/FAQ'
import UniversityMarquee from '@/components/sections/UniversityMarquee'
import Newsletter from '@/components/sections/Newsletter'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Tickets />
        <SpeakersPreview />
        <GalleryPreview />
        <Sponsors />
        <BrandsFueling />
        <FAQ />
        <UniversityMarquee />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
