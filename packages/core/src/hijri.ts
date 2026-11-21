/**
 * Tabular (arithmetic) Hijri calendar — ported from legacy `Utils.toHijri`
 * (the "Kuwaiti algorithm": 30-year cycle, 11 leap years).
 *
 * Fix vs legacy: the Julian Day is derived from the civil date string, not from the
 * UTC epoch of a local `Date`, which returned the previous day east of UTC before
 * local 06:00 (Dhaka).
 *
 * Tabular dates can differ from local moon sighting by ±1–2 days; users correct this
 * with `offsetDays` (legacy `settings.hijriOffset`).
 */
import { julianDayNumber, type DateStr } from './date';

export interface HijriDate {
  readonly year: number;
  readonly month: number; // 1–12
  readonly day: number; // 1–30
}

/** Stable keys for translation lookup, index = month - 1. */
export const HIJRI_MONTH_KEYS = [
  'muharram',
  'safar',
  'rabi_al_awwal',
  'rabi_al_thani',
  'jumada_al_awwal',
  'jumada_al_thani',
  'rajab',
  'shaban',
  'ramadan',
  'shawwal',
  'dhu_al_qidah',
  'dhu_al_hijjah',
] as const;

export type HijriMonthKey = (typeof HIJRI_MONTH_KEYS)[number];

const MAX_OFFSET_DAYS = 3;

export function toHijri(date: DateStr, offsetDays = 0): HijriDate {
  if (!Number.isInteger(offsetDays) || Math.abs(offsetDays) > MAX_OFFSET_DAYS) {
    throw new RangeError(
      `Hijri offset must be an integer within ±${MAX_OFFSET_DAYS}, got ${offsetDays}`,
    );
  }
  const jd = julianDayNumber(date) + offsetDays;
  if (jd < 1_948_440) throw new RangeError(`Date precedes the Hijri epoch: ${date}`);

  let l = jd - 1_948_440 + 10_632;
  const n = Math.floor((l - 1) / 10_631);
  l = l - 10_631 * n + 354;
  const j =
    Math.floor((10_985 - l) / 5_316) * Math.floor((50 * l) / 17_719) +
    Math.floor(l / 5_670) * Math.floor((43 * l) / 15_238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17_719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15_238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

export function hijriMonthKey(month: number): HijriMonthKey {
  const key = HIJRI_MONTH_KEYS[month - 1];
  if (!key) throw new RangeError(`Hijri month out of range: ${month}`);
  return key;
}
