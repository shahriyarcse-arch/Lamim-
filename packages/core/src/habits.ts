/**
 * Sobriety streaks and 4-7-8 breathing — pure time maths.
 *
 * A habit's current streak starts at the later of its tracked start and its most
 * recent relapse event. Relapses are immutable event rows, so the streak is always
 * derived, never stored.
 */
import type { DateStr } from './date';

const MS = { second: 1000, minute: 60_000, hour: 3_600_000, day: 86_400_000 } as const;

export interface Elapsed {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Whole days/hours/minutes/seconds from `sinceMs` to `nowMs` (never negative). */
export function elapsedSince(sinceMs: number, nowMs: number): Elapsed {
  const totalMs = Math.max(0, nowMs - sinceMs);
  return {
    totalMs,
    days: Math.floor(totalMs / MS.day),
    hours: Math.floor((totalMs % MS.day) / MS.hour),
    minutes: Math.floor((totalMs % MS.hour) / MS.minute),
    seconds: Math.floor((totalMs % MS.minute) / MS.second),
  };
}

/** Rank thresholds in clean days (legacy badges: Novice … The Legend). */
export const HABIT_RANK_DAYS = [
  0, 1, 7, 21, 30, 60, 90, 150, 240, 365, 500, 750, 1000, 3000, 5000,
] as const;

export interface HabitRank {
  /** Index into HABIT_RANK_DAYS. */
  index: number;
  /** Next threshold in days, or null at the top rank. */
  nextDays: number | null;
  /** 0–1 progress from the current to the next threshold (1 at the top). */
  progress: number;
}

export function habitRank(elapsedMs: number): HabitRank {
  const days = Math.max(0, elapsedMs) / MS.day;
  let index = 0;
  for (let i = 0; i < HABIT_RANK_DAYS.length; i++) if (days >= HABIT_RANK_DAYS[i]!) index = i;
  const from = HABIT_RANK_DAYS[index]!;
  const next = HABIT_RANK_DAYS[index + 1] ?? null;
  return { index, nextDays: next, progress: next === null ? 1 : (days - from) / (next - from) };
}

export interface HabitEventLike {
  type: 'relapse' | 'clean';
  /** ISO datetime, when known. */
  at: string | null;
  date: DateStr;
  /** Streak (days) recorded at relapse time. */
  streak: number | null;
}

function eventMs(e: HabitEventLike): number {
  const at = e.at ? Date.parse(e.at) : Number.NaN;
  return Number.isFinite(at) ? at : Date.parse(`${e.date}T12:00:00Z`);
}

export interface HabitStats {
  streakStartMs: number;
  current: Elapsed;
  /** Best streak in whole days, including the current one. */
  longestDays: number;
  relapses: number;
  lastRelapseMs: number | null;
}

export function habitStats(
  startIso: string,
  events: readonly HabitEventLike[],
  nowMs: number,
  legacyLongestDays = 0,
): HabitStats {
  const start = Date.parse(startIso);
  if (!Number.isFinite(start)) throw new RangeError(`Invalid habit start: ${startIso}`);
  const relapses = events.filter((e) => e.type === 'relapse');
  const lastRelapseMs = relapses.length ? Math.max(...relapses.map(eventMs)) : null;
  const streakStartMs = lastRelapseMs === null ? start : Math.max(start, lastRelapseMs);
  const current = elapsedSince(streakStartMs, nowMs);
  const recorded = relapses.map((e) =>
    typeof e.streak === 'number' && e.streak > 0 ? e.streak : 0,
  );
  return {
    streakStartMs,
    current,
    longestDays: Math.max(current.days, legacyLongestDays, ...recorded),
    relapses: relapses.length,
    lastRelapseMs,
  };
}

// ---- 4-7-8 breathing ------------------------------------------------------------

export type BreathPhase = 'inhale' | 'hold' | 'exhale';

export interface BreathStep {
  phase: BreathPhase;
  ms: number;
}

export const BREATHING_478: readonly BreathStep[] = [
  { phase: 'inhale', ms: 4000 },
  { phase: 'hold', ms: 7000 },
  { phase: 'exhale', ms: 8000 },
];

export interface BreathState {
  phase: BreathPhase;
  /** Step index within the cycle. */
  index: number;
  /** Completed cycles so far. */
  cycle: number;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
  /** 0–1 through the current phase. */
  phaseProgress: number;
}

export function breathingStateAt(
  elapsedMs: number,
  pattern: readonly BreathStep[] = BREATHING_478,
): BreathState {
  if (pattern.length === 0) throw new RangeError('Empty breathing pattern');
  const cycleMs = pattern.reduce((a, s) => a + s.ms, 0);
  const t = Math.max(0, elapsedMs);
  const cycle = Math.floor(t / cycleMs);
  let within = t % cycleMs;
  for (let index = 0; index < pattern.length; index++) {
    const step = pattern[index]!;
    if (within < step.ms) {
      return {
        phase: step.phase,
        index,
        cycle,
        phaseElapsedMs: within,
        phaseRemainingMs: step.ms - within,
        phaseProgress: within / step.ms,
      };
    }
    within -= step.ms;
  }
  /* c8 ignore next */
  throw new Error('unreachable');
}
