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
    tagline: 'Start here.',
    description:
      'Spark gets you into LSCE for the morning — the keynote, the Genius Arena, the Exhibition, and the conversations that set the tone for the day.',
    perks: [
      'Morning keynote access',
      'Genius Arena — watch pitches or step up yourself',
      'Exhibition floor & company booths',
      'Morning panel sessions',
      'Digital LSCE event guide',
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
    tagline: 'The full LSCE experience.',
    description:
      'Rise gives you the full day — six breakout tracks, lunch, the Grand Networking Hour, reserved access, and a shot at Emergence.',
    perks: [
      'Everything in The Spark, plus:',
      'Six curated breakout tracks',
      'Lunch included',
      'Grand Networking Hour access',
      'Reserved seating at all sessions',
      'Submit your CV for Emergence consideration',
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
    tagline: 'Earned. Not bought.',
    description:
      'A smaller room. Closer conversations. Direct access to the recruiters, founders and decision-makers you usually need an introduction to meet.',
    perks: [
      'Everything in The Rise, plus:',
      'Direct access to recruiters, founders & leaders',
      'Exclusive smaller-room sessions',
      'The introduction is part of the experience',
      'Selected from Rise CV submissions by LSCE',
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
