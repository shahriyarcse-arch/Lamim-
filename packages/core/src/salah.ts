/**
 * Salah scoring and streaks — ported from legacy `Utils.salahScore` and
 * `DB.getSalahStreak`.
 *
 * Points: Jama'at 10 · Alone 7 · Qaza 3 · Missed 0 (max 50/day).
 * Perfect day: all 5 Farz logged and none missed (Qaza counts, matching legacy).
 * Consistent day: at least 4 of 5 prayed.
 */
import { addDays, type DateStr } from './date';
import { PRAYER_NAMES, type PrayerName } from './prayer';

export const SALAH_STATUSES = ['jamaat', 'alone', 'qaza', 'missed'] as const;
export type SalahStatus = (typeof SALAH_STATUSES)[number];

export const SALAH_POINTS: Readonly<Record<SalahStatus, number>> = {
  jamaat: 10,
  alone: 7,
  qaza: 3,
  missed: 0,
};

/** Legacy completion-percentage weights (5 × Jama'at = 100%). */
const SALAH_PCT: Readonly<Record<SalahStatus, number>> = {
  jamaat: 20,
  alone: 15,
  qaza: 10,
  missed: 0,
};

export const MAX_DAILY_SALAH_POINTS = PRAYER_NAMES.length * SALAH_POINTS.jamaat;
export const CONSISTENT_DAY_MIN_PRAYED = 4;
export const DEFAULT_STREAK_LOOKBACK_DAYS = 365;

/** Per-prayer status map for one day. Values may be raw legacy strings. */
export type SalahDayLog = Partial<Record<PrayerName, unknown>>;

/** Normalize a stored status, including legacy aliases ("jamaah", "prayed"). Unknown → null. */
export function normalizeStatus(raw: unknown): SalahStatus | null {
  if (raw === 'jamaah') return 'jamaat';
  if (raw === 'prayed') return 'alone';
  return (SALAH_STATUSES as readonly unknown[]).includes(raw) ? (raw as SalahStatus) : null;
}

export interface SalahDayScore {
  /** Prayers with any status recorded (including missed). */
  readonly logged: number;
  /** Prayers performed: Jama'at, Alone or Qaza. */
  readonly prayed: number;
  readonly missed: number;
  /** Prayed within their time: Jama'at or Alone. */
  readonly onTime: number;
  readonly qaza: number;
  readonly jamaat: number;
  readonly points: number;
  /** Legacy completion percentage, 0–100. */
  readonly pct: number;
  readonly isPerfect: boolean;
  /** All five prayed on time (stricter than `isPerfect`). */
  readonly isPerfectOnTime: boolean;
  readonly isConsistent: boolean;
}

export function scoreSalahDay(day: SalahDayLog | null | undefined): SalahDayScore {
  let logged = 0;
  let prayed = 0;
  let missed = 0;
  let onTime = 0;
  let qaza = 0;
  let jamaat = 0;
  let points = 0;
  let pct = 0;

  for (const name of PRAYER_NAMES) {
    const status = normalizeStatus(day?.[name]);
    if (!status) continue;
    logged++;
    points += SALAH_POINTS[status];
    pct += SALAH_PCT[status];
    if (status === 'missed') {
      missed++;
      continue;
    }
    prayed++;
    if (status === 'qaza') qaza++;
    else onTime++;
    if (status === 'jamaat') jamaat++;
  }

  const total = PRAYER_NAMES.length;
  return {
    logged,
    prayed,
    missed,
    onTime,
    qaza,
    jamaat,
    points,
    pct,
    isPerfect: prayed === total,
    isPerfectOnTime: onTime === total,
    isConsistent: prayed >= CONSISTENT_DAY_MIN_PRAYED,
  };
}

/**
 * Consecutive days, ending at `today`, that satisfy `qualifies`. Today counts when
 * it already qualifies but never breaks the streak (the day is still in progress).
 */
export function countStreak(
  qualifies: (date: DateStr) => boolean,
  today: DateStr,
  maxDays = DEFAULT_STREAK_LOOKBACK_DAYS,
): number {
  let streak = qualifies(today) ? 1 : 0;
  for (let i = 1; i < maxDays; i++) {
    if (!qualifies(addDays(today, -i))) break;
    streak++;
  }
  return streak;
}

export interface SalahStreaks {
  /** Consecutive perfect days. */
  readonly perfect: number;
  /** Consecutive days with at least 4 prayers. */
  readonly consistency: number;
}

export function computeSalahStreaks(
  getDay: (date: DateStr) => SalahDayLog | null | undefined,
  today: DateStr,
  maxDays = DEFAULT_STREAK_LOOKBACK_DAYS,
): SalahStreaks {
  const scores = new Map<DateStr, SalahDayScore>();
  const score = (date: DateStr) => {
    let s = scores.get(date);
    if (!s) {
      s = scoreSalahDay(getDay(date));
      scores.set(date, s);
    }
    return s;
  };
  return {
    perfect: countStreak((d) => score(d).isPerfect, today, maxDays),
    consistency: countStreak((d) => score(d).isConsistent, today, maxDays),
  };
}
