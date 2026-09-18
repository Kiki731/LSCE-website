'use client'

import { useState, useEffect } from 'react'

interface ReferralRow {
  id:               string
  code:             string
  ambassador_name:  string
  ambassador_email: string
  university:       string | null
  created_at:       string
  uses:             number
  sales:            number
  revenue:          number
}

type Tab = 'universities' | 'individuals'

function formatNaira(n: number) { return '₦' + n.toLocaleString('en-NG') }

function Table({ rows }: { rows: ReferralRow[] }) {
  const columns = rows[0]?.university !== undefined && rows.some(r => r.university)
    ? ['Campus', 'Ambassador', 'Email', 'Code', 'Uses', 'Revenue', 'Claimed']
    : ['Ambassador', 'Email', 'Code', 'Uses', 'Revenue', 'Claimed']

  const isUniversityTab = columns[0] === 'Campus'

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-white/6">
          {columns.map(h => (
            <th key={h} className="font-sans text-[11px] text-white/35 uppercase tracking-wider pb-3 pr-6">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
            {isUniversityTab && (
              <td className="py-3.5 pr-6">
                <p className="font-sans text-[13px] text-white">{row.university ?? '—'}</p>
              </td>
            )}
            <td className="py-3.5 pr-6">
              <p className="font-sans text-[13px] text-white">{row.ambassador_name}</p>
            </td>
            <td className="py-3.5 pr-6">
              <p className="font-sans text-[12px] text-white/50">{row.ambassador_email}</p>
            </td>
            <td className="py-3.5 pr-6">
              <span className="font-mono text-[12px] text-[#FF2035] bg-[#FF2035]/10 px-2.5 py-1 rounded-[6px]">
                {row.code}
              </span>
            </td>
            <td className="py-3.5 pr-6">
              <p className="font-sans text-[13px] text-white">{row.uses}</p>
            </td>
            <td className="py-3.5 pr-6">
              <p className="font-sans text-[13px] text-white">{formatNaira(row.revenue)}</p>
            </td>
            <td className="py-3.5 pr-6">
              <p className="font-sans text-[12px] text-white/40">
                {new Date(row.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function ReferralsPage() {
  const [rows, setRows]       = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<Tab>('universities')

  useEffect(() => {
    fetch('/api/admin/referrals')
      .then(r => r.json())
      .then(d => setRows(d.referrals ?? []))
      .finally(() => setLoading(false))
  }, [])

  const uniRows  = rows.filter(r => r.university != null)
  const indvRows = rows.filter(r => r.university == null)

  const activeRows = tab === 'universities' ? uniRows : indvRows

  const totalUses    = activeRows.reduce((s, r) => s + r.uses,    0)
  const totalRevenue = activeRows.reduce((s, r) => s + r.revenue, 0)

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/6 shrink-0">
        <h1 className="font-display font-[500] text-[18px] text-white">Ambassador Referrals</h1>
        <p className="font-sans text-[12px] text-white/35 mt-0.5">Codes claimed by approved ambassadors and their sales</p>
      </div>

      {/* Stats */}
      <div className="px-6 py-5 border-b border-white/6 grid grid-cols-3 gap-4 shrink-0">
        {[
          { label: 'Total codes', value: activeRows.length },
          { label: 'Total uses',  value: totalUses },
          { label: 'Revenue via referral', value: formatNaira(totalRevenue) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#161616] border border-white/6 rounded-[16px] p-5 flex flex-col gap-2">
            <p className="font-sans text-[11px] text-white/35 uppercase tracking-wider">{label}</p>
            <p className="font-display font-[500] text-[24px] text-white leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 pb-0 border-b border-white/6 flex items-center gap-2 shrink-0">
        {([
          { key: 'universities', label: `Universities (${uniRows.length})` },
          { key: 'individuals',  label: `Individuals (${indvRows.length})` },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2.5 font-sans text-[13px] font-semibold border-b-2 transition-colors -mb-px"
            style={{
              borderColor: tab === key ? '#FF2035' : 'transparent',
              color:       tab === key ? '#FF2035' : 'rgba(255,255,255,0.4)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 border-[#FF2035] border-t-transparent animate-spin" />
          </div>
        ) : activeRows.length === 0 ? (
          <p className="font-sans text-[13px] text-white/30 text-center mt-16">
            {tab === 'universities'
              ? 'No university codes yet. Ambassadors claim them from the campus ambassador section.'
              : 'No individual codes. These are legacy codes created before the university system.'}
          </p>
        ) : (
          <Table rows={activeRows} />
        )}
      </div>

    </div>
  )
}
