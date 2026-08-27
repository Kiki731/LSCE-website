'use client'

import { useState, useEffect } from 'react'

interface ReferralRow {
  id:               string
  code:             string
  ambassador_name:  string
  ambassador_email: string
  created_at:       string
  sales:            number
  revenue:          number
}

function formatNaira(n: number) { return '₦' + n.toLocaleString('en-NG') }

export default function ReferralsPage() {
  const [rows, setRows]       = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/referrals')
      .then(r => r.json())
      .then(d => setRows(d.referrals ?? []))
      .finally(() => setLoading(false))
  }, [])

  const totalSales   = rows.reduce((s, r) => s + r.sales,   0)
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)

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
          { label: 'Total codes', value: rows.length },
          { label: 'Tickets via referral', value: totalSales },
          { label: 'Revenue via referral', value: formatNaira(totalRevenue) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#161616] border border-white/6 rounded-[16px] p-5 flex flex-col gap-2">
            <p className="font-sans text-[11px] text-white/35 uppercase tracking-wider">{label}</p>
            <p className="font-display font-[500] text-[24px] text-white leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 border-[#FF2035] border-t-transparent animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="font-sans text-[13px] text-white/30 text-center mt-16">No referral codes yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/6">
                {['Ambassador', 'Email', 'Code', 'Tickets Sold', 'Revenue', 'Claimed'].map(h => (
                  <th key={h} className="font-sans text-[11px] text-white/35 uppercase tracking-wider pb-3 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
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
                    <p className="font-sans text-[13px] text-white">{row.sales}</p>
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
        )}
      </div>

    </div>
  )
}
