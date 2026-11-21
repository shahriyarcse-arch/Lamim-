/**
 * App boot: run the one-time legacy import, then resolve the active profile.
 * A guest profile is created only when there is genuinely no data — never after
 * a failed import (the error propagates so the UI can offer a retry instead).
 */
import { resolveDefaultPrayerSettings } from '@lamim/core';
import { runLegacyImport, type ImportOptions, type ImportResult } from '../legacy/importer';
import type { LamimDB, Profile, Settings } from '../schema';
import { uuidv7 } from '../uuid';

export interface BootstrapOptions {
  /** Device IANA zone, used for new-profile prayer defaults. */
  timeZone?: string | null;
  defaultName?: string;
  import?: ImportOptions;
  now?: number;
}

export interface BootstrapResult {
  profileId: string;
  importResult: ImportResult;
  createdGuest: boolean;
}

export async function bootstrap(
  db: LamimDB,
  options: BootstrapOptions = {},
): Promise<BootstrapResult> {
  const importResult = await runLegacyImport(db, options.import);
  const now = options.now ?? Date.now();

  let createdGuest = false;
  const profileId = await db.transaction('rw', db.profiles, db.settings, db.meta, async () => {
    const activeId = (await db.meta.get('activeProfileId'))?.value;
    if (typeof activeId === 'string') {
      const active = await db.profiles.get(activeId);
      if (active && active.deletedAt === null) return active.id;
    }

    const live = (await db.profiles.toArray()).filter((p) => p.deletedAt === null);
    const existing = live.sort((a, b) => b.updatedAt - a.updatedAt)[0];
    if (existing) {
      await db.meta.put({ key: 'activeProfileId', value: existing.id });
      return existing.id;
    }

    const prayer = resolveDefaultPrayerSettings({ timeZone: options.timeZone ?? null });
    const profile: Profile = {
      id: uuidv7(now),
      name: options.defaultName ?? 'Guest',
      gender: null,
      dob: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const settings: Settings = {
      id: uuidv7(now),
      profileId: profile.id,
      updatedAt: now,
      deletedAt: null,
      lang: 'en',
      currency: options.timeZone === 'Asia/Dhaka' ? 'BDT' : 'USD',
      lat: null,
      lng: null,
      locationName: null,
      method: prayer.method,
      asr: prayer.asr,
      hijriOffset: 0,
      theme: 'system',
    };
    await db.profiles.add(profile);
    await db.settings.add(settings);
    await db.meta.put({ key: 'activeProfileId', value: profile.id });
    createdGuest = true;
    return profile.id;
  });

  return { profileId, importResult, createdGuest };
}
