import type { Metadata } from 'next'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#1A1A1A] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
