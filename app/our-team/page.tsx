import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FadeUp from '@/components/ui/FadeUp'
import TeamGrid from '@/components/ui/TeamGrid'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { TeamMember } from '@/lib/types'

/* ── Placeholder data (used until DB is populated) ── */
const PLACEHOLDER_MEMBERS: Partial<TeamMember>[] = [
  {
    id: 't1',
    name: 'Team Member TBA',
    role: 'Convener',
    image_url: '/images/Jonas.png',
    department: 'organizing',
    quote: null,
    linkedin_url: null,
    twitter_url: null,
  },
  {
    id: 't2',
    name: 'Team Member TBA',
    role: 'Project Manager',
    image_url: '/images/Chisom nwoku.png',
    department: 'organizing',
    quote: 'Life is short, eat more beans.',
    linkedin_url: null,
    twitter_url: null,
  },
  {
    id: 't3',
    name: 'Team Member TBA',
    role: 'Operations Lead',
    image_url: '/images/Destiny.png',
    department: 'organizing',
    quote: null,
    linkedin_url: null,
    twitter_url: null,
  },
  {
    id: 't4',
    name: 'Team Member TBA',
    role: 'Partnerships Lead',
    image_url: '/images/Jonas.png',
    department: 'partnerships',
    quote: null,
    linkedin_url: null,
    twitter_url: null,
  },
  {
    id: 't5',
    name: 'Team Member TBA',
    role: 'Creative Director',
    image_url: '/images/Destiny.png',
    department: 'design',
    quote: null,
    linkedin_url: null,
    twitter_url: null,
  },
  {
    id: 't6',
    name: 'Team Member TBA',
    role: 'Social Media Lead',
    image_url: '/images/Chisom nwoku.png',
    department: 'social',
    quote: null,
    linkedin_url: null,
    twitter_url: null,
  },
  {
    id: 't7',
    name: 'Team Member TBA',
    role: 'Programs Lead',
    image_url: '/images/Jonas.png',
    department: 'programs',
    quote: null,
    linkedin_url: null,
    twitter_url: null,
  },
  {
    id: 't8',
    name: 'Team Member TBA',
    role: 'Brand Manager',
    image_url: '/images/Destiny.png',
    department: 'partnerships',
    quote: null,
    linkedin_url: null,
    twitter_url: null,
  },
  {
    id: 't9',
    name: 'Team Member TBA',
    role: 'UI/UX Designer',
    image_url: '/images/Chisom nwoku.png',
    department: 'design',
    quote: null,
    linkedin_url: null,
    twitter_url: null,
  },
]

/* ── Data fetching ── */
async function getTeamMembers(): Promise<Partial<TeamMember>[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('team_members')
      .select('id, name, role, image_url, linkedin_url, twitter_url, quote, department')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })

    const rows = data as Partial<TeamMember>[] | null
    if (rows && rows.length > 0) return rows
  } catch {
    /* Supabase not configured — fall through to placeholders */
  }
  return PLACEHOLDER_MEMBERS
}

/* ── Page ── */
export default async function OurTeamPage() {
  const members = await getTeamMembers()

  return (
    <>
      <Navbar />

      <main className="bg-[#1A1A1A] min-h-screen overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">

          {/* Background image + dark overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-bg.jpg"
              alt=""
              fill
              className="object-cover object-center scale-105"
              style={{ filter: 'blur(2px)' }}
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.75) 0%, rgba(13,13,13,0.88) 50%, rgba(26,26,26,1) 100%)',
              }}
            />
          </div>

          {/* Decorative stars */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-10 right-[-130px] md:right-[-160px] z-[1]"
            style={{ width: 600, height: 600 }}
          >
            <Image src="/icons/Star 4 top right.png" alt="" fill className="object-contain" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute top-[280px] left-[-180px] z-[1]"
            style={{ width: 600, height: 600 }}
          >
            <Image src="/icons/Star Mid left.png" alt="" fill className="object-contain" />
          </div>

          {/* Floating polaroid — top right (desktop only) */}
          <div
            aria-hidden
            className="hidden min-[1028px]:block absolute top-[110px] right-[64px] z-[2] pointer-events-none"
            style={{ transform: 'rotate(-5.5deg)' }}
          >
            <div className="border border-dashed border-white/50 p-2.5 rounded-[14px]">
              <div className="relative w-[180px] h-[230px] rounded-[10px] overflow-hidden bg-white/10">
                <Image
                  src="/images/Mr chibuzor.png"
                  alt=""
                  fill
                  className="object-cover object-top mix-blend-luminosity"
                  sizes="180px"
                />
              </div>
            </div>
          </div>

          {/* Floating polaroid — bottom left (desktop only) */}
          <div
            aria-hidden
            className="hidden min-[1028px]:block absolute bottom-[160px] left-[60px] z-[2] pointer-events-none"
            style={{ transform: 'rotate(5.9deg)' }}
          >
            <div className="border border-dashed border-white/50 p-2.5 rounded-[14px]">
              <div className="relative w-[190px] h-[240px] rounded-[10px] overflow-hidden bg-white/10">
                <Image
                  src="/images/Miss_ladyyy.png"
                  alt=""
                  fill
                  className="object-cover object-top mix-blend-luminosity"
                  sizes="190px"
                />
              </div>
            </div>
          </div>

          {/* Hero content */}
          <div className="relative z-10 section-container pt-[160px] pb-[100px] md:pt-[220px] md:pb-[140px] flex flex-col items-center gap-6 text-center">
            <FadeUp>
              <div className="flex flex-col items-center gap-4">
                <h1 className="font-display font-[500] leading-[1.15] text-white text-[36px] md:text-[52px] lg:text-[64px]">
                  The{' '}
                  <span className="text-[#FF2035]">Engine</span>
                  {' '}Behind
                  <br className="hidden md:block" />
                  {' '}the Expo.{' '}
                  <span className="inline-flex items-center justify-center align-middle">
                    <span
                      className="inline-flex items-center justify-center rounded-[32px] shrink-0 ml-1 p-1.5">
                       <Image
                          src="/images/Frame 202.png"
                          alt="LSCE"
                          width={50}
                          height={50}
                          className="size-[40px] md:size-[60px] inline-block shrink-0"
                        />
                    </span>
                  </span>
                </h1>

                <p className="font-sans text-[15px] md:text-[17px] text-white/70 leading-[1.5] max-w-[680px]">
                  It takes a village to spark a cultural shift. Get to know the dedicated crew
                  pulling the strings, locking in the brands, and making sure this year is
                  nothing short of epic.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={150}>
              <Link
                href="/tickets"
                className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
              >
                Join the Movement
                <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
              </Link>
            </FadeUp>
          </div>

          {/* Hero bottom divider */}
          <div className="relative z-10 section-container flex items-center gap-4 md:gap-8 pb-10">
            <p className="font-display text-[16px] md:text-[20px] text-white font-[500] leading-[1.2] whitespace-nowrap shrink-0">
              Built by us, for us
            </p>
            <div className="flex-1 h-px bg-white/20" />
            <div className="flex items-center gap-2 shrink-0">
              <Image
                src="/icons/Button Star red.svg"
                alt=""
                width={14}
                height={14}
                className="size-[14px]"
              />
              <p className="font-display text-[16px] md:text-[20px] text-white font-[500] leading-[1.2] whitespace-nowrap">
                Meet the Collective
              </p>
            </div>
          </div>
        </section>

        {/* ── Team grid + filter ── */}
        <section className="pt-[40px] md:pt-[56px]">
          <TeamGrid members={members} />
        </section>

      </main>

      <Footer />
    </>
  )
}
