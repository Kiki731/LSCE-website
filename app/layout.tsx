import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thelscexpo.com'
const GA_ID    = 'G-G20T1NGPXK'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'LSCE 3.0 | Lagos Students Career Expo 2026',
  description:
    'More Than a Job Fair. A Career Revolution. Join the largest student-organised expo in Lagos — October 3rd 2026, Landmark Event Centre.',
  keywords: ['LSCE', 'Lagos Students Career Expo', 'career', 'expo', 'Lagos', 'students', 'networking', '2026'],

  // ── Favicon / icons ──────────────────────────────────────────────────────────
  // app/icon.png and app/favicon.ico (both set to LSCE badge) are picked up
  // automatically by Next.js. The explicit declaration below ensures all
  // contexts — browser tabs, Google, Apple devices — use the LSCE logo.
  icons: {
    icon:     [{ url: '/images/LSCE badge.png', type: 'image/png' }],
    apple:    [{ url: '/images/LSCE badge.png', type: 'image/png' }],
    shortcut: [{ url: '/images/LSCE badge.png', type: 'image/png' }],
  },

  // ── Open Graph (link previews on WhatsApp, Twitter, Slack, iMessage…) ───────
  openGraph: {
    type:        'website',
    url:         SITE_URL,
    siteName:    'LSCE 2026',
    title:       'LSCE 3.0 | Lagos Students Career Expo 2026',
    description: 'More Than a Job Fair. A Career Revolution. October 3rd 2026, Landmark Event Centre, Lagos.',
    // OG image is auto-generated from app/opengraph-image.tsx (1200×630)
    images: [
      {
        url:    '/opengraph-image',   // Next.js serves this from opengraph-image.tsx
        width:  1200,
        height: 630,
        alt:    'LSCE 2026 — Lagos Students Career Expo',
      },
    ],
  },

  // ── Twitter / X card ─────────────────────────────────────────────────────────
  twitter: {
    card:        'summary_large_image',
    title:       'LSCE 3.0 | Lagos Students Career Expo 2026',
    description: 'More Than a Job Fair. A Career Revolution. October 3rd 2026, Landmark Event Centre, Lagos.',
    images:      ['/opengraph-image'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google Analytics — after-interactive so it never blocks render */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-[#1A1A1A] text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
