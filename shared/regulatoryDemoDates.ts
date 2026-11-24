export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'regulatory' | 'internal' | 'deadline' | 'milestone';
  source: 'FCA' | 'PRA' | 'ICO' | 'BOE' | 'Internal';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  affectedPolicies: string[];
  actionRequired: boolean;
  dataKind: 'synthetic';
}

export const REGULATORY_DEMO_NOTICE =
  'Synthetic sample tasks and dates, generated relative to today’s UTC date. These are not actual verified statutory deadlines or published regulator milestones. Confirm applicable obligations and dates with official sources before use.';

const DAY_MS = 86_400_000;

/** Reject invalid and rolled-over dates rather than silently displaying an overdue alert. */
export function parseUtcDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? parsed
    : null;
}

export function getUtcDaysUntil(value: string, now: Date = new Date()): number | null {
  const target = parseUtcDateOnly(value);
  if (!target || !Number.isFinite(now.getTime())) return null;
  const today = parseUtcDateOnly(now.toISOString().slice(0, 10))!;
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

export function futureUtcDemoDate(daysAhead: number, now: Date = new Date()): string {
  if (!Number.isInteger(daysAhead) || daysAhead <= 0 || !Number.isFinite(now.getTime())) {
    throw new RangeError('Demo dates require a valid reference date and a positive whole-day offset.');
  }
  const anchor = parseUtcDateOnly(now.toISOString().slice(0, 10));
  if (!anchor) throw new RangeError('Demo reference date is outside the supported date range.');
  const target = new Date(anchor.getTime() + daysAhead * DAY_MS);
  if (!Number.isFinite(target.getTime())) throw new RangeError('Demo target date is outside the supported date range.');
  const date = target.toISOString().slice(0, 10);
  if (!parseUtcDateOnly(date)) throw new RangeError('Demo target date is outside the supported date range.');
  return date;
}

export function formatUtcDate(value: string, options: Intl.DateTimeFormatOptions = {}): string {
  const date = parseUtcDateOnly(value);
  return date
    ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', ...options, timeZone: 'UTC' })
    : 'Date unavailable';
}

/** DayPicker uses local calendar days; do not convert a clicked day through toISOString(). */
export function calendarDateKey(value: Date): string | null {
  if (!Number.isFinite(value.getTime())) return null;
  const key = `${String(value.getFullYear()).padStart(4, '0')}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  return parseUtcDateOnly(key) ? key : null;
}

export function toCalendarDate(value: string): Date | undefined {
  const date = parseUtcDateOnly(value);
  if (!date) return undefined;
  // Local noon keeps the same visible day in the calendar, including DST transitions.
  const localDate = new Date(0);
  localDate.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  localDate.setHours(12, 0, 0, 0);
  return calendarDateKey(localDate) === value ? localDate : undefined;
}

// These offsets preserve the original fixture order and spacing, not statutory dates.
// The first task is always 30 UTC days ahead; the last is 120 UTC days ahead.
const demoTemplates: (Omit<TimelineEvent, 'date' | 'dataKind'> & { daysAhead: number })[] = [
  {
    id: '1',
    title: 'Consumer Duty Board Report Preparation',
    description: 'Illustrative preparation task for a Consumer Duty board review, not an FCA submission requirement or verified deadline.',
    daysAhead: 46,
    type: 'deadline',
    source: 'FCA',
    priority: 'critical',
    status: 'upcoming',
    affectedPolicies: ['Consumer Duty Policy', 'Product Governance Framework', 'Vulnerable Customer Policy'],
    actionRequired: true,
  },
  {
    id: '2',
    title: 'Operational Resilience Self-Assessment Preparation',
    description: 'Illustrative self-assessment preparation task relating to operational resilience; the target date is synthetic.',
    daysAhead: 61,
    type: 'regulatory',
    source: 'PRA',
    priority: 'high',
    status: 'upcoming',
    affectedPolicies: ['Business Continuity Policy', 'IT Disaster Recovery Plan'],
    actionRequired: true,
  },
  {
    id: '3',
    title: 'Internal AML Risk Assessment',
    description: 'Illustrative internal anti-money laundering risk assessment and reporting task, not a verified quarterly obligation.',
    daysAhead: 30,
    type: 'internal',
    source: 'Internal',
    priority: 'high',
    status: 'in-progress',
    affectedPolicies: ['AML Policy', 'KYC Procedures', 'Transaction Monitoring Policy'],
    actionRequired: true,
  },
  {
    id: '4',
    title: 'Data Protection Impact Assessment Process Review',
    description: 'Illustrative review of DPIA processes and documentation, not an ICO-mandated annual deadline.',
    daysAhead: 75,
    type: 'regulatory',
    source: 'ICO',
    priority: 'medium',
    status: 'upcoming',
    affectedPolicies: ['Data Protection Policy', 'Privacy Notice', 'Data Retention Policy'],
    actionRequired: false,
  },
  {
    id: '5',
    title: 'Stress Testing Preparation',
    description: 'Illustrative preparation of stress testing materials, not a confirmed Bank of England submission or deadline.',
    daysAhead: 105,
    type: 'deadline',
    source: 'BOE',
    priority: 'high',
    status: 'upcoming',
    affectedPolicies: ['Capital Adequacy Policy', 'Liquidity Risk Policy'],
    actionRequired: true,
  },
  {
    id: '6',
    title: 'SM&CR Certification Review Preparation',
    description: 'Illustrative preparation for a firm’s certification review under SM&CR; the sample target date is not a verified statutory deadline.',
    daysAhead: 106,
    type: 'deadline',
    source: 'FCA',
    priority: 'critical',
    status: 'upcoming',
    affectedPolicies: ['SM&CR Policy', 'Fitness and Propriety Policy', 'Conduct Rules Policy'],
    actionRequired: true,
  },
  {
    id: '7',
    title: 'Internal Audit - Compliance Function Review',
    description: 'Illustrative internal audit of compliance function effectiveness on a synthetic planning date.',
    daysAhead: 74,
    type: 'internal',
    source: 'Internal',
    priority: 'medium',
    status: 'upcoming',
    affectedPolicies: ['Compliance Monitoring Plan', 'Internal Audit Charter'],
    actionRequired: false,
  },
  {
    id: '8',
    title: 'Financial Promotions Policy Review',
    description: 'Illustrative policy review task, not an announcement of new FCA rules or an official effective date.',
    daysAhead: 120,
    type: 'regulatory',
    source: 'FCA',
    priority: 'high',
    status: 'upcoming',
    affectedPolicies: ['Marketing Policy', 'Financial Promotions Approval Process'],
    actionRequired: true,
  },
];

export function createRegulatoryDemoEvents(now: Date = new Date()): TimelineEvent[] {
  return demoTemplates.map(({ daysAhead, ...event }) => ({
    ...event,
    affectedPolicies: [...event.affectedPolicies],
    date: futureUtcDemoDate(daysAhead, now),
    dataKind: 'synthetic',
  }));
}

/** Invalid dates are omitted; exported events retain the synthetic-data warning. */
export function createRegulatoryDemoCalendar(events: TimelineEvent[]): string {
  const escapeText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RegulaSync//Illustrative Regulatory Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:RegulaSync Illustrative Demonstration Schedule',
  ];
  for (const event of events) {
    const date = parseUtcDateOnly(event.date);
    if (!date) continue;
    const nextDay = futureUtcDemoDate(1, date).replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${event.date.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${nextDay}`,
      `SUMMARY:${escapeText(`Illustrative: ${event.title}`)}`,
      `DESCRIPTION:${escapeText(`${REGULATORY_DEMO_NOTICE}\n\n${event.description}\nTopic: ${event.source}\nPriority: ${event.priority}\nAffected Policies: ${event.affectedPolicies.join(', ')}`)}`,
      `UID:illustrative-${event.id}-${event.date}@regulasync.com`,
      'CATEGORIES:ILLUSTRATIVE DEMONSTRATION',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
