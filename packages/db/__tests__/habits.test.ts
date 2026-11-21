import { calculateShs, habitStats } from '@lamim/core';
import { describe, expect, it } from 'vitest';
import { getShsInput } from '../src/repos/daily';
import {
  createHabit,
  deleteHabit,
  HabitError,
  listHabits,
  logRelapse,
  undoRelapse,
} from '../src/repos/habits';
import { freshEnv } from './fixtures';

const P = 'p1';
const DAY = 86_400_000;
const T0 = Date.UTC(2026, 10, 1, 8);

describe('habits repository', () => {
  it('creates a habit tracked from the given start', async () => {
    const { db } = freshEnv();
    const h = await createHabit(db, {
      profileId: P,
      label: '  Smoking ',
      startIso: new Date(T0).toISOString(),
      now: T0 + DAY,
    });
    expect(h).toMatchObject({
      label: 'Smoking',
      startDate: new Date(T0).toISOString(),
      trackedSince: new Date(T0).toISOString(),
    });
    const [{ habit, events }] = (await listHabits(db, P)) as [
      Awaited<ReturnType<typeof listHabits>>[number],
    ];
    expect(habit.id).toBe(h.id);
    expect(events).toEqual([]);
  });

  it.each([
    [{ label: '' }, /1–60/],
    [{ label: 'x'.repeat(61) }, /1–60/],
    [{ startIso: 'not a date' }, /Invalid start/],
    [{ startIso: new Date(T0 + 2 * DAY).toISOString() }, /future/],
    [{ profileId: '' }, /profileId/],
  ])('rejects %o', async (override, message) => {
    const { db } = freshEnv();
    await expect(
      createHabit(db, { profileId: P, label: 'A', now: T0, ...override }),
    ).rejects.toThrow(message);
  });

  it('a relapse is an appended event recording the ended streak; the habit row is untouched', async () => {
    const { db } = freshEnv();
    const h = await createHabit(db, { profileId: P, label: 'A', now: T0 });
    const before = await db.habits.get(h.id);
    const e = await logRelapse(db, {
      profileId: P,
      habitId: h.id,
      date: '2026-11-06',
      reason: ' stress ',
      now: T0 + 5 * DAY + 3_600_000,
    });
    expect(e).toMatchObject({ type: 'relapse', streak: 5, reason: 'stress', date: '2026-11-06' });
    expect(await db.habits.get(h.id)).toEqual(before);

    const [{ habit, events }] = (await listHabits(db, P)) as [
      Awaited<ReturnType<typeof listHabits>>[number],
    ];
    const stats = habitStats(habit.startDate, events, T0 + 7 * DAY + 3_600_000);
    expect(stats).toMatchObject({ relapses: 1, longestDays: 5 });
    expect(stats.current.days).toBe(2);
  });

  it('undo tombstones the relapse and restores the previous streak', async () => {
    const { db } = freshEnv();
    const h = await createHabit(db, { profileId: P, label: 'A', now: T0 });
    const e = await logRelapse(db, {
      profileId: P,
      habitId: h.id,
      date: '2026-11-03',
      now: T0 + 2 * DAY,
    });
    await undoRelapse(db, P, e.id, T0 + 2 * DAY + 1000);
    const [{ habit, events }] = (await listHabits(db, P)) as [
      Awaited<ReturnType<typeof listHabits>>[number],
    ];
    expect(events).toEqual([]);
    expect(habitStats(habit.startDate, events, T0 + 3 * DAY).current.days).toBe(3);
    expect((await db.habitEvents.get(e.id))?.deletedAt).not.toBeNull();
    await expect(undoRelapse(db, P, e.id)).rejects.toThrow(HabitError);
  });

  it('rejects relapses on unknown, foreign or deleted habits and bad input', async () => {
    const { db } = freshEnv();
    const h = await createHabit(db, { profileId: P, label: 'A', now: T0 });
    await expect(
      logRelapse(db, { profileId: 'other', habitId: h.id, date: '2026-11-02' }),
    ).rejects.toThrow(/not found/);
    await expect(
      logRelapse(db, { profileId: P, habitId: h.id, date: '2026-13-01' }),
    ).rejects.toThrow(/Invalid date/);
    await expect(
      logRelapse(db, { profileId: P, habitId: h.id, date: '2026-11-02', reason: 'x'.repeat(201) }),
    ).rejects.toThrow(/200/);
    await deleteHabit(db, P, h.id);
    expect(await listHabits(db, P)).toEqual([]);
    await expect(
      logRelapse(db, { profileId: P, habitId: h.id, date: '2026-11-02' }),
    ).rejects.toThrow(/not found/);
  });

  it('feeds the Spirit Score: a relapse today drops the habit share for that day only', async () => {
    const { db } = freshEnv();
    const a = await createHabit(db, { profileId: P, label: 'A', now: T0 });
    await createHabit(db, { profileId: P, label: 'B', now: T0 });
    await logRelapse(db, { profileId: P, habitId: a.id, date: '2026-11-05', now: T0 + 4 * DAY });
    expect(calculateShs(await getShsInput(db, P, '2026-11-05')).breakdown.habits).toBe(5);
    expect(calculateShs(await getShsInput(db, P, '2026-11-04')).breakdown.habits).toBe(10);
    // Before tracking began, habits do not count at all.
    expect(calculateShs(await getShsInput(db, P, '2026-10-31')).breakdown.habits).toBe(0);
  });
});
