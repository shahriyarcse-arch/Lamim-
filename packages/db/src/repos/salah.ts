/**
 * Salah repository. Writes are local-first (one small IndexedDB transaction);
 * clearing a status writes a tombstone instead of deleting, so sync can propagate it.
 */
import {
  isDateStr,
  PRAYER_NAMES,
  SALAH_STATUSES,
  type DateStr,
  type PrayerName,
  type SalahDayLog,
  type SalahStatus,
} from '@lamim/core';
import type { LamimDB, SalahEntry } from '../schema';
import { uuidv7 } from '../uuid';
import { enqueueSync, nextUpdatedAt } from './common';

export class SalahRepoError extends Error {
  override name = 'SalahRepoError';
}

export interface SetSalahStatusInput {
  profileId: string;
  date: DateStr;
  prayer: PrayerName;
  /** null clears the prayer (tombstone). */
  status: SalahStatus | null;
  now?: number;
}

function validate({ profileId, date, prayer, status }: SetSalahStatusInput): void {
  if (!profileId) throw new SalahRepoError('profileId is required');
  if (!isDateStr(date)) throw new SalahRepoError(`Invalid date: ${date}`);
  if (!(PRAYER_NAMES as readonly string[]).includes(prayer))
    throw new SalahRepoError(`Invalid prayer: ${prayer}`);
  if (status !== null && !(SALAH_STATUSES as readonly string[]).includes(status)) {
    throw new SalahRepoError(`Invalid status: ${String(status)}`);
  }
}

export async function setSalahStatus(db: LamimDB, input: SetSalahStatusInput): Promise<void> {
  validate(input);
  const { profileId, date, prayer, status } = input;
  const now = input.now ?? Date.now();

  await db.transaction('rw', db.salahEntries, db.syncQueue, async () => {
    const existing = await db.salahEntries
      .where('[profileId+date+prayer]')
      .equals([profileId, date, prayer])
      .first();

    if (existing) {
      const unchanged =
        status === null
          ? existing.deletedAt !== null
          : existing.deletedAt === null && existing.status === status;
      if (unchanged) return;
      const updatedAt = nextUpdatedAt(existing.updatedAt, now);
      await db.salahEntries.update(
        existing.id,
        status === null
          ? { deletedAt: updatedAt, updatedAt }
          : { status, deletedAt: null, updatedAt },
      );
      await enqueueSync(db, 'salahEntries', existing.id, status === null ? 'delete' : 'put', now);
      return;
    }

    if (status === null) return;
    const row: SalahEntry = {
      id: uuidv7(now),
      profileId,
      date,
      prayer,
      status,
      updatedAt: now,
      deletedAt: null,
    };
    await db.salahEntries.add(row);
    await enqueueSync(db, 'salahEntries', row.id, 'put', now);
  });
}

/** Live (non-tombstoned) statuses per date in [from, to], inclusive. */
export async function getSalahRange(
  db: LamimDB,
  profileId: string,
  from: DateStr,
  to: DateStr,
): Promise<Map<DateStr, SalahDayLog>> {
  const rows = await db.salahEntries
    .where('[profileId+date]')
    .between([profileId, from], [profileId, to], true, true)
    .toArray();
  const out = new Map<DateStr, Record<PrayerName, SalahStatus>>();
  for (const row of rows) {
    if (row.deletedAt !== null) continue;
    let day = out.get(row.date);
    if (!day) out.set(row.date, (day = {} as Record<PrayerName, SalahStatus>));
    day[row.prayer] = row.status;
  }
  return out;
}

export async function getSalahDay(
  db: LamimDB,
  profileId: string,
  date: DateStr,
): Promise<SalahDayLog> {
  return (await getSalahRange(db, profileId, date, date)).get(date) ?? {};
}
