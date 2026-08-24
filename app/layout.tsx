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
    'More Than a Job Fair. A Career Revolution. Join the largest student-organised expo in Lagos, October 3rd 2026.',
  keywords: ['LSCE', 'Lagos Students Career Expo', 'career', 'expo', 'Lagos', 'students', 'networking', '2026','tech expo', 'tech jobs', 'tech careers', 'tech companies', 'tech startups', 'tech events', 'tech conferences', 'tech workshops', 'tech seminars', 'tech training', 'tech education', 'tech development', 'tech innovation', 'tech research', 'tech startups', 'tech companies', 'tech jobs', 'tech careers', 'tech events', 'tech conferences', 'tech workshops', 'tech seminars', 'tech training', 'tech education', 'tech development', 'tech innovation', 'tech research'],

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
    description: 'More Than a Job Fair. A Career Revolution. October 3rd 2026, Lagos.',
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
    description: 'More Than a Job Fair. A Career Revolution. October 3rd 2026, Daystar Christian Centre, Ikeja, Lagos.',
    images:      ['/opengraph-image'],
  },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Lagos Students Career Expo',
      alternateName: 'LSCE',
      description: 'The largest student-organised career expo in Lagos. October 3rd 2026, Daystar Christian Centre, Ikeja.',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Event',
      '@id': `${SITE_URL}/#event`,
      name: 'Lagos Students Career Expo 3.0',
      alternateName: 'LSCE 3.0',
      description: 'More Than a Job Fair. A Career Revolution. Join the largest student-organised expo in Lagos.',
      startDate: '2026-10-03',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Daystar Christian Centre',
        address: { '@type': 'PostalAddress', addressLocality: 'Ikeja, Lagos', addressCountry: 'NG' },
      },
      organizer: { '@type': 'Organization', name: 'Lagos Students Career Expo', url: SITE_URL },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/tickets`,
        name: 'Get a Ticket',
        availability: 'https://schema.org/InStock',
        priceCurrency: 'NGN',
      },
      image: `${SITE_URL}/opengraph-image`,
      url: SITE_URL,
    },
    {
      '@type': 'ItemList',
      name: 'Quick Links',
      itemListElement: [
        {
          '@type': 'SiteLinksSearchBox',
        },
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Get a Ticket',
          description: 'Secure your spot at LSCE 3.0 — Lagos Students Career Expo, October 3rd 2026.',
          url: `${SITE_URL}/tickets`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Become a Sponsor',
          description: 'Partner with LSCE 3.0 and put your brand in front of thousands of ambitious students.',
          url: `${SITE_URL}/#sponsors`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Become a Campus Ambassador',
          description: 'Represent LSCE on your campus and earn exclusive perks.',
          url: `${SITE_URL}/ambassadors`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Contact Us',
          description: 'Reach out to the LSCE team for enquiries, partnerships, and media.',
          url: `${SITE_URL}/contact`,
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
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
        {/* Meta Pixel — inline so it lands in <head> on first HTML response */}
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','3592377590922340');
          fbq('track','PageView');
        `}} />
      </head>
      <body className="min-h-full flex flex-col bg-[#1A1A1A] text-white antialiased">
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=3592377590922340&ev=PageView&noscript=1"
          />
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
