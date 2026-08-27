'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface AttendeeData {
  id:          string
  email:       string
  name:        string | null
  ticket_code: string
  cv_url:      string | null
  orders: {
    ticket_type: string
    buyer_name:  string
  }
}

type State = 'loading' | 'ready' | 'uploading' | 'success' | 'not_found' | 'wrong_tier'

export default function CVUploadForm({ code }: { code: string }) {
  const [state, setstate]       = useState<State>('loading')
  const [attendee, setAttendee] = useState<AttendeeData | null>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError]       = useState('')
  const inputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/tickets/upload-cv?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error === 'not_found' || !data.attendee) { setstate('not_found'); return }
        if (data.error === 'wrong_tier')                  { setstate('wrong_tier'); return }
        setAttendee(data.attendee)
        setstate('ready')
      })
      .catch(() => setstate('not_found'))
  }, [code])

  function handleFileChange(f: File | null) {
    if (!f) return
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(f.type)) {
      setError('Only PDF or Word documents (.pdf, .doc, .docx) are accepted.')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.')
      return
    }
    setError('')
    setFile(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFileChange(e.dataTransfer.files[0] ?? null)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setstate('uploading')
    setError('')

    const body = new FormData()
    body.append('code', code)
    body.append('file', file)

    const res  = await fetch('/api/tickets/upload-cv', { method: 'POST', body })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Upload failed. Please try again.')
      setstate('ready')
      return
    }

    setstate('success')
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#FF2035] border-t-transparent animate-spin" />
        <p className="font-sans text-[14px] text-[#1A1A1A]/50">Looking up your ticket…</p>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (state === 'not_found') {
    return (
      <div className="w-full max-w-[440px] text-center flex flex-col items-center gap-5 py-12">
        <div className="w-14 h-14 rounded-full bg-[#FF2035]/10 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#FF2035" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display font-[500] text-[22px] text-[#1A1A1A]">Ticket not found</h1>
          <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2 leading-[1.6]">
            The code <code className="font-mono bg-[#1A1A1A]/8 px-1.5 py-0.5 rounded text-sm">{code}</code> doesn&apos;t match any ticket.
            Check the link in your email and try again.
          </p>
        </div>
        <Link href="mailto:lagosstudentcareerexpo@gmail.com" className="font-sans text-[13px] text-[#FF2035] hover:underline">
          Contact support →
        </Link>
      </div>
    )
  }

  // ── Wrong tier ───────────────────────────────────────────────────────────────
  if (state === 'wrong_tier') {
    return (
      <div className="w-full max-w-[440px] text-center flex flex-col items-center gap-5 py-12">
        <div className="w-14 h-14 rounded-full bg-[#1A1A1A]/5 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display font-[500] text-[22px] text-[#1A1A1A]">CV upload not available</h1>
          <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2 leading-[1.6]">
            CV submission is only available for <strong>The Rise</strong> ticket holders. Your ticket does not include this feature.
          </p>
        </div>
        <Link href="/" className="font-sans text-[13px] text-[#FF2035] hover:underline">Back to thelscexpo.com →</Link>
      </div>
    )
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (state === 'success') {
    return (
      <div className="w-full max-w-[480px] flex flex-col items-center gap-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full"
          style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 14L11 20L23 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display font-[500] text-[28px] md:text-[36px] text-[#1A1A1A] leading-[1.2]">
            CV uploaded! 🎉
          </h1>
          <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2 leading-[1.6]">
            Your CV has been submitted successfully. Employers at LSCE 2026 will be able to view your profile.
          </p>
        </div>
        <div className="w-full bg-white border border-[#E5E5E5] rounded-[16px] p-5 text-left flex items-center gap-4">
          <div className="w-10 h-10 rounded-[8px] bg-[#FF2035]/10 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="1" width="11" height="15" rx="1.5" stroke="#FF2035" strokeWidth="1.4"/>
              <path d="M12 1v4h4" stroke="#FF2035" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M5 8h6M5 11h4" stroke="#FF2035" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="font-sans text-[11px] text-[#1A1A1A]/40 uppercase tracking-wider mb-0.5">File uploaded</p>
            <p className="font-sans text-[14px] text-[#1A1A1A] font-semibold">{file?.name}</p>
          </div>
        </div>
        <Link href="/"
          className="inline-flex items-center gap-1.5 bg-[#FF2035] text-white px-6 py-3 rounded-[24px] font-sans text-[14px] leading-none hover:opacity-90 transition-opacity">
          Visit thelscexpo.com →
        </Link>
      </div>
    )
  }

  // ── Upload form ──────────────────────────────────────────────────────────────
  const alreadyUploaded = !!attendee?.cv_url

  return (
    <div className="w-full max-w-[480px] flex flex-col gap-6">

      {/* Header */}
      <div className="text-center flex flex-col gap-3">
        <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto"
          style={{ background: 'linear-gradient(135deg, #FF2035 0%, #CC001A 100%)' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 18V8m0-4l-5 5m5-5l5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 22h18" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="font-sans text-[13px] text-[#FF2035] font-semibold uppercase tracking-wider mb-1">
            The Rise — CV Submission
          </p>
          <h1 className="font-display font-[500] text-[26px] md:text-[32px] text-[#1A1A1A] leading-[1.2]">
            Upload Your CV
          </h1>
          <p className="font-sans text-[14px] text-[#1A1A1A]/55 mt-2 leading-[1.6]">
            Submit your CV so employers can discover your profile at LSCE 2026.
          </p>
        </div>
      </div>

      {/* Ticket strip */}
      <div className="bg-white border border-[#E5E5E5] rounded-[14px] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] font-sans text-[12px] font-semibold"
            style={{ background: '#A8A9AD22', color: '#A8A9AD' }}>
            The Rise
          </span>
          <div>
            <p className="font-sans text-[12px] text-[#1A1A1A]/60">{attendee?.name ?? attendee?.email}</p>
            <p className="font-sans text-[11px] text-[#1A1A1A]/30">LSCE 2026 · Nov 28th</p>
          </div>
        </div>
        <code className="font-mono text-[12px] text-[#1A1A1A]/40 tracking-wider">{code}</code>
      </div>

      {/* Already uploaded notice */}
      {alreadyUploaded && (
        <div className="bg-green-50 border border-green-200 rounded-[10px] px-4 py-3 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l4 4 6-6" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="font-sans text-[13px] text-green-800">CV already submitted. You can replace it below.</p>
        </div>
      )}

      {/* Upload form */}
      <form onSubmit={handleUpload} className="bg-white border border-[#E5E5E5] rounded-[16px] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <p className="font-display font-[500] text-[14px] text-[#1A1A1A]">Your CV</p>
          <p className="font-sans text-[11px] text-[#1A1A1A]/40 mt-0.5">PDF or Word document · max 5MB</p>
        </div>

        <div className="p-5 flex flex-col gap-4">

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-[12px] p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors select-none"
            style={{
              borderColor: dragging ? '#FF2035' : file ? '#1A1A1A40' : '#E5E5E5',
              background:  dragging ? '#FFF5F5' : file ? '#F7F5F2' : 'white',
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
            />

            {file ? (
              <>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="2" width="18" height="24" rx="2" stroke="#1A1A1A" strokeWidth="1.5"/>
                  <path d="M18 2v6h6" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 14h10M9 18h7" stroke="#1A1A1A" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <p className="font-sans text-[13px] text-[#1A1A1A] font-semibold text-center break-all px-2">{file.name}</p>
                <p className="font-sans text-[11px] text-[#1A1A1A]/40">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </>
            ) : (
              <>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 22V10m0 0l-5 5m5-5l5 5" stroke="#1A1A1A50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 26h22" stroke="#1A1A1A30" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="font-sans text-[13px] text-[#1A1A1A]/60 text-center">
                  <span className="font-semibold text-[#1A1A1A]">Click to upload</span> or drag and drop
                </p>
                <p className="font-sans text-[11px] text-[#1A1A1A]/40">PDF, DOC, DOCX — up to 5MB</p>
              </>
            )}
          </div>

          {error && (
            <p className="font-sans text-[12px] text-[#FF2035] bg-[#FFF5F5] border border-[#FFD5D5] rounded-[8px] px-3 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!file || state === 'uploading'}
            className="w-full py-3.5 rounded-[60px] font-sans text-[14px] font-semibold transition-all"
            style={{
              background: file && state !== 'uploading' ? '#FF2035' : '#E5E5E5',
              color:      file && state !== 'uploading' ? 'white'   : '#999',
              cursor:     file && state !== 'uploading' ? 'pointer' : 'not-allowed',
            }}
          >
            {state === 'uploading' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Uploading…
              </span>
            ) : alreadyUploaded ? 'Replace CV →' : 'Upload CV →'}
          </button>

        </div>
      </form>

    </div>
  )
}
