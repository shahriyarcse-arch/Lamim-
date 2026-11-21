/**
 * Account linking decisions that run once after sign-in.
 *
 * Sign-in on a fresh or wiped browser: bootstrap already created an empty "Guest"
 * profile. After the first pull brings the user's real profile, switch to it and
 * remove the untouched guest. A guest that holds real data is never removed — it is
 * uploaded into the account instead (guest → cloud linking).
 */
import { SYNC_TABLES } from '@lamim/sync-protocol';
import type { LamimDB } from '../schema';

const DATA_TABLES = SYNC_TABLES.filter((t) => t !== 'profiles' && t !== 'settings');

/** True when the profile has nothing but its profile + settings rows. */
export async function isEmptyGuest(db: LamimDB, profileId: string): Promise<boolean> {
  for (const table of DATA_TABLES) {
    const count = await db
      .table(table)
      .where('profileId')
      .equals(profileId)
      .count()
      .catch(async () =>
        // tables without a plain profileId index (compound only)
        db
          .table(table)
          .filter((r: { profileId?: string }) => r.profileId === profileId)
          .count(),
      );
    if (count > 0) return false;
  }
  return true;
}

/**
 * After the first pull: if the active profile is an untouched guest and the account
 * brought other profiles, activate the most recently updated one and delete the
 * guest locally (it never reached the server). Returns the new active id, or null.
 */
export async function adoptRemoteProfile(
  db: LamimDB,
  activeProfileId: string,
): Promise<string | null> {
  if (!(await isEmptyGuest(db, activeProfileId))) return null;
  const others = (await db.profiles.toArray()).filter(
    (p) => p.id !== activeProfileId && p.deletedAt === null,
  );
  if (others.length === 0) return null;
  const chosen = others.sort((a, b) => b.updatedAt - a.updatedAt)[0]!;

  await db.transaction('rw', [db.profiles, db.settings, db.meta, db.syncQueue], async () => {
    const guestSettings = await db.settings.where('profileId').equals(activeProfileId).toArray();
    await db.settings.bulkDelete(guestSettings.map((s) => s.id));
    await db.profiles.delete(activeProfileId);
    await db.syncQueue
      .filter((q) => q.rowId === activeProfileId || guestSettings.some((s) => s.id === q.rowId))
      .delete();
    await db.meta.put({ key: 'activeProfileId', value: chosen.id });
  });
  return chosen.id;
}
