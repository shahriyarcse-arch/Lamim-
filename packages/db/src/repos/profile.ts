/**
 * Profile details (name, gender). Profiles are not per-profile scoped rows, so they
 * sync by their own id.
 */
import { z } from 'zod';
import type { LamimDB, Profile } from '../schema';
import { enqueueSync, nextUpdatedAt } from './common';

export class ProfileError extends Error {
  override name = 'ProfileError';
}

export const GENDERS = ['male', 'female'] as const;
export type Gender = (typeof GENDERS)[number];

const PatchSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .max(60, 'Name must be at most 60 characters'),
    /** null = prefer not to say. */
    gender: z.enum(GENDERS).nullable(),
  })
  .partial()
  .strict();

export type ProfilePatch = z.input<typeof PatchSchema>;

export async function getProfile(db: LamimDB, profileId: string): Promise<Profile | undefined> {
  const p = await db.profiles.get(profileId);
  return p && p.deletedAt === null ? p : undefined;
}

export async function updateProfile(
  db: LamimDB,
  profileId: string,
  patch: ProfilePatch,
  now: number = Date.now(),
): Promise<Profile> {
  const parsed = PatchSchema.safeParse(patch);
  if (!parsed.success) throw new ProfileError(parsed.error.issues.map((i) => i.message).join('; '));
  return db.transaction('rw', db.profiles, db.syncQueue, async () => {
    const current = await getProfile(db, profileId);
    if (!current) throw new ProfileError('Profile not found');
    const changes: Partial<Pick<Profile, 'name' | 'gender' | 'updatedAt'>> = {
      updatedAt: nextUpdatedAt(current.updatedAt, now),
    };
    if (parsed.data.name !== undefined) changes.name = parsed.data.name;
    if (parsed.data.gender !== undefined) changes.gender = parsed.data.gender;
    await db.profiles.update(profileId, changes);
    await enqueueSync(db, 'profiles', profileId, 'put', now);
    return { ...current, ...changes } as Profile;
  });
}
