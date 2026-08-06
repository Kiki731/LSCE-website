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
    name: 'The Spark',
    price: 4000,
    priceKobo: 400000,
    tagline: 'Your gateway to LSCE 2026',
    description:
      'The essential pass to get you into the room. Perfect for students looking to explore opportunities and expand their network.',
    perks: [
      'Entry to all general panel discussions',
      'Digital LSCE event guide and floor map',
      'Standard networking lounge access',
      'Access to the main expo floor and company booths',
    ],
    badge: 'bronze',
    accentColor: '#00CF01',
    bgColor: '#BAFFBA',
  },
  silver: {
    id: 'silver',
    name: 'The Rise',
    price: 8000,
    priceKobo: 800000,
    tagline: 'Built for the serious career builder',
    description:
      'Level up your expo experience with hands-on career prep, priority access, and exclusive workshops.',
    perks: [
      'Everything in The Spark, plus:',
      'Guaranteed spot in the CV Review Clinic',
      'Priority seating at all general panel sessions',
      'Access to 2 specialized skill masterclasses',
      'Official LSCE tote bag and basic swag',
    ],
    badge: 'silver',
    accentColor: '#FFBD4D',
    bgColor: '#FDF0D9',
  },
  gold: {
    id: 'gold',
    name: 'The Emergence',
    price: 0,
    priceKobo: 0,
    tagline: 'The full LSCE experience — strictly by invite',
    description:
      'Level up your expo experience with hands-on career prep, priority access, and exclusive workshops.',
    perks: [
      'Everything in The Rise, plus:',
      '1-on-1 Mock Interview session with an HR expert',
      'Invite to the exclusive VIP networking lunch with recruiters',
      'Fast-track priority check-in at the venue',
      'Premium LSCE swag box (T-shirt, notebook, and sponsor gifts)',
    ],
    badge: 'gold',
    accentColor: '#F11429',
    bgColor: '#FFE3E6',
  },
}

export const TICKET_LIST = Object.values(TICKET_TYPES)

// ── Discount codes are intentionally NOT defined here ──────────────────────────
// They live in .env.local as DISCOUNT_CODES=CODE1:PCT,CODE2:PCT
// and are validated server-side via POST /api/tickets/apply-coupon.
// Keeping them here would expose them in the client JS bundle.
