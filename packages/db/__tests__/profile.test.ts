import { describe, expect, it } from 'vitest';
import { bootstrap } from '../src/repos/bootstrap';
import { getProfile, ProfileError, updateProfile } from '../src/repos/profile';
import { freshEnv } from './fixtures';

const noLegacy = { readSources: async () => [] };

describe('updateProfile', () => {
  it('updates name and gender, trims, bumps updatedAt and enqueues sync', async () => {
    const { db } = freshEnv();
    const { profileId } = await bootstrap(db, { import: noLegacy, now: 1000 });
    const p = await updateProfile(db, profileId, { name: '  Amina  ', gender: 'female' }, 2000);
    expect(p).toMatchObject({ name: 'Amina', gender: 'female', updatedAt: 2000 });
    expect(await getProfile(db, profileId)).toMatchObject({ name: 'Amina', gender: 'female' });
    expect(
      (await db.syncQueue.toArray()).some((q) => q.table === 'profiles' && q.rowId === profileId),
    ).toBe(true);
  });

  it('gender can be cleared (prefer not to say) and fields are independent', async () => {
    const { db } = freshEnv();
    const { profileId } = await bootstrap(db, { import: noLegacy });
    await updateProfile(db, profileId, { gender: 'male' });
    await updateProfile(db, profileId, { gender: null });
    expect(await getProfile(db, profileId)).toMatchObject({ name: 'Guest', gender: null });
  });

  it.each([
    [{ name: '   ' }, /required/],
    [{ name: 'x'.repeat(61) }, /60/],
    [{ gender: 'other' }, ProfileError],
    [{ dob: '2000-01-01' }, ProfileError],
  ])('rejects %o', async (patch, error) => {
    const { db } = freshEnv();
    const { profileId } = await bootstrap(db, { import: noLegacy });
    await expect(updateProfile(db, profileId, patch as never)).rejects.toThrow(error as never);
    expect(await getProfile(db, profileId)).toMatchObject({ name: 'Guest' });
  });

  it('rejects unknown or deleted profiles', async () => {
    const { db } = freshEnv();
    await expect(updateProfile(db, 'missing', { name: 'A' })).rejects.toThrow(/not found/);
    const { profileId } = await bootstrap(db, { import: noLegacy });
    await db.profiles.update(profileId, { deletedAt: 5 });
    await expect(updateProfile(db, profileId, { name: 'A' })).rejects.toThrow(/not found/);
  });
});
