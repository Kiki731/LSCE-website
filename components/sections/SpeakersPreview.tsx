import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Speaker } from '@/lib/types'
import FadeUp from '@/components/ui/FadeUp'

/* Fallback cards when no speakers are in DB yet */
/* TODO: replace with self-animating marquee once real speakers are added */
const PLACEHOLDER_SPEAKERS: Partial<Speaker>[] = [
  { id: '1', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/speaker-placeholder-1.jpg', category: 'keynote' },
  { id: '2', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/about-person.jpg',           category: 'general' },
  { id: '3', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/speaker-placeholder-2.jpg', category: 'general' },
  { id: '4', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/speaker-placeholder-1.jpg', category: 'general' },
  { id: '5', name: 'Speaker TBA', role: 'Role · Company', image_url: '/images/about-person.jpg',           category: 'general' },
]

async function getSpeakers(): Promise<Partial<Speaker>[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('speakers')
      .select('id, name, role, image_url, category')
      .eq('is_visible', true)
      .order('display_order', { ascending: true })
      .limit(5)

    if (data && data.length > 0) return data
  } catch {
    /* Supabase not configured yet — use placeholders */
  }
  return PLACEHOLDER_SPEAKERS
}

export default async function SpeakersPreview() {
  const speakers = await getSpeakers()

  return (
    <section className="bg-[#1A1A1A] py-[120px]">
      <div className="section-container flex flex-col gap-[69px] items-center">
        {/* Heading */}
        <FadeUp>
          <div className="flex flex-col gap-3 items-center text-center max-w-[600px]">
            <h2 className="font-display text-[26px] text-white leading-[1.2] font-[500]">
              Learn From Those Who Did It{' '}
              <span className="text-[#0cd56d]">First.</span>
            </h2>
            <p className="font-sans text-[15px] text-white/80 leading-[1.4]">
              We&apos;ve curated a powerhouse roster of thought leaders, innovators,
              and disruptors. Get ready for insights and masterclasses that will
              completely shift your perspective.
            </p>
          </div>
        </FadeUp>

        {/* Speaker cards — horizontal scroll on mobile */}
        <div className="flex gap-6 overflow-x-auto pb-2 w-full scrollbar-hide">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="group bg-[#c8c8c8] flex flex-col overflow-hidden rounded-[16px] shrink-0 w-[260px] md:w-[340px]"
            >
              {/* Photo */}
              <div className="relative h-[240px] md:h-[320px] bg-[#e5e5e5] overflow-hidden">
                {speaker.image_url ? (
                  <Image
                    src={speaker.image_url}
                    alt={speaker.name ?? ''}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 280px, 408px"
                  />
                ) : (
                  <div className="w-full h-full bg-[#d0d0d0]" />
                )}
              </div>

              {/* Name plate */}
              <div className="flex flex-col items-center justify-center px-14 py-7 border-t-2 border-[#f7f5f2] bg-[#282828] group-hover:bg-[#2a2a2a] transition-colors duration-200">
                <p className="font-sans font-semibold text-[18px] text-white leading-[1.2] text-center w-full">
                  {speaker.name}
                </p>
                <p className="font-sans text-[13px] text-white leading-[1.2] text-center w-full opacity-80">
                  {speaker.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/speakers"
          className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-5 py-3 rounded-[24px] font-sans text-[15px] leading-none hover:opacity-90 transition-opacity"
        >
          See Full Lineup
          <Image src="/icons/Button star.svg" alt="" width={14} height={14} className="size-[14px]" />
        </Link>
      </div>
    </section>
  )
}
