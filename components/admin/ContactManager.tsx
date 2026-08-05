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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Messages sent via the contact form</p>
        </div>
        {!loading && (
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            {total} {total === 1 ? 'message' : 'messages'}
          </span>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      ) : loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No messages yet.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Sender', 'Subject', 'Received', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.map(msg => (
                <>
                  <tr
                    key={msg.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{msg.name}</p>
                      <a
                        href={`mailto:${msg.email}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {msg.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[260px] truncate">{msg.subject}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-gray-400">
                        {expandedId === msg.id ? 'Hide ▲' : 'View ▼'}
                      </span>
                    </td>
                  </tr>

                  {expandedId === msg.id && (
                    <tr key={`${msg.id}-expanded`} className="bg-gray-50">
                      <td colSpan={4} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Message</p>
                            <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            onClick={e => e.stopPropagation()}
                            className="shrink-0 text-xs bg-[#1A1A1A] text-white px-3 py-2 rounded-lg hover:opacity-80 transition-opacity"
                          >
                            Reply via email →
                          </a>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
