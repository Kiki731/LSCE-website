'use client'

import { useEffect, useState, useCallback } from 'react'

interface Message {
  id:         string
  name:       string
  email:      string
  subject:    string
  message:    string
  created_at: string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      {[160, 200, 80, 40].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded-full bg-white/8 animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

export default function ContactManager() {
  const [messages, setMessages]     = useState<Message[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/admin/contact-messages')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load')
      setMessages(data.messages)
      setTotal(data.total)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-[500] text-white text-[22px] leading-none">Contact Messages</h1>
          <p className="font-sans text-[13px] text-white/40 mt-1">Messages sent via the contact form</p>
        </div>
        {!loading && (
          <div className="bg-white/4 border border-white/6 rounded-[10px] px-4 py-3 text-center">
            <p className="font-display font-[500] text-white text-[24px] leading-none">{total}</p>
            <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider mt-1">
              {total === 1 ? 'Message' : 'Messages'}
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      {error ? (
        <div className="bg-[#FF2035]/10 border border-[#FF2035]/20 text-[#FF2035] rounded-[10px] p-4 font-sans text-[13px]">
          {error}
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/6 rounded-[12px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/6">
              <tr>
                {['Sender', 'Subject', 'Received', ''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-sans text-[10px] text-white/35 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center font-sans text-[13px] text-white/25">
                    No messages yet.
                  </td>
                </tr>
              ) : (
                messages.map(msg => (
                  <>
                    <tr
                      key={msg.id}
                      className="border-b border-white/4 cursor-pointer transition-colors hover:bg-white/3"
                      onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                    >
                      <td className="px-5 py-4">
                        <p className="font-sans text-[13px] text-white font-semibold leading-none">{msg.name}</p>
                        <a
                          href={`mailto:${msg.email}`}
                          onClick={e => e.stopPropagation()}
                          className="font-sans text-[11px] text-white/40 hover:text-white/70 transition-colors"
                        >
                          {msg.email}
                        </a>
                      </td>
                      <td className="px-5 py-4 font-sans text-[13px] text-white/60 max-w-[260px] truncate">
                        {msg.subject}
                      </td>
                      <td className="px-5 py-4 font-sans text-[12px] text-white/35 whitespace-nowrap">
                        {fmtDate(msg.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-sans text-[11px] text-white/25">
                          {expandedId === msg.id ? '▲' : '▼'}
                        </span>
                      </td>
                    </tr>

                    {expandedId === msg.id && (
                      <tr key={`${msg.id}-expanded`}>
                        <td colSpan={4} className="px-5 py-5 bg-white/3 border-b border-white/4">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                              <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider mb-2">Message</p>
                              <p className="font-sans text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap">
                                {msg.message}
                              </p>
                            </div>
                            <a
                              href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                              onClick={e => e.stopPropagation()}
                              className="shrink-0 font-sans text-[12px] bg-white/8 hover:bg-white/12 text-white px-4 py-2.5 rounded-[8px] transition-colors whitespace-nowrap"
                            >
                              Reply via email →
                            </a>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
