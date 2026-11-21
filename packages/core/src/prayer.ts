/**
 * Astronomical prayer times — ported from legacy `Utils.calcPrayerTimes`.
 *
 * Model: low-precision solar position (USNO approximate algorithm, ~1 min accuracy)
 * with sun-altitude angles per calculation method, Hanafi or standard Asr shadow
 * factor, and the legacy high-latitude fallbacks (1/7-of-night for Fajr/Isha,
 * 48.5° latitude clamp for polar sunrise/sunset).
 *
 * Changes vs legacy:
 * - `D` is days since J2000 (legacy passed day-of-year, a small yearly drift).
 * - Output is UTC epoch ms, independent of the device time zone, for the calendar
 *   date at the location.
 * - Memoized per (date, lat, lng, method, asr school); never recomputed on UI ticks.
 */
import { addDays, julianDayNumber, type DateStr } from './date';

export const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export const CALCULATION_METHODS = {
  /** Muslim World League — legacy default. */
  MWL: { fajrAngle: 18, ishaAngle: 17 },
  /** University of Islamic Sciences, Karachi (common in Bangladesh/South Asia). */
  Karachi: { fajrAngle: 18, ishaAngle: 18 },
  /** Islamic Society of North America. */
  ISNA: { fajrAngle: 15, ishaAngle: 15 },
  /** Egyptian General Authority of Survey. */
  Egypt: { fajrAngle: 19.5, ishaAngle: 17.5 },
} as const satisfies Record<string, { fajrAngle: number; ishaAngle: number }>;

export type CalculationMethod = keyof typeof CALCULATION_METHODS;

/** Asr shadow factor: Hanafi = 2 (legacy default), Standard (Shafi'i/Maliki/Hanbali) = 1. */
export type AsrSchool = 'hanafi' | 'standard';

export interface PrayerTimesInput {
  /** Calendar date at the location. */
  readonly date: DateStr;
  readonly lat: number;
  readonly lng: number;
  readonly method?: CalculationMethod;
  readonly asr?: AsrSchool;
}

export interface PrayerSchedule {
  readonly date: DateStr;
  /** UTC epoch ms, rounded to the nearest minute. */
  readonly fajr: number;
  readonly sunrise: number;
  readonly dhuhr: number;
  readonly asr: number;
  readonly maghrib: number;
  readonly isha: number;
  /** Times derived from a high-latitude fallback rather than the sun angle. */
  readonly fallbacks: readonly ('fajr' | 'sunrise' | 'asr' | 'maghrib' | 'isha')[];
}

/**
 * Fallbacks used by `getPrayerTimes` when a caller omits method/asr. They match the
 * legacy app (MWL + Hanafi) and are what imported legacy profiles are pinned to.
 * New profiles get their defaults from `resolveDefaultPrayerSettings` instead.
 */
export const DEFAULT_METHOD: CalculationMethod = 'MWL';
export const DEFAULT_ASR_SCHOOL: AsrSchool = 'hanafi';

export interface PrayerSettings {
  readonly method: CalculationMethod;
  readonly asr: AsrSchool;
}

/** Settings the legacy app always used; written explicitly for imported profiles. */
export const LEGACY_PRAYER_SETTINGS: PrayerSettings = { method: 'MWL', asr: 'hanafi' };

/** Bangladesh bounding box (also covers adjacent Indian border districts, which share the convention). */
const BANGLADESH_BOUNDS = { minLat: 20.59, maxLat: 26.64, minLng: 88.0, maxLng: 92.68 } as const;

export function isInBangladeshRegion(lat: number, lng: number): boolean {
  const b = BANGLADESH_BOUNDS;
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng;
}

export interface PrayerDefaultsContext {
  /** IANA zone, e.g. Intl.DateTimeFormat().resolvedOptions().timeZone. */
  readonly timeZone?: string | null;
  readonly lat?: number | null;
  readonly lng?: number | null;
}

/**
 * Defaults for a NEW profile: Karachi + Hanafi in Bangladesh (by zone or
 * coordinates), otherwise MWL + standard Asr. The user can override in settings.
 */
export function resolveDefaultPrayerSettings(ctx: PrayerDefaultsContext = {}): PrayerSettings {
  const { timeZone, lat, lng } = ctx;
  const inBangladesh =
    timeZone === 'Asia/Dhaka' ||
    timeZone === 'Asia/Dacca' ||
    (typeof lat === 'number' &&
      typeof lng === 'number' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      isInBangladeshRegion(lat, lng));
  return inBangladesh ? { method: 'Karachi', asr: 'hanafi' } : { method: 'MWL', asr: 'standard' };
}

const DEG = Math.PI / 180;
const MS_PER_HOUR = 3_600_000;
const MS_PER_MINUTE = 60_000;
const SUN_HORIZON_ANGLE = -0.833; // refraction + solar semi-diameter
const POLAR_SAFE_LATITUDE = 48.5;

function validate(input: PrayerTimesInput): void {
  const { lat, lng, method = DEFAULT_METHOD } = input;
  if (!Number.isFinite(lat) || lat < -90 || lat > 90)
    throw new RangeError(`Invalid latitude: ${lat}`);
  if (!Number.isFinite(lng) || lng < -180 || lng > 180)
    throw new RangeError(`Invalid longitude: ${lng}`);
  if (!Object.hasOwn(CALCULATION_METHODS, method))
    throw new RangeError(`Unknown calculation method: ${method}`);
}

function compute(input: PrayerTimesInput): PrayerSchedule {
  const { date, lat, lng, method = DEFAULT_METHOD, asr: asrSchool = DEFAULT_ASR_SCHOOL } = input;
  const { fajrAngle, ishaAngle } = CALCULATION_METHODS[method];

  // Days since J2000.0 at local solar noon.
  const jdn = julianDayNumber(date);
  const D = jdn - lng / 360 - 2_451_545;

  const g = (357.529 + 0.98560028 * D) * DEG; // mean anomaly
  const q = 280.459 + 0.98564736 * D; // mean longitude (deg)
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG; // ecliptic longitude
  const e = (23.439 - 0.00000036 * D) * DEG; // obliquity
  const decl = Math.asin(Math.sin(e) * Math.sin(L));
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / DEG; // deg
  const eqtRaw = ((((q - ra) * 4) % 1440) + 1440) % 1440; // minutes
  const eqt = eqtRaw > 720 ? eqtRaw - 1440 : eqtRaw;

  const dhuhr = 12 - lng / 15 - eqt / 60; // UTC hours
  const latRad = lat * DEG;

  const hourAngle = (altitudeDeg: number, latitude = latRad): number | null => {
    const cosHA =
      (Math.sin(altitudeDeg * DEG) - Math.sin(latitude) * Math.sin(decl)) /
      (Math.cos(latitude) * Math.cos(decl));
    if (cosHA > 1 || cosHA < -1) return null;
    return Math.acos(cosHA) / DEG / 15;
  };

  const fallbacks: PrayerSchedule['fallbacks'][number][] = [];

  let sunriseHA = hourAngle(SUN_HORIZON_ANGLE);
  if (sunriseHA === null) {
    // Polar day/night: evaluate at a clamped latitude, keeping hemisphere.
    const safeLat = Math.sign(lat || 1) * Math.min(Math.abs(lat), POLAR_SAFE_LATITUDE) * DEG;
    const cos =
      (Math.sin(SUN_HORIZON_ANGLE * DEG) - Math.sin(safeLat) * Math.sin(decl)) /
      (Math.cos(safeLat) * Math.cos(decl));
    sunriseHA = Math.acos(Math.max(-1, Math.min(1, cos))) / DEG / 15;
    fallbacks.push('sunrise', 'maghrib');
  }

  const nightHours = Math.max(2, 24 - 2 * sunriseHA);

  const fajrHA = hourAngle(-fajrAngle);
  const fajr = fajrHA !== null ? dhuhr - fajrHA : dhuhr - sunriseHA - nightHours / 7;
  if (fajrHA === null) fallbacks.push('fajr');

  const shadowFactor = asrSchool === 'hanafi' ? 2 : 1;
  const asrAltitude = Math.atan(1 / (shadowFactor + Math.tan(Math.abs(latRad - decl)))) / DEG;
  let asrHA = hourAngle(asrAltitude);
  if (asrHA === null) {
    asrHA = sunriseHA * 0.6;
    fallbacks.push('asr');
  }

  const ishaHA = hourAngle(-ishaAngle);
  const isha = ishaHA !== null ? dhuhr + ishaHA : dhuhr + sunriseHA + nightHours / 7;
  if (ishaHA === null) fallbacks.push('isha');

  const midnightUtc = (jdn - 2_440_588) * 86_400_000;
  const at = (hours: number) =>
    Math.round((midnightUtc + hours * MS_PER_HOUR) / MS_PER_MINUTE) * MS_PER_MINUTE;

  return Object.freeze({
    date,
    fajr: at(fajr),
    sunrise: at(dhuhr - sunriseHA),
    dhuhr: at(dhuhr),
    asr: at(dhuhr + asrHA),
    maghrib: at(dhuhr + sunriseHA),
    isha: at(isha),
    fallbacks: Object.freeze(fallbacks),
  });
}

// ---- Memoization (bounded LRU) ---------------------------------------------

const CACHE_LIMIT = 64;
const cache = new Map<string, PrayerSchedule>();

function cacheKey(i: PrayerTimesInput): string {
  return [
    i.date,
    i.lat.toFixed(5),
    i.lng.toFixed(5),
    i.method ?? DEFAULT_METHOD,
    i.asr ?? DEFAULT_ASR_SCHOOL,
  ].join('|');
}

/** Prayer times for one date and place. Memoized: repeated calls return the same frozen object. */
export function getPrayerTimes(input: PrayerTimesInput): PrayerSchedule {
  validate(input);
  const key = cacheKey(input);
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key); // refresh LRU position
    cache.set(key, hit);
    return hit;
  }
  const schedule = compute(input);
  cache.set(key, schedule);
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value as string);
  return schedule;
}

export function clearPrayerTimesCache(): void {
  cache.clear();
}

export function prayerTimesCacheSize(): number {
  return cache.size;
}

// ---- Next prayer & countdown -------------------------------------------------

export interface NextPrayer {
  readonly name: PrayerName;
  readonly at: number;
  /** True when the next prayer is tomorrow's Fajr. */
  readonly isTomorrow: boolean;
}

/**
 * The next obligatory prayer strictly after `nowMs`. After Isha it is tomorrow's
 * Fajr computed for tomorrow's date (legacy approximated it as today's Fajr + 24 h).
 */
export function getNextPrayer(input: PrayerTimesInput, nowMs: number): NextPrayer {
  const today = getPrayerTimes(input);
  for (const name of PRAYER_NAMES) {
    if (today[name] > nowMs) return { name, at: today[name], isTomorrow: false };
  }
  const tomorrow = getPrayerTimes({ ...input, date: addDays(input.date, 1) });
  return { name: 'fajr', at: tomorrow.fajr, isTomorrow: true };
}

/** The obligatory prayer whose time is currently running, or null before Fajr. */
export function getCurrentPrayer(schedule: PrayerSchedule, nowMs: number): PrayerName | null {
  let current: PrayerName | null = null;
  for (const name of PRAYER_NAMES) {
    if (schedule[name] <= nowMs) current = name;
  }
  return current;
}

export interface Countdown {
  readonly totalMs: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

export function countdown(targetMs: number, nowMs: number): Countdown {
  // Round up to whole seconds so the display never shows 00:00:00 while time remains.
  const totalMs = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.ceil(totalMs / 1000);
  return {
    totalMs,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function formatCountdown(c: Countdown): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(c.hours)}:${p(c.minutes)}:${p(c.seconds)}`;
}

// ---- Ticker ------------------------------------------------------------------

interface TimerHost {
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

export interface CountdownTickerOptions {
  readonly target: number;
  readonly onTick: (c: Countdown) => void;
  readonly onComplete?: () => void;
  /** Injectable clock and timers (tests, workers). Default: Date.now and global timers. */
  readonly now?: () => number;
  readonly timers?: TimerHost;
}

export interface CountdownTicker {
  stop(): void;
}

/**
 * Emits a countdown immediately and then on each whole-second boundary until the
 * target, then calls `onComplete`. Only reads the clock — no astronomy per tick.
 */
export function createCountdownTicker(options: CountdownTickerOptions): CountdownTicker {
  const now = options.now ?? (() => Date.now());
  const timers = options.timers ?? (globalThis as unknown as TimerHost);
  let handle: unknown = null;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    const c = countdown(options.target, now());
    options.onTick(c);
    if (c.totalMs <= 0) {
      stopped = true;
      options.onComplete?.();
      return;
    }
    const delay = c.totalMs % 1000 || 1000;
    handle = timers.setTimeout(tick, delay);
  };

  tick();
  return {
    stop() {
      stopped = true;
      if (handle !== null) timers.clearTimeout(handle);
    },
  };
}
