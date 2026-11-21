import { describe, expect, it } from 'vitest';
import {
  calculateShs,
  consistencyBonus,
  shsRating,
  totalDhikrCount,
  type ShsSalahDay,
} from '../src/shs';

const date = '2026-11-21';
const allJamaat: ShsSalahDay = {
  fajr: 'jamaat',
  dhuhr: 'jamaat',
  asr: 'jamaat',
  maghrib: 'jamaat',
  isha: 'jamaat',
};
const fullSunnah = {
  fajr_s: true,
  dhuhr_s_b: true,
  dhuhr_s_a: 'prayed',
  maghrib_s: true,
  isha_s: true,
};

describe('calculateShs', () => {
  it('empty day → 0 and Awakening', () => {
    expect(calculateShs({ date })).toEqual({
      total: 0,
      breakdown: { salah: 0, nafl: 0, dhikr: 0, habits: 0, consistency: 0 },
      dhikrCount: 0,
      dhikrLevel: 0,
      rating: 'awakening',
    });
  });

  it('maximum day caps at 100 → Ihsan', () => {
    const r = calculateShs({
      date,
      salah: { ...allJamaat, sunnah: fullSunnah, tahajjud: true, witr: true },
      dhikr: { subhanallah: 3000 },
      habits: [{ startDate: '2026-01-01', history: [] }],
    });
    expect(r.breakdown).toEqual({ salah: 50, nafl: 15, dhikr: 15, habits: 10, consistency: 10 });
    expect(r.total).toBe(100);
    expect(r.rating).toBe('ihsan');
  });

  it('salah component uses 10/7/3/0 weights', () => {
    const r = calculateShs({
      date,
      salah: { fajr: 'jamaat', dhuhr: 'alone', asr: 'qaza', maghrib: 'missed' },
    });
    expect(r.breakdown.salah).toBe(20);
  });

  describe('nafl', () => {
    it('sunnah 2 each, tahajjud 3, witr 2, capped at 15', () => {
      expect(calculateShs({ date, salah: { sunnah: { fajr_s: true } } }).breakdown.nafl).toBe(2);
      expect(calculateShs({ date, salah: { tahajjud: 'prayed' } }).breakdown.nafl).toBe(3);
      expect(calculateShs({ date, salah: { tahajjud_rakat: 8 } }).breakdown.nafl).toBe(3);
      expect(calculateShs({ date, salah: { witr: 3 } }).breakdown.nafl).toBe(2);
      expect(
        calculateShs({ date, salah: { sunnah: fullSunnah, tahajjud: true, witr: true } }).breakdown
          .nafl,
      ).toBe(15);
    });

    it('ignores false, zero and unknown sunnah keys', () => {
      const salah: ShsSalahDay = {
        sunnah: { fajr_s: false, other: true },
        tahajjud: false,
        tahajjud_rakat: 0,
        witr: 0,
      };
      expect(calculateShs({ date, salah }).breakdown.nafl).toBe(0);
    });
  });

  describe('dhikr', () => {
    it('is proportional to 2100 and capped at 15', () => {
      expect(calculateShs({ date, dhikr: { a: 700 } }).breakdown.dhikr).toBe(5);
      expect(calculateShs({ date, dhikr: { a: 2100 } }).breakdown.dhikr).toBe(15);
      expect(calculateShs({ date, dhikr: { a: 99_999 } }).breakdown.dhikr).toBe(15);
    });

    it('levels step every 300, max 7', () => {
      expect(calculateShs({ date, dhikr: { a: 299 } }).dhikrLevel).toBe(0);
      expect(calculateShs({ date, dhikr: { a: 300 } }).dhikrLevel).toBe(1);
      expect(calculateShs({ date, dhikr: { a: 5000 } }).dhikrLevel).toBe(7);
    });
  });

  describe('habits', () => {
    it('fraction of active habits not relapsed today × 10', () => {
      const habits = [
        { startDate: '2026-01-01', history: [{ date, clean: false }] },
        { startDate: '2026-01-01', history: [{ date: '2026-11-20', clean: false }] },
      ];
      expect(calculateShs({ date, habits }).breakdown.habits).toBe(5);
    });

    it('habits starting after the date are excluded', () => {
      const habits = [
        { startDate: '2026-12-01T00:00:00.000Z' },
        { startDate: '2026-11-21T08:00:00Z' },
      ];
      expect(calculateShs({ date, habits }).breakdown.habits).toBe(10);
    });

    it('only future habits → 0', () => {
      expect(calculateShs({ date, habits: [{ startDate: '2027-01-01' }] }).breakdown.habits).toBe(
        0,
      );
    });

    it('habits without a start date always count', () => {
      expect(calculateShs({ date, habits: [{ history: null }] }).breakdown.habits).toBe(10);
    });

    it('a clean entry on the date is not a relapse', () => {
      expect(
        calculateShs({ date, habits: [{ history: [{ date, clean: true }] }] }).breakdown.habits,
      ).toBe(10);
    });
  });

  it('rounds components to one decimal', () => {
    const r = calculateShs({ date, dhikr: { a: 100 } }); // 100/2100*15 = 0.714…
    expect(r.breakdown.dhikr).toBe(0.7);
    expect(r.total).toBe(0.7);
  });

  it('a strong but not perfect day', () => {
    // salah 50 + nafl 0 + dhikr 15 + habits 10 = 75 → bonus 6 → 81 → God-Conscious
    const r = calculateShs({ date, salah: allJamaat, dhikr: { a: 2100 }, habits: [{}] });
    expect(r.breakdown.consistency).toBe(6);
    expect(r.total).toBe(81);
    expect(r.rating).toBe('god_conscious');
  });
});

describe('consistencyBonus', () => {
  it.each([
    [0, 0],
    [39.4, 0],
    [39.5, 1], // rounds up to 40
    [49, 1],
    [50, 2],
    [60, 4],
    [70, 6],
    [80, 8],
    [89.4, 8],
    [89.5, 10],
    [100, 10],
  ])('%s → %s', (subtotal, bonus) => {
    expect(consistencyBonus(subtotal)).toBe(bonus);
  });
});

describe('shsRating', () => {
  it.each([
    [100, 'ihsan'],
    [90, 'ihsan'],
    [89.9, 'god_conscious'],
    [80, 'god_conscious'],
    [65, 'mindful'],
    [64.9, 'resilient'],
    [50, 'resilient'],
    [30, 'consistent'],
    [15, 'intentional'],
    [14.9, 'awakening'],
    [0, 'awakening'],
  ])('%s → %s', (score, key) => {
    expect(shsRating(score)).toBe(key);
  });
});

describe('totalDhikrCount', () => {
  it('sums numeric and numeric-string counts, ignoring junk and negatives', () => {
    expect(
      totalDhikrCount({ a: 33, b: '34', c: 'x', d: -10, e: 12.9, f: null, g: Number.NaN }),
    ).toBe(33 + 34 + 12);
  });

  it('null → 0', () => {
    expect(totalDhikrCount(null)).toBe(0);
  });
});
