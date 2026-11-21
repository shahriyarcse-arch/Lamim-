/**
 * Calendar-date primitives and the 3:00 AM "waking day" boundary.
 *
 * Every per-day record in Lamim is keyed by a `DateStr` ("YYYY-MM-DD"). A user who
 * logs Isha at 01:30 is still in the previous day, so "today" rolls over at 03:00
 * local time, not midnight (ported from legacy `Utils.getOffsetDate`).
 *
 * Date arithmetic is done on plain calendar dates via UTC so DST changes can never
 * skip or repeat a day.
 */

/** Calendar date in ISO form, e.g. "2026-11-21". */
export type DateStr = string;

/** Hour (local wall clock) at which a new waking day begins. */
export const DAY_BOUNDARY_HOUR = 3;

const MS_PER_DAY = 86_400_000;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface CalendarDate {
  readonly year: number;
  readonly month: number; // 1–12
  readonly day: number; // 1–31
}

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0');
}

/** Strictly parse "YYYY-MM-DD". Returns null for malformed or impossible dates (e.g. 2026-02-30). */
export function parseDateStr(value: string): CalendarDate | null {
  const m = DATE_RE.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1) return null;
  if (day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function isDateStr(value: unknown): value is DateStr {
  return typeof value === 'string' && parseDateStr(value) !== null;
}

function requireDate(value: DateStr): CalendarDate {
  const parsed = parseDateStr(value);
  if (!parsed) throw new RangeError(`Invalid date string: "${value}" (expected YYYY-MM-DD)`);
  return parsed;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function formatDateStr({ year, month, day }: CalendarDate): DateStr {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** UTC epoch ms of the calendar date's midnight (a stable day index, not a local instant). */
function toUtcMs(value: DateStr): number {
  const { year, month, day } = requireDate(value);
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day); // setUTCFullYear handles years 0–99 correctly
  return d.getTime();
}

function fromUtcMs(ms: number): DateStr {
  const d = new Date(ms);
  return formatDateStr({
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  });
}

/** Add (or subtract) whole calendar days. */
export function addDays(value: DateStr, days: number): DateStr {
  if (!Number.isInteger(days)) throw new RangeError(`addDays expects an integer, got ${days}`);
  return fromUtcMs(toUtcMs(value) + days * MS_PER_DAY);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: DateStr, to: DateStr): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

/** Chronological comparator; ISO date strings sort lexicographically. */
export function compareDateStr(a: DateStr, b: DateStr): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(value: DateStr): number {
  return new Date(toUtcMs(value)).getUTCDay();
}

/** Julian Day Number (the integer JD whose noon falls on this civil date). */
export function julianDayNumber(value: DateStr): number {
  return Math.floor(toUtcMs(value) / MS_PER_DAY) + 2_440_588;
}

/**
 * Local calendar date of an instant. With `timeZone` (IANA, e.g. "Asia/Dhaka") the
 * result is deterministic; without it the runtime's local zone is used.
 */
export function localDateStr(instant: Date | number, timeZone?: string): DateStr {
  const date = typeof instant === 'number' ? new Date(instant) : instant;
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid instant');
  if (!timeZone) {
    return formatDateStr({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return formatDateStr({ year: get('year'), month: get('month'), day: get('day') });
}

/**
 * The waking day an instant belongs to: before 03:00 local time it is still the
 * previous calendar day.
 */
export function wakingDateStr(now: Date | number = Date.now(), timeZone?: string): DateStr {
  const ms = typeof now === 'number' ? now : now.getTime();
  return localDateStr(ms - DAY_BOUNDARY_HOUR * 3_600_000, timeZone);
}
