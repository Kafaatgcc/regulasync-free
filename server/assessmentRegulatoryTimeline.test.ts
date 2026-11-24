import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import { describe, expect, it } from 'vitest';
import {
  REGULATORY_DEMO_NOTICE,
  calendarDateKey,
  createRegulatoryDemoCalendar,
  createRegulatoryDemoEvents,
  formatUtcDate,
  futureUtcDemoDate,
  getUtcDaysUntil,
  parseUtcDateOnly,
  toCalendarDate,
} from '../shared/regulatoryDemoDates';

const assessmentNow = new Date('2026-11-24T18:33:35.000Z');

describe('assessment regulatory demonstration schedule', () => {
  it('replaces stale fixtures with strictly future UTC dates on the assessment date', () => {
    const events = createRegulatoryDemoEvents(assessmentNow);
    expect(events.map(event => event.date)).toEqual([
      '2027-01-09', '2027-01-24', '2026-12-24', '2027-02-07',
      '2027-03-09', '2027-03-10', '2027-02-06', '2027-03-24',
    ]);
    expect(events.map(event => getUtcDaysUntil(event.date, assessmentNow))).toEqual([
      46, 61, 30, 75, 105, 106, 74, 120,
    ]);
    expect(events.every(event => (getUtcDaysUntil(event.date, assessmentNow) ?? 0) > 0)).toBe(true);
  });

  it('preserves original chronology, alert counts, and the in-progress task', () => {
    const events = createRegulatoryDemoEvents(assessmentNow);
    expect([...events].sort((a, b) => a.date.localeCompare(b.date)).map(event => event.id))
      .toEqual(['3', '1', '2', '7', '4', '5', '6', '8']);
    expect(events.filter(event => event.priority === 'critical')).toHaveLength(2);
    expect(events.filter(event => event.actionRequired)).toHaveLength(6);
    expect(events.filter(event => {
      const days = getUtcDaysUntil(event.date, assessmentNow);
      return days !== null && days > 0 && days <= 30;
    })).toHaveLength(1);
    expect(events.find(event => event.id === '3')?.status).toBe('in-progress');
    expect(events.filter(event => event.status === 'completed')).toHaveLength(0);
  });

  it('always generates future dates for later visits rather than hardcoding today', () => {
    for (const now of [new Date('2028-02-20T23:59:59Z'), new Date('2030-12-31T00:00:00Z')]) {
      const days = createRegulatoryDemoEvents(now).map(event => getUtcDaysUntil(event.date, now));
      expect(days).toEqual([46, 61, 30, 75, 105, 106, 74, 120]);
    }
  });

  it('marks every fixture synthetic and removes unverified official announcement language', () => {
    const events = createRegulatoryDemoEvents(assessmentNow);
    expect(events.every(event => event.dataKind === 'synthetic')).toBe(true);
    expect(events.every(event => event.description.startsWith('Illustrative'))).toBe(true);
    expect(REGULATORY_DEMO_NOTICE).toContain('not actual verified statutory deadlines');
    expect(JSON.stringify(events)).not.toMatch(/must be submitted to FCA|New FCA rules.*come into effect|Q1 AML/);
  });

  it('does not share mutable fixture arrays between visits', () => {
    const first = createRegulatoryDemoEvents(assessmentNow);
    first[0].affectedPolicies.push('Mutation');
    expect(createRegulatoryDemoEvents(assessmentNow)[0].affectedPolicies).not.toContain('Mutation');
  });
});

describe('UTC dates and invalid input handling', () => {
  it.each(['', 'not-a-date', '2026-02-30', '2026-13-01', '2026-00-10', '2026-1-01', '2026-11-24T00:00:00Z'])
  ('rejects invalid or non-date-only values: %s', value => {
    expect(parseUtcDateOnly(value)).toBeNull();
    expect(getUtcDaysUntil(value, assessmentNow)).toBeNull();
    expect(formatUtcDate(value)).toBe('Date unavailable');
    expect(toCalendarDate(value)).toBeUndefined();
  });

  it('validates leap days without rollover', () => {
    expect(parseUtcDateOnly('2028-02-29')?.toISOString()).toBe('2028-02-29T00:00:00.000Z');
    expect(parseUtcDateOnly('2026-02-29')).toBeNull();
    expect(futureUtcDemoDate(1, new Date('2028-02-28T23:59:59Z'))).toBe('2028-02-29');
    expect(futureUtcDemoDate(1, new Date('2028-02-29T00:00:00Z'))).toBe('2028-03-01');
  });

  it('keeps alert boundaries stable throughout a UTC day', () => {
    for (const now of [new Date('2026-11-24T00:00:00Z'), new Date('2026-11-24T23:59:59.999Z')]) {
      expect(getUtcDaysUntil('2026-11-23', now)).toBe(-1);
      expect(getUtcDaysUntil('2026-11-24', now)).toBe(0);
      expect(getUtcDaysUntil('2026-11-25', now)).toBe(1);
      expect(getUtcDaysUntil('2026-12-24', now)).toBe(30);
    }
  });

  it('uses the UTC date rather than the date in a timestamp’s timezone', () => {
    const sameInstant = [
      new Date('2026-11-24T23:30:00Z'),
      new Date('2026-11-25T13:30:00+14:00'),
      new Date('2026-11-24T11:30:00-12:00'),
    ];
    expect(sameInstant.map(now => futureUtcDemoDate(30, now))).toEqual([
      '2026-12-24', '2026-12-24', '2026-12-24',
    ]);
    expect(sameInstant.map(now => getUtcDaysUntil('2026-11-25', now))).toEqual([1, 1, 1]);
  });

  it('does not gain or lose a day across DST offset changes', () => {
    expect(getUtcDaysUntil('2027-03-29', new Date('2027-03-27T23:30:00+00:00'))).toBe(2);
    expect(getUtcDaysUntil('2027-03-29', new Date('2027-03-29T00:30:00+01:00'))).toBe(1);
    expect(getUtcDaysUntil('2027-10-31', new Date('2027-10-31T00:30:00+01:00'))).toBe(1);
  });

  it('formats dates and month headings in UTC even if a different timezone is requested', () => {
    expect(formatUtcDate('2027-01-01', { timeZone: 'America/Los_Angeles' })).toBe('1 January 2027');
    expect(formatUtcDate('2027-01-01', { day: undefined, month: 'long', year: 'numeric' })).toBe('January 2027');
  });

  it('round-trips the visible local calendar day, including midnight and DST dates', () => {
    for (const value of ['2026-12-24', '2027-03-28', '2027-10-31']) {
      const date = toCalendarDate(value)!;
      expect(calendarDateKey(date)).toBe(value);
      const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0);
      expect(calendarDateKey(midnight)).toBe(value);
    }
    expect(calendarDateKey(new Date(NaN))).toBeNull();
  });

  it('rejects invalid reference dates and unsupported offsets without returning NaN dates', () => {
    expect(getUtcDaysUntil('2026-12-24', new Date(NaN))).toBeNull();
    expect(() => createRegulatoryDemoEvents(new Date(NaN))).toThrow(RangeError);
    for (const offset of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
      expect(() => futureUtcDemoDate(offset, assessmentNow)).toThrow(RangeError);
    }
  });
});

describe('illustrative calendar export and page integration', () => {
  it('exports date-only targets, a nonzero event duration, and synthetic-data warnings', () => {
    const calendar = createRegulatoryDemoCalendar(createRegulatoryDemoEvents(assessmentNow));
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(8);
    expect(calendar).toContain('DTSTART;VALUE=DATE:20261224\r\nDTEND;VALUE=DATE:20261225');
    expect(calendar).toContain('SUMMARY:Illustrative:');
    expect(calendar).toContain('not actual verified statutory deadlines');
    expect(calendar).toContain('CATEGORIES:ILLUSTRATIVE DEMONSTRATION');
    expect(calendar).not.toContain('T00');
  });

  it('omits invalid exported dates and escapes user-visible text', () => {
    const events = createRegulatoryDemoEvents(assessmentNow);
    const invalid = { ...events[0], date: '2026-02-30' };
    expect(createRegulatoryDemoCalendar([invalid])).not.toContain('BEGIN:VEVENT');
    const calendar = createRegulatoryDemoCalendar([{ ...events[0], title: 'Sample, title; note\nNext line' }]);
    expect(calendar).toContain('SUMMARY:Illustrative: Sample\\, title\\; note\\nNext line');
  });

  it('parses the page and keeps schedule warnings and safe helpers wired into the UI', () => {
    const page = readFileSync(new URL('../client/src/pages/RegulatoryTimeline.tsx', import.meta.url), 'utf8');
    expect(() => transformSync(page, { loader: 'tsx', jsx: 'automatic' })).not.toThrow();
    expect(page).toContain('Illustrative demonstration schedule — synthetic data');
    expect(page).toContain('createRegulatoryDemoEvents(referenceDate)');
    expect(page).toContain('getUtcDaysUntil(date, referenceDate)');
    expect(page).toContain('daysUntil === null');
    expect(page).toContain('calendarDateKey(date)');
    expect(page).toContain('createRegulatoryDemoCalendar(filteredEvents)');
    // Recorded regulatory changes retain their original data; no shifting live dates.
    expect(page).toContain('trpc.changeTracker.timeline.useQuery()');
    expect(page).toContain('event.effectiveDate');
    expect(page).toContain('<LiveChangeTrackerSection />');
  });
});
