import { CALCULATION_METHODS, isCurrency } from '@lamim/core';
import { z } from 'zod';
import type { LamimDB, Settings } from '../schema';
import { enqueueSync, nextUpdatedAt } from './common';

export class SettingsRepoError extends Error {
  override name = 'SettingsRepoError';
}

const SettingsPatchSchema = z
  .object({
    lang: z.enum(['en', 'bn']),
    currency: z.string().refine(isCurrency, 'unsupported currency'),
    lat: z.number().min(-90).max(90).nullable(),
    lng: z.number().min(-180).max(180).nullable(),
    locationName: z.string().max(120).nullable(),
    method: z.string().refine((m) => Object.hasOwn(CALCULATION_METHODS, m), 'unknown method'),
    asr: z.enum(['hanafi', 'standard']),
    hijriOffset: z.number().int().min(-3).max(3),
    theme: z.enum(['light', 'dark', 'system']),
  })
  .partial()
  .strict();

export type SettingsPatch = Partial<
  Pick<
    Settings,
    | 'lang'
    | 'currency'
    | 'lat'
    | 'lng'
    | 'locationName'
    | 'method'
    | 'asr'
    | 'hijriOffset'
    | 'theme'
  >
>;

export async function getSettings(db: LamimDB, profileId: string): Promise<Settings | undefined> {
  return db.settings.where('profileId').equals(profileId).first();
}

/** Validated partial update; rejects unknown keys and out-of-range values. */
export async function updateSettings(
  db: LamimDB,
  profileId: string,
  patch: SettingsPatch,
  now: number = Date.now(),
): Promise<void> {
  const parsed = SettingsPatchSchema.safeParse(patch);
  if (!parsed.success) {
    throw new SettingsRepoError(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    );
  }
  await db.transaction('rw', db.settings, db.syncQueue, async () => {
    const current = await getSettings(db, profileId);
    if (!current) throw new SettingsRepoError(`No settings for profile ${profileId}`);
    await db.settings.update(current.id, {
      ...(parsed.data as SettingsPatch),
      updatedAt: nextUpdatedAt(current.updatedAt, now),
    });
    await enqueueSync(db, 'settings', current.id, 'put', now);
  });
}
