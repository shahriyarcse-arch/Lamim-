import { describe, expect, it } from 'vitest';
import { addDays } from '../src/date';
import { HIJRI_MONTH_KEYS, hijriMonthKey, toHijri } from '../src/hijri';

/** Oracle: ICU's tabular "islamic-civil" calendar, which the Kuwaiti algorithm implements. */
const icu = new Intl.DateTimeFormat('en-u-ca-islamic-civil', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});
function oracle(date: string) {
  const parts = Object.fromEntries(
    icu.formatToParts(new Date(`${date}T12:00:00Z`)).map((p) => [p.type, p.value]),
  );
  return {
    year: Number.parseInt(parts.year ?? '', 10),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

describe('toHijri', () => {
  it('maps the Hijri epoch to 1 Muharram 1 AH', () => {
    expect(toHijri('0622-07-19')).toEqual({ year: 1, month: 1, day: 1 });
  });

  it('rejects dates before the epoch', () => {
    expect(() => toHijri('0622-07-18')).toThrow(RangeError);
  });

  it('matches ICU islamic-civil for every day 1990–2060', () => {
    let date = '1990-01-01';
    let checked = 0;
    while (date <= '2060-12-31') {
      expect(toHijri(date), date).toEqual(oracle(date));
      date = addDays(date, 1);
      checked++;
    }
    expect(checked).toBeGreaterThan(25_000);
  });

  it('day values stay within 1–30 and months within 1–12', () => {
    let date = '2024-01-01';
    for (let i = 0; i < 1500; i++) {
      const h = toHijri(date);
      expect(h.day).toBeGreaterThanOrEqual(1);
      expect(h.day).toBeLessThanOrEqual(30);
      expect(h.month).toBeGreaterThanOrEqual(1);
      expect(h.month).toBeLessThanOrEqual(12);
      date = addDays(date, 1);
    }
  });

  it('is independent of the runtime time zone (legacy bug: previous day before 06:00 in Dhaka)', () => {
    // The legacy code took a local-midnight Date and used its UTC epoch, which in UTC+6
    // fell on the previous day. Here the civil date string alone determines the result.
    expect(toHijri('2026-11-21')).toEqual(oracle('2026-11-21'));
  });

  it('applies a manual moon-sighting offset', () => {
    const base = toHijri('2026-11-21');
    expect(toHijri('2026-11-21', 1)).toEqual(toHijri('2026-11-22'));
    expect(toHijri('2026-11-21', -1)).toEqual(toHijri('2026-11-20'));
    expect(toHijri('2026-11-21', 0)).toEqual(base);
  });

  it.each([4, -4, 0.5, Number.NaN])('rejects offset %s', (offset) => {
    expect(() => toHijri('2026-11-21', offset)).toThrow(RangeError);
  });

  it('rejects malformed dates', () => {
    expect(() => toHijri('2026-02-30')).toThrow(RangeError);
  });
});

describe('hijriMonthKey', () => {
  it('maps 1–12 to translation keys', () => {
    expect(hijriMonthKey(1)).toBe('muharram');
    expect(hijriMonthKey(9)).toBe('ramadan');
    expect(hijriMonthKey(12)).toBe('dhu_al_hijjah');
    expect(HIJRI_MONTH_KEYS).toHaveLength(12);
  });

  it.each([0, 13, 1.5])('rejects %s', (m) => {
    expect(() => hijriMonthKey(m)).toThrow(RangeError);
  });
});
