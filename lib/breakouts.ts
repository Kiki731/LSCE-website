export interface BreakoutOption {
  id: string
  title: string
  description: string
}

export const BREAKOUT_MAP: Record<string, BreakoutOption> = {
  'session-1': {
    id: 'session-1',
    title: 'Your Career, Your Brand, Your Future',
    description: 'Opening session for all Rise pass holders — sets the tone for the full day.',
  },
  'session-2a': {
    id: 'session-2a',
    title: 'AI, Jobs and the Human Advantage',
    description: 'Who will win in the future of work? Navigate the AI era with clarity on the skills that keep you indispensable.',
  },
  'session-2b': {
    id: 'session-2b',
    title: 'Beyond Content: Building Influence That Lasts',
    description: 'More than follower counts — build a brand that opens professional doors and creates lasting impact.',
  },
  'session-3a': {
    id: 'session-3a',
    title: "The Founder's Playbook",
    description: 'From idea to traction — frameworks and lessons from founders who built while studying.',
  },
  'session-3b': {
    id: 'session-3b',
    title: 'Mentorship Session',
    description: 'Small-group mentorship with professionals across technology, finance, business and consulting.',
  },
}
