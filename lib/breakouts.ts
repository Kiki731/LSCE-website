export interface Breakout {
  id: string
  title: string
  description: string
}

export const BREAKOUTS: Breakout[] = [
  {
    id: 'breaking-into-tech',
    title: 'Breaking Into Tech',
    description: 'Pathways from campus to your first tech role — software, product, design, and data.',
  },
  {
    id: 'finance-and-banking',
    title: 'Finance & Banking Masterclass',
    description: 'How top firms recruit, what they look for, and how to ace the assessment centre.',
  },
  {
    id: 'entrepreneurship',
    title: 'Building While You Study',
    description: 'Student founders share how they balance academics with building real businesses.',
  },
  {
    id: 'personal-branding',
    title: 'Personal Brand & LinkedIn',
    description: 'Stand out online before the expo floor even opens — craft a profile that gets noticed.',
  },
]

export const BREAKOUT_MAP = Object.fromEntries(BREAKOUTS.map(b => [b.id, b]))
