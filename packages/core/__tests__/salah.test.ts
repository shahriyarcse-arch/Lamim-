import { describe, expect, it } from 'vitest';
import { addDays } from '../src/date';
import {
  computeSalahStreaks,
  countStreak,
  MAX_DAILY_SALAH_POINTS,
  normalizeStatus,
  SALAH_POINTS,
  scoreSalahDay,
  type SalahDayLog,
} from '../src/salah';

const all = (status: string): SalahDayLog => ({
  fajr: status,
  dhuhr: status,
  asr: status,
  maghrib: status,
  isha: status,
});

describe('point weights', () => {
  it("Jama'at 10 · Alone 7 · Qaza 3 · Missed 0", () => {
    expect(SALAH_POINTS).toEqual({ jamaat: 10, alone: 7, qaza: 3, missed: 0 });
    expect(MAX_DAILY_SALAH_POINTS).toBe(50);
  });
});

describe('normalizeStatus', () => {
  it.each([
    ['jamaat', 'jamaat'],
    ['alone', 'alone'],
    ['qaza', 'qaza'],
    ['missed', 'missed'],
    ['jamaah', 'jamaat'], // legacy alias
    ['prayed', 'alone'], // legacy alias
    ['JAMAAT', null],
    ['', null],
    [null, null],
    [undefined, null],
    [true, null],
    [10, null],
  ])('%j → %j', (raw, expected) => {
    expect(normalizeStatus(raw)).toBe(expected);
  });
});

describe('scoreSalahDay', () => {
  it('empty / null / undefined day scores zero', () => {
    for (const day of [{}, null, undefined]) {
      expect(scoreSalahDay(day)).toMatchObject({
        logged: 0,
        prayed: 0,
        points: 0,
        pct: 0,
        isPerfect: false,
        isConsistent: false,
      });
    }
  });

  it("all Jama'at: 50 points, 100%, perfect and perfect on time", () => {
    expect(scoreSalahDay(all('jamaat'))).toEqual({
      logged: 5,
      prayed: 5,
      missed: 0,
      onTime: 5,
      qaza: 0,
      jamaat: 5,
      points: 50,
      pct: 100,
      isPerfect: true,
      isPerfectOnTime: true,
      isConsistent: true,
    });
  });

  it('all Alone: 35 points, 75%', () => {
    expect(scoreSalahDay(all('alone'))).toMatchObject({
      points: 35,
      pct: 75,
      isPerfectOnTime: true,
    });
  });

  it('all Qaza: perfect (legacy rule) but not perfect on time', () => {
    expect(scoreSalahDay(all('qaza'))).toMatchObject({
      points: 15,
      pct: 50,
      qaza: 5,
      onTime: 0,
      isPerfect: true,
      isPerfectOnTime: false,
    });
  });

  it('all Missed: logged but zero and not consistent', () => {
    expect(scoreSalahDay(all('missed'))).toMatchObject({
      logged: 5,
      prayed: 0,
      missed: 5,
      points: 0,
      isPerfect: false,
      isConsistent: false,
    });
  });

  it('mixed day sums weights exactly', () => {
    const s = scoreSalahDay({
      fajr: 'jamaat',
      dhuhr: 'alone',
      asr: 'qaza',
      maghrib: 'missed',
      isha: 'jamaah',
    });
    expect(s).toMatchObject({
      points: 10 + 7 + 3 + 0 + 10,
      prayed: 4,
      missed: 1,
      jamaat: 2,
      isPerfect: false,
      isConsistent: true,
    });
  });

  it('4 prayed with one unlogged is consistent; 3 is not', () => {
    expect(
      scoreSalahDay({ fajr: 'alone', dhuhr: 'alone', asr: 'alone', maghrib: 'alone' }).isConsistent,
    ).toBe(true);
    expect(scoreSalahDay({ fajr: 'alone', dhuhr: 'alone', asr: 'alone' }).isConsistent).toBe(false);
  });

  it('ignores unknown statuses and non-Farz keys', () => {
    const day = { fajr: 'bogus', dhuhr: 'jamaat', tahajjud: 'jamaat' } as SalahDayLog;
    expect(scoreSalahDay(day)).toMatchObject({ logged: 1, points: 10 });
  });
});

describe('countStreak', () => {
  const today = '2026-11-21';
  const set = (dates: string[]) => {
    const s = new Set(dates);
    return (d: string) => s.has(d);
  };

  it('counts consecutive qualifying days ending today', () => {
    expect(countStreak(set([today, '2026-11-20', '2026-11-19']), today)).toBe(3);
  });

  it('an unfinished today does not break the streak', () => {
    expect(countStreak(set(['2026-11-20', '2026-11-19']), today)).toBe(2);
  });

  it('a gap ends the streak', () => {
    expect(countStreak(set([today, '2026-11-20', '2026-11-18']), today)).toBe(2);
  });

  it('nothing qualifies → 0', () => {
    expect(countStreak(() => false, today)).toBe(0);
  });

  it('crosses month and year boundaries', () => {
    expect(countStreak(set(['2026-01-01', '2025-12-31', '2025-12-30']), '2026-01-01')).toBe(3);
  });

  it('caps at the lookback window', () => {
    expect(countStreak(() => true, today)).toBe(365);
    expect(countStreak(() => true, today, 30)).toBe(30);
  });
});

describe('computeSalahStreaks', () => {
  const today = '2026-11-21';

  function history(days: Record<string, SalahDayLog>) {
    return (d: string) => days[d];
  }

  it('tracks perfect and consistency streaks independently', () => {
    const days: Record<string, SalahDayLog> = {
      [today]: all('jamaat'),
      [addDays(today, -1)]: all('qaza'), // perfect (legacy)
      [addDays(today, -2)]: { ...all('alone'), isha: 'missed' }, // consistent only
      [addDays(today, -3)]: all('alone'),
      [addDays(today, -4)]: { fajr: 'alone' }, // breaks both
      [addDays(today, -5)]: all('jamaat'),
    };
    expect(computeSalahStreaks(history(days), today)).toEqual({ perfect: 2, consistency: 4 });
  });

  it('in-progress today with 2 prayers keeps yesterday-based streaks', () => {
    const days: Record<string, SalahDayLog> = {
      [today]: { fajr: 'jamaat', dhuhr: 'jamaat' },
      [addDays(today, -1)]: all('jamaat'),
      [addDays(today, -2)]: all('jamaat'),
    };
    expect(computeSalahStreaks(history(days), today)).toEqual({ perfect: 2, consistency: 2 });
  });

  it('empty history → zeros', () => {
    expect(computeSalahStreaks(() => undefined, today)).toEqual({ perfect: 0, consistency: 0 });
  });

  it('reads each day at most once', () => {
    let reads = 0;
    computeSalahStreaks(
      () => {
        reads++;
        return all('jamaat');
      },
      today,
      30,
    );
    expect(reads).toBe(30);
  });
});
