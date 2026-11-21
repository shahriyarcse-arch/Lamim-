/**
 * Dhikr counts, fasting flag and Spirit Score inputs for one waking day.
 */
import { DHIKR_MAX_COUNT, isDateStr, type DateStr, type ShsInput } from '@lamim/core';
import { z } from 'zod';
import { GLOBAL_PROFILE_ID, type DhikrLog, type LamimDB, type SalahDay } from '../schema';
import { uuidv7 } from '../uuid';
import { enqueueSync, nextUpdatedAt } from './common';
import { getSalahDay } from './salah';

export class DailyRepoError extends Error {
  override name = 'DailyRepoError';
}

const PRESET_ID = /^[a-zA-Z0-9_-]{1,64}$/;

function assertDay(profileId: string, date: DateStr): void {
  if (!profileId) throw new DailyRepoError('profileId is required');
  if (!isDateStr(date)) throw new DailyRepoError(`Invalid date: ${date}`);
}

// ---- Dhikr ---------------------------------------------------------------------

export interface DhikrChange {
  profileId: string;
  date: DateStr;
  presetId: string;
  now?: number;
}

async function changeDhikr(
  db: LamimDB,
  input: DhikrChange,
  apply: (current: number) => number,
): Promise<number> {
  const { profileId, date, presetId } = input;
  assertDay(profileId, date);
  if (!PRESET_ID.test(presetId)) throw new DailyRepoError(`Invalid preset id: ${presetId}`);
  const now = input.now ?? Date.now();

  return db.transaction('rw', db.dhikrLogs, db.syncQueue, async () => {
    const row = await db.dhikrLogs.where('[profileId+date]').equals([profileId, date]).first();
    const current = row?.counts[presetId] ?? 0;
    const next = Math.min(DHIKR_MAX_COUNT, Math.max(0, apply(current)));
    if (row) {
      if (next === current) return current;
      await db.dhikrLogs.update(row.id, {
        counts: { ...row.counts, [presetId]: next },
        updatedAt: nextUpdatedAt(row.updatedAt, now),
      });
      await enqueueSync(db, 'dhikrLogs', row.id, 'put', now);
    } else {
      if (next === 0) return 0;
      const created: DhikrLog = {
        id: uuidv7(now),
        profileId,
        date,
        counts: { [presetId]: next },
        updatedAt: now,
        deletedAt: null,
      };
      await db.dhikrLogs.add(created);
      await enqueueSync(db, 'dhikrLogs', created.id, 'put', now);
    }
    return next;
  });
}

/** Atomic read-modify-write: concurrent taps and tabs never lose a count. */
export function incrementDhikr(db: LamimDB, input: DhikrChange & { by?: number }): Promise<number> {
  const by = input.by ?? 1;
  if (!Number.isInteger(by) || by < 1 || by > 1000)
    throw new DailyRepoError(`Invalid increment: ${by}`);
  return changeDhikr(db, input, (c) => c + by);
}

export function resetDhikr(db: LamimDB, input: DhikrChange): Promise<number> {
  return changeDhikr(db, input, () => 0);
}

export async function getDhikrCounts(
  db: LamimDB,
  profileId: string,
  date: DateStr,
): Promise<Record<string, number>> {
  const row = await db.dhikrLogs.where('[profileId+date]').equals([profileId, date]).first();
  return row && row.deletedAt === null ? row.counts : {};
}

const CustomPresetSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String).pipe(z.string().regex(PRESET_ID)),
  latin: z.string().trim().min(1).max(60),
  arabic: z.string().max(200).optional(),
  meaning: z.string().max(200).optional(),
  target: z.number().int().min(1).max(10_000).catch(33),
});
export type CustomDhikrPreset = z.infer<typeof CustomPresetSchema>;

/** Custom presets (imported from legacy, shared by all profiles). Invalid entries are skipped. */
export async function getCustomDhikrPresets(db: LamimDB): Promise<CustomDhikrPreset[]> {
  const entry = await db.kv
    .where('[profileId+key]')
    .equals([GLOBAL_PROFILE_ID, 'dhikr.presets'])
    .first();
  if (!entry || entry.deletedAt !== null || !Array.isArray(entry.value)) return [];
  return entry.value.flatMap((raw) => {
    const parsed = CustomPresetSchema.safeParse(raw);
    return parsed.success ? [parsed.data] : [];
  });
}

// ---- Fasting -------------------------------------------------------------------

export async function setFasting(
  db: LamimDB,
  input: { profileId: string; date: DateStr; fasting: boolean; now?: number },
): Promise<void> {
  const { profileId, date, fasting } = input;
  assertDay(profileId, date);
  const now = input.now ?? Date.now();
  await db.transaction('rw', db.salahDays, db.syncQueue, async () => {
    const row = await db.salahDays.where('[profileId+date]').equals([profileId, date]).first();
    if (row) {
      if ((row.fasting ?? false) === fasting) return;
      await db.salahDays.update(row.id, { fasting, updatedAt: nextUpdatedAt(row.updatedAt, now) });
      await enqueueSync(db, 'salahDays', row.id, 'put', now);
      return;
    }
    if (!fasting) return;
    const created: SalahDay = {
      id: uuidv7(now),
      profileId,
      date,
      jummah: false,
      tahajjud: false,
      tahajjudRakat: 0,
      witr: 0,
      sunnah: {},
      notes: {},
      fasting: true,
      updatedAt: now,
      deletedAt: null,
    };
    await db.salahDays.add(created);
    await enqueueSync(db, 'salahDays', created.id, 'put', now);
  });
}

export async function getSalahDayDetails(
  db: LamimDB,
  profileId: string,
  date: DateStr,
): Promise<SalahDay | undefined> {
  const row = await db.salahDays.where('[profileId+date]').equals([profileId, date]).first();
  return row && row.deletedAt === null ? row : undefined;
}

// ---- Spirit Score input ----------------------------------------------------------

/** Assembles the pure SHS input for one day from all modules (read-only). */
export async function getShsInput(
  db: LamimDB,
  profileId: string,
  date: DateStr,
): Promise<ShsInput> {
  assertDay(profileId, date);
  const [prayers, day, dhikr, habits] = await Promise.all([
    getSalahDay(db, profileId, date),
    getSalahDayDetails(db, profileId, date),
    getDhikrCounts(db, profileId, date),
    db.habits.where('profileId').equals(profileId).toArray(),
  ]);
  const live = habits.filter((h) => h.deletedAt === null);
  const events = live.length
    ? await db.habitEvents.where('[profileId+date]').equals([profileId, date]).toArray()
    : [];

  return {
    date,
    salah: {
      ...prayers,
      ...(day
        ? {
            sunnah: day.sunnah,
            tahajjud: day.tahajjud,
            tahajjud_rakat: day.tahajjudRakat,
            witr: day.witr,
          }
        : {}),
    },
    dhikr,
    habits: live.map((h) => ({
      startDate: h.startDate,
      history: events
        .filter((e) => e.habitId === h.id && e.deletedAt === null)
        .map((e) => ({ date: e.date, clean: e.type === 'clean' })),
    })),
  };
}
