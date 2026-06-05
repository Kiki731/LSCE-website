import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'LSCE 3.0 — Lagos Students Career Expo',
  description:
    'Join the largest student-organized expo in Lagos. Connect with industry experts, build your network, and step off campus ready to lead.',
  keywords: ['LSCE', 'Lagos Students Career Expo', 'career', 'expo', 'Lagos', 'students', 'networking'],
  openGraph: {
    title: 'LSCE 3.0 — Lagos Students Career Expo',
    description:
      'Join the largest student-organized expo in Lagos. Connect with industry experts, build your network, and step off campus ready to lead.',
    type: 'website',
  },
}

const GA_ID = 'G-G20T1NGPXK'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google Analytics — loads after page is interactive, doesn't block render */}
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
      </body>
    </html>
  )
}
