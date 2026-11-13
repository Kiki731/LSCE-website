/**
 * Single source of truth for event date and venue.
 *
 * These values were previously hardcoded across ~15 files, which is why a
 * superseded date kept surviving in places nobody thought to check. Import
 * from here rather than writing the date or venue as a literal.
 */
export const EVENT = {
  /** Full form — "Saturday, 17 April 2027" */
  date:        'Saturday, 17 April 2027',
  /** Without weekday — "17 April 2027" */
  dateShort:   '17 April 2027',
  /** Tight form for badges and PDFs — "17 Apr 2027" */
  dateCompact: '17 Apr 2027',
  /** Machine readable, for JSON-LD and <time> */
  iso:         '2027-04-17',
  /** Venue is not yet confirmed; city only until it is */
  venue:       'Lagos, Nigeria',
  doorsOpen:   '9am',
} as const
