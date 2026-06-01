import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FadeUp from '@/components/ui/FadeUp'
import SpeakerCard from '@/components/ui/SpeakerCard'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Speaker } from '@/lib/types'

/* ── Placeholder data (used until DB is populated) ── */
const PLACEHOLDER_KEYNOTE: Partial<Speaker>[] = [
  {
    id: 'k1',
    name: 'Speaker TBA',
    role: 'CEO · Company',
    image_url: '/images/speaker-placeholder-1.jpg',
    category: 'keynote',
    bio: null,
  },
  {
    id: 'k2',
    name: 'Speaker TBA',
    role: 'Founder · Company',
    image_url: '/images/about-person.jpg',
    category: 'keynote',
    bio: 'The driving force reshaping career opportunities for the next generation of African talent. Bringing unmatched insight on leadership, building products that matter, and navigating the Lagos ecosystem.',
  },
  {
    id: 'k3',
    name: 'Speaker TBA',
    role: 'Director · Company',
    image_url: '/images/speaker-placeholder-2.jpg',
    category: 'keynote',
    bio: null,
  },
]

const PLACEHOLDER_GENERAL: Partial<Speaker>[] = [
  { id: 'g1', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/speaker-placeholder-1.jpg', category: 'general', bio: null },
  { id: 'g2', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/about-person.jpg',           category: 'general', bio: null },
  { id: 'g3', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/speaker-placeholder-2.jpg', category: 'general', bio: null },
  { id: 'g4', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/about-person.jpg',           category: 'general', bio: null },
  { id: 'g5', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/speaker-placeholder-1.jpg', category: 'general', bio: null },
  { id: 'g6', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/speaker-placeholder-2.jpg', category: 'general', bio: null },
]

/* ── Data fetching ── */
async function getSpeakersByCategory(): Promise<{
  keynote: Partial<Speaker>[]
  general: Partial<Speaker>[]
}> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('speakers')
      .select('id, name, role, bio, image_url, linkedin_url, twitter_url, category')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })

    const rows = data as Partial<Speaker>[] | null
    if (rows && rows.length > 0) {
      return {
        keynote: rows.filter((s) => s.category === 'keynote'),
        general: rows.filter((s) => s.category === 'general'),
      }
    }
  } catch {
    /* Supabase not configured — fall through to placeholders */
  }
  return { keynote: PLACEHOLDER_KEYNOTE, general: PLACEHOLDER_GENERAL }
}

/* ── Category section divider ── */
function CategoryDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 md:gap-8 w-full">
      <p className="font-display text-[18px] md:text-[20px] text-[#1A1A1A] font-[500] leading-[1.2] whitespace-nowrap shrink-0">
        {label}
      </p>
      <div className="flex-1 h-px bg-[#1A1A1A]/20" />
      <Link
        href="mailto:lsce@example.com"
        className="flex items-center gap-2 shrink-0 group"
      >
        <Image src="/icons/Button Star red.svg" alt="" width={14} height={14} className="size-.5" />
        <span className="font-display text-[15px] md:text-[18px] text-[#1A1A1A] font-[500] leading-[1.2] group-hover:text-[#FF2035] transition-colors whitespace-nowrap">
          Apply to speak
        </span>
      </Link>
    </div>
  )
}

/* ── Page ── */
export default async function SpeakersPage() {
  const { keynote, general } = await getSpeakersByCategory()

  return (
    <>
      <Navbar />

      <main className="bg-[#F7F5F2] min-h-screen overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="relative pt-[140px] pb-[80px] md:pt-[200px] md:pb-[140px]">

          {/* Decorative blurred star — top right edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-10 right-[-130px] md:right-[-120px] opacity-100 blur-[0px]"
            style={{ width: 600, height: 600 }}
          >
            <Image src="/icons/Star 4 top right.png" alt="" fill className="object-contain" />
          </div>

          {/* Decorative blurred star — mid left edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[280px] left-[-180px] md:left-[-180px] opacity-100 blur-[0px]"
            style={{ width: 600, height: 600 }}
          >
            <Image src="/icons/Star Mid left.png" alt="" fill className="object-contain" />
          </div>

          <div className="relative z-10 section-container flex flex-col items-center gap-6 text-center">
            <FadeUp>
              <div className="flex flex-col items-center gap-4">
                <h1 className="font-display font-[500] leading-[1.15] text-[#1A1A1A] text-[36px] md:text-[52px] lg:text-[64px]">
                  <span className="text-[#FF2035]">Meet</span>
                  {' our Speakers '} <br />
                  <span className="inline-flex items-center gap-2 flex-wrap justify-center">
                    <span>2026</span>
                    <span className="inline-flex items-center justify-center p-2 align-middle shrink-0">
                      <Image
                        src="/images/LSCE badge.png"
                        alt="LSCE"
                        width={36}
                        height={36}
                        className="size-[36] md:size-[52px] brightness-100  object-contain"
                      />
                    </span>
                  </span>
                </h1>

                <p className="font-sans text-[15px] md:text-[17px] text-[#1A1A1A]/70 leading-[1.5] max-w-[780px]">
                  Real talk from the founders and creators shaping the culture. No corporate
                  fluff, just raw insights from the people redefining what&apos;s possible for
                  talent in this city. Bring your notepads.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={150}>
              <Link
                href="/tickets"
                className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
              >
                Get your Tickets
                <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
              </Link>
            </FadeUp>
          </div>
        </section>

        {/* ── Speaker grids ── */}
        <section className="section-container pb-[80px] md:pb-[120px] flex flex-col gap-12 md:gap-16">

          {/* Keynote */}
          {keynote.length > 0 && (
            <FadeUp className="flex flex-col gap-6 md:gap-8">
              <CategoryDivider label="Keynote Speakers" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-5 md:gap-6">
                {keynote.map((speaker) => (
                  <SpeakerCard key={speaker.id} speaker={speaker} className="w-full lg:w-[340px]" />
                ))}
              </div>
            </FadeUp>
          )}

          {/* General */}
          {general.length > 0 && (
            <FadeUp delay={100} className="flex flex-col gap-6 md:gap-8">
              <CategoryDivider label="Speakers" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-5 md:gap-6">
                {general.map((speaker) => (
                  <SpeakerCard key={speaker.id} speaker={speaker} className="w-full lg:w-[340px]" />
                ))}
              </div>
            </FadeUp>
          )}

        </section>
      </main>

      <Footer />
    </>
  )
}
