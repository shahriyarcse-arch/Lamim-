/**
 * Spiritual Health Score (SHS) — ported from legacy `Analysis.calculateSHS`.
 *
 * Components (max 100):
 *   Salah 50 · Nafl/Sunnah 15 · Dhikr 15 · Habits 10 · Consistency bonus 10
 *
 * Pure: callers pass the day's records; nothing is read from storage here.
 * Rating colors are a UI concern — this returns a stable rating key.
 */
import type { DateStr } from './date';
import { scoreSalahDay, type SalahDayLog } from './salah';

export const SHS_WEIGHTS = {
  salah: 50,
  nafl: 15,
  dhikr: 15,
  habits: 10,
  consistency: 10,
} as const;

/** Dhikr count that earns the full dhikr weight. */
export const DHIKR_FULL_SCORE_COUNT = 2100;
/** Dhikr count per level (levels 0–7). */
export const DHIKR_LEVEL_STEP = 300;
export const DHIKR_MAX_LEVEL = 7;

export const SUNNAH_KEYS = ['fajr_s', 'dhuhr_s_b', 'dhuhr_s_a', 'maghrib_s', 'isha_s'] as const;
const SUNNAH_POINTS = 2;
const TAHAJJUD_POINTS = 3;
const WITR_POINTS = 2;

/** Rounded-subtotal thresholds → consistency bonus (highest first). */
const CONSISTENCY_STEPS: readonly (readonly [minTotal: number, bonus: number])[] = [
  [90, 10],
  [80, 8],
  [70, 6],
  [60, 4],
  [50, 2],
  [40, 1],
];

export const SHS_RATINGS = [
  { key: 'ihsan', min: 90 },
  { key: 'god_conscious', min: 80 },
  { key: 'mindful', min: 65 },
  { key: 'resilient', min: 50 },
  { key: 'consistent', min: 30 },
  { key: 'intentional', min: 15 },
  { key: 'awakening', min: 0 },
] as const;

export type ShsRatingKey = (typeof SHS_RATINGS)[number]['key'];

/** Salah log plus the voluntary-prayer fields the legacy goals engine writes. */
export interface ShsSalahDay extends SalahDayLog {
  readonly sunnah?: Partial<Record<string, unknown>> | null;
  readonly tahajjud?: unknown;
  readonly tahajjud_rakat?: unknown;
  readonly witr?: unknown;
}

export interface ShsHabit {
  /** ISO date or datetime the habit began; habits without one always count. */
  readonly startDate?: string | null;
  readonly history?: readonly { readonly date: DateStr; readonly clean: boolean }[] | null;
}

export interface ShsInput {
  readonly date: DateStr;
  readonly salah?: ShsSalahDay | null;
  /** Dhikr counts keyed by preset; non-numeric or negative values are ignored. */
  readonly dhikr?: Readonly<Record<string, unknown>> | null;
  readonly habits?: readonly ShsHabit[] | null;
}

export interface ShsResult {
  readonly total: number;
  readonly breakdown: {
    readonly salah: number;
    readonly nafl: number;
    readonly dhikr: number;
    readonly habits: number;
    readonly consistency: number;
  };
  readonly dhikrCount: number;
  readonly dhikrLevel: number;
  readonly rating: ShsRatingKey;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const isPrayed = (v: unknown) => v === true || v === 'prayed';
const isPositive = (v: unknown) => typeof v === 'number' && v > 0;

function naflPoints(salah: ShsSalahDay | null | undefined): number {
  if (!salah) return 0;
  let pts = 0;
  for (const key of SUNNAH_KEYS) {
    if (isPrayed(salah.sunnah?.[key])) pts += SUNNAH_POINTS;
  }
  if (isPrayed(salah.tahajjud) || isPositive(salah.tahajjud_rakat)) pts += TAHAJJUD_POINTS;
  if (isPrayed(salah.witr) || isPositive(salah.witr)) pts += WITR_POINTS;
  return Math.min(SHS_WEIGHTS.nafl, pts);
}

export function totalDhikrCount(
  dhikr: Readonly<Record<string, unknown>> | null | undefined,
): number {
  if (!dhikr) return 0;
  let total = 0;
  for (const value of Object.values(dhikr)) {
    const n = typeof value === 'number' ? Math.trunc(value) : Number.parseInt(String(value), 10);
    if (Number.isFinite(n) && n > 0) total += n;
  }
  return total;
}

function habitPoints(date: DateStr, habits: readonly ShsHabit[] | null | undefined): number {
  if (!habits?.length) return 0;
  let active = 0;
  let clean = 0;
  for (const habit of habits) {
    const start = habit.startDate ? habit.startDate.split('T')[0] : null;
    if (start && date < start) continue;
    active++;
    const relapsed = habit.history?.some((e) => e.date === date && e.clean === false);
    if (!relapsed) clean++;
  }
  return active > 0 ? (clean / active) * SHS_WEIGHTS.habits : 0;
}

export function consistencyBonus(subtotal: number): number {
  const rounded = Math.round(subtotal);
  return CONSISTENCY_STEPS.find(([min]) => rounded >= min)?.[1] ?? 0;
}

export function shsRating(score: number): ShsRatingKey {
  return SHS_RATINGS.find((r) => score >= r.min)?.key ?? 'awakening';
}

export function calculateShs(input: ShsInput): ShsResult {
  const salah = Math.min(SHS_WEIGHTS.salah, scoreSalahDay(input.salah).points);
  const nafl = naflPoints(input.salah);
  const dhikrCount = totalDhikrCount(input.dhikr);
  const dhikr = Math.min(
    SHS_WEIGHTS.dhikr,
    (dhikrCount / DHIKR_FULL_SCORE_COUNT) * SHS_WEIGHTS.dhikr,
  );
  const habits = habitPoints(input.date, input.habits);

  const subtotal = salah + nafl + dhikr + habits;
  const consistency = consistencyBonus(subtotal);
  const total = Math.min(100, subtotal + consistency);

  return {
    total: round1(total),
    breakdown: {
      salah: round1(salah),
      nafl: round1(nafl),
      dhikr: round1(dhikr),
      habits: round1(habits),
      consistency,
    },
    dhikrCount,
    dhikrLevel: Math.min(DHIKR_MAX_LEVEL, Math.floor(dhikrCount / DHIKR_LEVEL_STEP)),
    rating: shsRating(total),
  };
}
