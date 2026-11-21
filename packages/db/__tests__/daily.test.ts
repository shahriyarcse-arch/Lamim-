import { calculateShs } from '@lamim/core';
import { describe, expect, it } from 'vitest';
import {
  DailyRepoError,
  getCustomDhikrPresets,
  getDhikrCounts,
  getSalahDayDetails,
  getShsInput,
  incrementDhikr,
  resetDhikr,
  setFasting,
} from '../src/repos/daily';
import { setSalahStatus } from '../src/repos/salah';
import { freshEnv } from './fixtures';

const P = 'p1';
const D = '2026-11-21';

describe('dhikr counts', () => {
  it('increments atomically, including concurrent taps', async () => {
    const { db } = freshEnv();
    await Promise.all(
      Array.from({ length: 50 }, () =>
        incrementDhikr(db, { profileId: P, date: D, presetId: 'subhanallah' }),
      ),
    );
    expect(await getDhikrCounts(db, P, D)).toEqual({ subhanallah: 50 });
    expect(await db.dhikrLogs.count()).toBe(1);
  });

  it('keeps presets independent and returns the new count', async () => {
    const { db } = freshEnv();
    expect(
      await incrementDhikr(db, { profileId: P, date: D, presetId: 'subhanallah', by: 33 }),
    ).toBe(33);
    expect(await incrementDhikr(db, { profileId: P, date: D, presetId: 'allhuakbar' })).toBe(1);
    expect(await getDhikrCounts(db, P, D)).toEqual({ subhanallah: 33, allhuakbar: 1 });
  });

  it('reset zeroes one preset and enqueues sync', async () => {
    const { db } = freshEnv();
    await incrementDhikr(db, { profileId: P, date: D, presetId: 'a', by: 5 });
    await incrementDhikr(db, { profileId: P, date: D, presetId: 'b', by: 2 });
    expect(await resetDhikr(db, { profileId: P, date: D, presetId: 'a' })).toBe(0);
    expect(await getDhikrCounts(db, P, D)).toEqual({ a: 0, b: 2 });
    expect(await db.syncQueue.count()).toBe(1); // coalesced on one row
  });

  it('resetting an empty day writes nothing', async () => {
    const { db } = freshEnv();
    await resetDhikr(db, { profileId: P, date: D, presetId: 'a' });
    expect(await db.dhikrLogs.count()).toBe(0);
  });

  it('caps at the maximum count', async () => {
    const { db } = freshEnv();
    await db.dhikrLogs.add({
      id: 'x',
      profileId: P,
      date: D,
      counts: { a: 9_999_999 },
      updatedAt: 1,
      deletedAt: null,
    });
    expect(await incrementDhikr(db, { profileId: P, date: D, presetId: 'a' })).toBe(9_999_999);
  });

  it.each([
    [{ presetId: 'bad id!' }, /preset id/],
    [{ date: '2026-13-01' }, /Invalid date/],
    [{ profileId: '' }, /profileId/],
  ])('rejects %o', async (override, message) => {
    const { db } = freshEnv();
    await expect(
      incrementDhikr(db, { profileId: P, date: D, presetId: 'a', ...override }),
    ).rejects.toThrow(message);
  });

  it.each([0, -1, 1.5, 1001])('rejects increment %s', (by) => {
    const { db } = freshEnv();
    expect(() => incrementDhikr(db, { profileId: P, date: D, presetId: 'a', by })).toThrow(
      DailyRepoError,
    );
  });
});

describe('custom presets', () => {
  it('reads valid imported presets and skips invalid ones', async () => {
    const { db } = freshEnv();
    await db.kv.add({
      id: 'k',
      profileId: 'global',
      key: 'dhikr.presets',
      updatedAt: 1,
      deletedAt: null,
      value: [
        { id: 'p1', latin: 'Ya Latif', target: 129 },
        { id: 'bad id', latin: 'x' },
        { latin: 'no id' },
        { id: 7, latin: 'Num', target: 'x' },
      ],
    });
    expect(await getCustomDhikrPresets(db)).toEqual([
      { id: 'p1', latin: 'Ya Latif', target: 129 },
      { id: '7', latin: 'Num', target: 33 },
    ]);
  });

  it('none stored → []', async () => {
    expect(await getCustomDhikrPresets(freshEnv().db)).toEqual([]);
  });
});

describe('fasting', () => {
  it('creates, toggles and preserves other day fields', async () => {
    const { db } = freshEnv();
    await setFasting(db, { profileId: P, date: D, fasting: true, now: 1 });
    expect((await getSalahDayDetails(db, P, D))?.fasting).toBe(true);
    await db.salahDays.toCollection().modify({ tahajjudRakat: 8 });
    await setFasting(db, { profileId: P, date: D, fasting: false, now: 2 });
    expect(await getSalahDayDetails(db, P, D)).toMatchObject({ fasting: false, tahajjudRakat: 8 });
  });

  it('turning off on a day with no row writes nothing', async () => {
    const { db } = freshEnv();
    await setFasting(db, { profileId: P, date: D, fasting: false });
    expect(await db.salahDays.count()).toBe(0);
  });

  it('rejects bad dates', async () => {
    await expect(
      setFasting(freshEnv().db, { profileId: P, date: 'x', fasting: true }),
    ).rejects.toThrow(DailyRepoError);
  });
});

describe('getShsInput', () => {
  it('assembles salah, nafl, dhikr and habits into a score matching the core calculator', async () => {
    const { db } = freshEnv();
    for (const prayer of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
      await setSalahStatus(db, { profileId: P, date: D, prayer, status: 'jamaat' });
    }
    await setFasting(db, { profileId: P, date: D, fasting: true });
    await db.salahDays
      .toCollection()
      .modify({ tahajjud: true, tahajjudRakat: 8, sunnah: { fajr_s: true } });
    await incrementDhikr(db, { profileId: P, date: D, presetId: 'subhanallah', by: 700 });
    await db.habits.bulkAdd([
      {
        id: 'h1',
        profileId: P,
        label: 'A',
        icon: null,
        color: null,
        startDate: '2026-01-01T00:00:00Z',
        updatedAt: 1,
        deletedAt: null,
      },
      {
        id: 'h2',
        profileId: P,
        label: 'B',
        icon: null,
        color: null,
        startDate: '2026-01-01T00:00:00Z',
        updatedAt: 1,
        deletedAt: null,
      },
      {
        id: 'h3',
        profileId: P,
        label: 'gone',
        icon: null,
        color: null,
        startDate: '2026-01-01T00:00:00Z',
        updatedAt: 1,
        deletedAt: 5,
      },
    ]);
    await db.habitEvents.add({
      id: 'e1',
      profileId: P,
      habitId: 'h1',
      date: D,
      type: 'relapse',
      at: null,
      reason: null,
      streak: 3,
      updatedAt: 1,
      deletedAt: null,
    });

    const shs = calculateShs(await getShsInput(db, P, D));
    // salah 50 + nafl (2 + 3) + dhikr 700/2100*15 = 5 + habits 1/2*10 = 5 → 65 → bonus 4 (60–69) → 69
    expect(shs.breakdown).toEqual({ salah: 50, nafl: 5, dhikr: 5, habits: 5, consistency: 4 });
    expect(shs.total).toBe(69);
  });

  it('empty day → zero score', async () => {
    expect(calculateShs(await getShsInput(freshEnv().db, P, D)).total).toBe(0);
  });
});
