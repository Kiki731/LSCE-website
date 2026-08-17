'use client'

import { useState } from 'react'
import FadeUp from '@/components/ui/FadeUp'
import TeamCard from '@/components/ui/TeamCard'
import type { TeamMember } from '@/lib/types'

const DEPARTMENTS = [
  { key: 'all',          label: 'All' },
  { key: 'management',   label: 'Management' },
  { key: 'partnerships', label: 'Partnerships & Sponsorships' },
  { key: 'design',       label: 'Design' },
  { key: 'programs',     label: 'Programs' },
  { key: 'welfare',      label: 'Welfare' },
  { key: 'technical',    label: 'Technical' },
  { key: 'publicity',    label: 'Publicity and Campus Ambassadors' },
  { key: 'social_media', label: 'Social Media' },
  { key: 'community',    label: 'Community Management' },
] as const

type DeptKey = typeof DEPARTMENTS[number]['key']

export default function TeamGrid({ members }: { members: Partial<TeamMember>[] }) {
  const [active, setActive] = useState<DeptKey>('all')

  const filtered =
    active === 'all'
      ? members
      : members.filter((m) => m.department === active)

  return (
    <div className="section-container pb-[80px] md:pb-[120px] flex flex-col gap-8 md:gap-10">
      {/* ── Department filter pills ── */}
      <FadeUp>
        <div className="flex flex-wrap gap-3">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.key}
              onClick={() => setActive(dept.key)}
              className={`px-4 py-2 rounded-[60px] font-display text-[13px] md:text-[15px] font-[500] text-white leading-[1.2] transition-colors whitespace-nowrap ${
                active === dept.key
                  ? 'bg-[rgba(255,32,53,0.5)]'
                  : 'bg-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.25)]'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>
      </FadeUp>

      {/* ── Team cards grid ── */}
      <FadeUp delay={80}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-5 md:gap-6">
          {filtered.map((member) => (
            <TeamCard key={member.id} member={member} className="w-full lg:w-[340px]" />
          ))}
        </div>
      </FadeUp>
    </div>
  )
}
