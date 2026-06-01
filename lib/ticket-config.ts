export type TicketTier = 'bronze' | 'silver' | 'gold'

export interface TicketType {
  id: TicketTier
  name: string
  price: number        // in Naira (display)
  priceKobo: number    // for Paystack (x100)
  tagline: string
  description: string
  perks: string[]
  badge: string
  accentColor: string
  bgColor: string
}

export const TICKET_TYPES: Record<TicketTier, TicketType> = {
  bronze: {
    id: 'bronze',
    name: 'Bronze Pass',
    price: 5000,
    priceKobo: 500000,
    tagline: 'Your gateway to LSCE 2026',
    description:
      'Full-day access to the expo floor, all general sessions, and open networking zones. The perfect starting point.',
    perks: [
      'Full expo floor access',
      'All general sessions',
      'Open networking access',
      'LSCE event lanyard',
    ],
    badge: 'bronze',
    accentColor: '#CD7F32',
    bgColor: '#FDF6EE',
  },
  silver: {
    id: 'silver',
    name: 'Silver Pass',
    price: 15000,
    priceKobo: 1500000,
    tagline: 'Built for the serious career builder',
    description:
      'Everything in Bronze, plus priority seating at keynotes, access to exclusive workshops, and meet & greet with speakers.',
    perks: [
      'Everything in Bronze',
      'Priority keynote seating',
      'Exclusive workshop access',
      'Speaker meet & greet',
      'LSCE branded kit',
    ],
    badge: 'silver',
    accentColor: '#A8A9AD',
    bgColor: '#F5F6F7',
  },
  gold: {
    id: 'gold',
    name: 'Gold Pass',
    price: 30000,
    priceKobo: 3000000,
    tagline: 'The full LSCE experience',
    description:
      'VIP treatment from start to finish. Front-row seats, exclusive speaker dinner, premium gift pack, and dedicated concierge at the event.',
    perks: [
      'Everything in Silver',
      'VIP lounge access',
      'Front-row reserved seating',
      'Exclusive speaker dinner',
      'Premium gift pack',
      'Dedicated event concierge',
    ],
    badge: 'gold',
    accentColor: '#D4AF37',
    bgColor: '#FDFBF0',
  },
}

export const TICKET_LIST = Object.values(TICKET_TYPES)

// ── Discount codes are intentionally NOT defined here ──────────────────────────
// They live in .env.local as DISCOUNT_CODES=CODE1:PCT,CODE2:PCT
// and are validated server-side via POST /api/tickets/apply-coupon.
// Keeping them here would expose them in the client JS bundle.
