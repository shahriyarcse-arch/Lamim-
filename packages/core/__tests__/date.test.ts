import { describe, expect, it } from 'vitest';
import {
  addDays,
  compareDateStr,
  DAY_BOUNDARY_HOUR,
  daysBetween,
  daysInMonth,
  isDateStr,
  julianDayNumber,
  localDateStr,
  parseDateStr,
  wakingDateStr,
  weekday,
} from '../src/date';

const DHAKA = 'Asia/Dhaka'; // UTC+6, no DST
const NY = 'America/New_York'; // DST

describe('parseDateStr / isDateStr', () => {
  it('parses valid ISO dates', () => {
    expect(parseDateStr('2026-11-21')).toEqual({ year: 2026, month: 11, day: 21 });
    expect(parseDateStr('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it.each([
    '2026-02-29', // not a leap year
    '1900-02-29', // century non-leap
    '2026-13-01',
    '2026-00-10',
    '2026-04-31',
    '2026-1-01',
    '2026-11-21T10:00',
    ' 2026-11-21',
    '',
    'not-a-date',
  ])('rejects %j', (value) => {
    expect(parseDateStr(value)).toBeNull();
    expect(isDateStr(value)).toBe(false);
  });

  it('accepts 2000-02-29 (400-year leap rule)', () => {
    expect(isDateStr('2000-02-29')).toBe(true);
  });

  it('isDateStr rejects non-strings', () => {
    expect(isDateStr(20261121)).toBe(false);
    expect(isDateStr(null)).toBe(false);
  });
});

describe('date arithmetic', () => {
  it('crosses month, year and leap-day boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-11-21', 0)).toBe('2026-11-21');
    expect(addDays('2026-11-21', -365)).toBe('2025-11-21');
  });

  it('is unaffected by DST transitions in the runtime zone', () => {
    // US DST starts 2026-03-08; calendar math must still be exactly one day.
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
    expect(daysBetween('2026-03-01', '2026-03-31')).toBe(30);
  });

  it('rejects non-integer offsets and invalid dates', () => {
    expect(() => addDays('2026-11-21', 1.5)).toThrow(RangeError);
    expect(() => addDays('2026-02-30', 1)).toThrow(RangeError);
  });

  it('daysBetween is signed', () => {
    expect(daysBetween('2026-11-21', '2026-11-01')).toBe(-20);
    expect(daysBetween('2024-01-01', '2025-01-01')).toBe(366);
  });

  it('compareDateStr sorts chronologically', () => {
    const dates = ['2026-11-21', '2025-12-31', '2026-01-01'];
    expect([...dates].sort(compareDateStr)).toEqual(['2025-12-31', '2026-01-01', '2026-11-21']);
    expect(compareDateStr('2026-01-01', '2026-01-01')).toBe(0);
  });

  it('daysInMonth handles February', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it('weekday', () => {
    expect(weekday('2026-11-21')).toBe(6); // Saturday
    expect(weekday('2026-11-20')).toBe(5); // Friday (Jumu'ah)
  });

  it('julianDayNumber matches known epochs', () => {
    expect(julianDayNumber('1970-01-01')).toBe(2_440_588);
    expect(julianDayNumber('2000-01-01')).toBe(2_451_545);
    expect(julianDayNumber('0622-07-19')).toBe(1_948_440); // proleptic Gregorian, Hijri epoch
  });
});

describe('localDateStr', () => {
  it('uses the explicit time zone', () => {
    const instant = Date.UTC(2026, 10, 20, 19, 0); // 2026-11-21 01:00 in Dhaka
    expect(localDateStr(instant, DHAKA)).toBe('2026-11-21');
    expect(localDateStr(instant, 'UTC')).toBe('2026-11-20');
  });

  it('falls back to the runtime zone (pinned to Asia/Dhaka in vitest config)', () => {
    expect(localDateStr(Date.UTC(2026, 10, 20, 19, 0))).toBe('2026-11-21');
  });

  it('rejects invalid instants', () => {
    expect(() => localDateStr(new Date('nope'))).toThrow(RangeError);
  });
});

describe('wakingDateStr — 3:00 AM day boundary', () => {
  // Dhaka local hh:mm on 2026-11-21 expressed as a UTC instant.
  const dhaka = (h: number, m = 0, day = 21) => Date.UTC(2026, 10, day, h - 6, m);

  it('boundary hour is 3', () => {
    expect(DAY_BOUNDARY_HOUR).toBe(3);
  });

  it('before 03:00 belongs to the previous day', () => {
    expect(wakingDateStr(dhaka(0, 0), DHAKA)).toBe('2026-11-20');
    expect(wakingDateStr(dhaka(1, 30), DHAKA)).toBe('2026-11-20');
    expect(wakingDateStr(dhaka(2, 59) + 59_999, DHAKA)).toBe('2026-11-20');
  });

  it('at and after 03:00 belongs to the same day', () => {
    expect(wakingDateStr(dhaka(3, 0), DHAKA)).toBe('2026-11-21');
    expect(wakingDateStr(dhaka(12, 0), DHAKA)).toBe('2026-11-21');
    expect(wakingDateStr(dhaka(23, 59), DHAKA)).toBe('2026-11-21');
  });

  it('rolls back across month and year boundaries', () => {
    expect(wakingDateStr(Date.UTC(2026, 0, 1, -6 + 2), DHAKA)).toBe('2025-12-31');
    expect(wakingDateStr(Date.UTC(2026, 2, 1, -6 + 1), DHAKA)).toBe('2026-02-28');
  });

  it('accepts a Date and defaults to the runtime zone', () => {
    expect(wakingDateStr(new Date(dhaka(2)))).toBe('2026-11-20');
    expect(wakingDateStr(new Date(dhaka(4)))).toBe('2026-11-21');
  });

  it('works in a DST zone', () => {
    // 2026-03-08 04:00 EDT (after spring-forward) = 08:00 UTC
    expect(wakingDateStr(Date.UTC(2026, 2, 8, 8, 0), NY)).toBe('2026-03-08');
    // 2026-03-08 01:30 EST = 06:30 UTC → still previous day
    expect(wakingDateStr(Date.UTC(2026, 2, 8, 6, 30), NY)).toBe('2026-03-07');
  });
});
