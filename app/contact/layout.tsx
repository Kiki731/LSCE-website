import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | LSCE 3.0 — Lagos Students Career Expo',
  description: 'Get in touch with the LSCE team for event enquiries, sponsorships, media and partnerships. We\'d love to hear from you.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
