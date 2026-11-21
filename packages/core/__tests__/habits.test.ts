import { describe, expect, it } from 'vitest';
import {
  BREATHING_478,
  breathingStateAt,
  elapsedSince,
  HABIT_RANK_DAYS,
  habitRank,
  habitStats,
  type HabitEventLike,
} from '../src/habits';

const H = 3_600_000;
const D = 24 * H;
const T0 = Date.UTC(2026, 10, 1, 8, 0, 0);

describe('elapsedSince', () => {
  it('splits into days, hours, minutes, seconds', () => {
    expect(elapsedSince(T0, T0 + 3 * D + 4 * H + 5 * 60_000 + 6_999)).toEqual({
      totalMs: 3 * D + 4 * H + 5 * 60_000 + 6_999,
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
    });
  });

  it('never goes negative (start in the future)', () => {
    expect(elapsedSince(T0 + 1000, T0)).toEqual({
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe('habitRank', () => {
  it.each([
    [0, 0, 1, 0],
    [0.5 * D, 0, 1, 0.5],
    [1 * D, 1, 7, 0],
    [4 * D, 1, 7, 0.5],
    [29.99 * D, 3, 30, 8.99 / 9],
    [365 * D, 9, 500, 0],
    [1000 * D, 12, 3000, 0],
    [5000 * D, 14, null, 1],
    [9000 * D, 14, null, 1],
  ])('%s ms → rank %i, next %s, progress %f', (ms, index, nextDays, progress) => {
    const r = habitRank(ms);
    expect(r.index).toBe(index);
    expect(r.nextDays).toBe(nextDays);
    expect(r.progress).toBeCloseTo(progress, 6);
  });

  it('has the 15 legacy thresholds (Novice … 5000 days)', () => {
    expect(HABIT_RANK_DAYS).toHaveLength(15);
  });
});

describe('habitStats', () => {
  const relapse = (
    at: string | null,
    date: string,
    streak: number | null = null,
  ): HabitEventLike => ({
    type: 'relapse',
    at,
    date,
    streak,
  });

  it('no relapses: streak runs from the start', () => {
    const s = habitStats(new Date(T0).toISOString(), [], T0 + 10 * D + H);
    expect(s).toMatchObject({
      streakStartMs: T0,
      relapses: 0,
      lastRelapseMs: null,
      longestDays: 10,
    });
    expect(s.current).toMatchObject({ days: 10, hours: 1 });
  });

  it('the latest relapse restarts the streak; longest keeps the best', () => {
    const events = [
      relapse('2026-11-05T08:00:00.000Z', '2026-11-05', 4),
      relapse('2026-11-12T20:00:00.000Z', '2026-11-12', 7),
      { type: 'clean' as const, at: null, date: '2026-11-13', streak: null },
    ];
    const now = Date.parse('2026-11-14T20:00:00.000Z');
    const s = habitStats(new Date(T0).toISOString(), events, now);
    expect(s.streakStartMs).toBe(Date.parse('2026-11-12T20:00:00.000Z'));
    expect(s.current.days).toBe(2);
    expect(s).toMatchObject({ relapses: 2, longestDays: 7 });
  });

  it('a start later than the last relapse wins (legacy streak reset moved startDate)', () => {
    const s = habitStats(
      '2026-11-10T00:00:00.000Z',
      [relapse('2026-11-05T00:00:00.000Z', '2026-11-05')],
      Date.parse('2026-11-11T00:00:00.000Z'),
    );
    expect(s.current.days).toBe(1);
  });

  it('events without a time fall back to midday UTC of their date', () => {
    const s = habitStats(
      new Date(T0).toISOString(),
      [relapse(null, '2026-11-03')],
      Date.parse('2026-11-04T12:00:00.000Z'),
    );
    expect(s.current.days).toBe(1);
  });

  it('respects a legacy stored longest streak', () => {
    expect(habitStats(new Date(T0).toISOString(), [], T0 + D, 45).longestDays).toBe(45);
  });

  it('rejects an invalid start', () => {
    expect(() => habitStats('nope', [], T0)).toThrow(RangeError);
  });
});

describe('breathingStateAt (4-7-8)', () => {
  it('cycle is 19 seconds', () => {
    expect(BREATHING_478.reduce((a, s) => a + s.ms, 0)).toBe(19_000);
  });

  it.each([
    [0, 'inhale', 0, 0, 4000],
    [3_999, 'inhale', 0, 0, 1],
    [4_000, 'hold', 1, 0, 7000],
    [10_999, 'hold', 1, 0, 1],
    [11_000, 'exhale', 2, 0, 8000],
    [18_999, 'exhale', 2, 0, 1],
    [19_000, 'inhale', 0, 1, 4000],
    [19_000 * 3 + 5_000, 'hold', 1, 3, 6000],
  ])('%i ms → %s (step %i, cycle %i, %i ms left)', (t, phase, index, cycle, remaining) => {
    expect(breathingStateAt(t)).toMatchObject({ phase, index, cycle, phaseRemainingMs: remaining });
  });

  it('phase progress runs 0 → 1', () => {
    expect(breathingStateAt(2_000).phaseProgress).toBeCloseTo(0.5);
    expect(breathingStateAt(15_000).phaseProgress).toBeCloseTo(0.5);
  });

  it('negative time clamps to the start; empty pattern is rejected', () => {
    expect(breathingStateAt(-5).phase).toBe('inhale');
    expect(() => breathingStateAt(0, [])).toThrow(RangeError);
  });
});
