import { describe, expect, it } from 'vitest';
import type { SalahStatus } from '@lamim/core';
import { bootstrap } from '../src/repos/bootstrap';
import { getSalahDay, getSalahRange, SalahRepoError, setSalahStatus } from '../src/repos/salah';
import { getSettings, SettingsRepoError, updateSettings } from '../src/repos/settings';
import { A, freshEnv, LEGACY_IDB, seedLegacyIDB } from './fixtures';

const noLegacy = { readSources: async () => [] };
const P = 'profile-1';

describe('setSalahStatus / getSalahRange', () => {
  it('creates, changes and reads a status', async () => {
    const { db } = freshEnv();
    await setSalahStatus(db, {
      profileId: P,
      date: '2026-11-21',
      prayer: 'fajr',
      status: 'jamaat',
      now: 1000,
    });
    await setSalahStatus(db, {
      profileId: P,
      date: '2026-11-21',
      prayer: 'dhuhr',
      status: 'alone',
      now: 1001,
    });
    expect(await getSalahDay(db, P, '2026-11-21')).toEqual({ fajr: 'jamaat', dhuhr: 'alone' });

    await setSalahStatus(db, {
      profileId: P,
      date: '2026-11-21',
      prayer: 'fajr',
      status: 'qaza',
      now: 1002,
    });
    expect(await getSalahDay(db, P, '2026-11-21')).toEqual({ fajr: 'qaza', dhuhr: 'alone' });
    expect(await db.salahEntries.count()).toBe(2); // updated in place, unique per prayer
  });

  it('clearing writes a tombstone that is hidden from reads and revivable', async () => {
    const { db } = freshEnv();
    const base = { profileId: P, date: '2026-11-21', prayer: 'asr' as const };
    await setSalahStatus(db, { ...base, status: 'alone', now: 1000 });
    await setSalahStatus(db, { ...base, status: null, now: 2000 });
    expect(await getSalahDay(db, P, '2026-11-21')).toEqual({});
    const [row] = await db.salahEntries.toArray();
    expect(row).toMatchObject({ deletedAt: 2000, updatedAt: 2000 });

    await setSalahStatus(db, { ...base, status: 'jamaat', now: 3000 });
    expect(await getSalahDay(db, P, '2026-11-21')).toEqual({ asr: 'jamaat' });
    expect(await db.salahEntries.count()).toBe(1);
  });

  it('updatedAt is strictly increasing even if the clock goes backwards', async () => {
    const { db } = freshEnv();
    const base = { profileId: P, date: '2026-11-21', prayer: 'isha' as const };
    await setSalahStatus(db, { ...base, status: 'alone', now: 5000 });
    await setSalahStatus(db, { ...base, status: 'jamaat', now: 4000 });
    expect((await db.salahEntries.toArray())[0]!.updatedAt).toBe(5001);
  });

  it('no-op writes do not touch the row or the sync queue', async () => {
    const { db } = freshEnv();
    const base = { profileId: P, date: '2026-11-21', prayer: 'fajr' as const };
    await setSalahStatus(db, { ...base, status: 'jamaat', now: 1000 });
    await setSalahStatus(db, { ...base, status: 'jamaat', now: 2000 });
    await setSalahStatus(db, { ...base, prayer: 'dhuhr', status: null, now: 3000 }); // clear non-existent
    expect((await db.salahEntries.toArray())[0]!.updatedAt).toBe(1000);
    expect(await db.salahEntries.count()).toBe(1);
    expect(await db.syncQueue.count()).toBe(1);
  });

  it('coalesces pending sync items per row', async () => {
    const { db } = freshEnv();
    const base = { profileId: P, date: '2026-11-21', prayer: 'fajr' as const };
    await setSalahStatus(db, { ...base, status: 'jamaat', now: 1000 });
    await setSalahStatus(db, { ...base, status: 'alone', now: 1001 });
    await setSalahStatus(db, { ...base, status: null, now: 1002 });
    const queue = await db.syncQueue.toArray();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ table: 'salahEntries', op: 'delete', createdAt: 1002 });
  });

  it('range reads are scoped to profile and inclusive bounds', async () => {
    const { db } = freshEnv();
    for (const [pid, date] of [
      [P, '2026-11-01'],
      [P, '2026-11-10'],
      [P, '2026-11-21'],
      ['other', '2026-11-10'],
    ] as const) {
      await setSalahStatus(db, { profileId: pid, date, prayer: 'fajr', status: 'jamaat' });
    }
    const range = await getSalahRange(db, P, '2026-11-01', '2026-11-10');
    expect([...range.keys()].sort()).toEqual(['2026-11-01', '2026-11-10']);
  });

  it.each([
    [{ date: '2026-02-30' }, /Invalid date/],
    [{ prayer: 'tahajjud' }, /Invalid prayer/],
    [{ status: 'prayed' }, /Invalid status/],
    [{ profileId: '' }, /profileId/],
  ])('rejects invalid input %o', async (override, message) => {
    const { db } = freshEnv();
    const input = {
      profileId: P,
      date: '2026-11-21',
      prayer: 'fajr',
      status: 'jamaat' as SalahStatus,
      ...override,
    };
    await expect(setSalahStatus(db, input as Parameters<typeof setSalahStatus>[1])).rejects.toThrow(
      SalahRepoError,
    );
    await expect(setSalahStatus(db, input as Parameters<typeof setSalahStatus>[1])).rejects.toThrow(
      message,
    );
    expect(await db.salahEntries.count()).toBe(0);
  });
});

describe('bootstrap', () => {
  it('creates a guest with Bangladesh defaults when there is no data', async () => {
    const { db } = freshEnv();
    const res = await bootstrap(db, { timeZone: 'Asia/Dhaka', import: noLegacy, now: 1000 });
    expect(res).toMatchObject({ createdGuest: true, importResult: { status: 'no-legacy-data' } });
    expect(await getSettings(db, res.profileId)).toMatchObject({
      method: 'Karachi',
      asr: 'hanafi',
      currency: 'BDT',
      theme: 'system',
    });
    expect((await db.meta.get('activeProfileId'))?.value).toBe(res.profileId);
  });

  it('uses MWL + standard elsewhere', async () => {
    const { db } = freshEnv();
    const res = await bootstrap(db, { timeZone: 'Europe/London', import: noLegacy });
    expect(await getSettings(db, res.profileId)).toMatchObject({
      method: 'MWL',
      asr: 'standard',
      currency: 'USD',
    });
  });

  it('is stable across boots (no second guest)', async () => {
    const { db } = freshEnv();
    const first = await bootstrap(db, { import: noLegacy });
    const second = await bootstrap(db, { import: noLegacy });
    expect(second).toMatchObject({
      profileId: first.profileId,
      createdGuest: false,
      importResult: { status: 'already-migrated' },
    });
    expect(await db.profiles.count()).toBe(1);
  });

  it('activates the imported legacy profile instead of creating a guest', async () => {
    const { db, factory } = freshEnv();
    await seedLegacyIDB(factory, LEGACY_IDB);
    const res = await bootstrap(db, {
      import: {
        indexedDB: factory,
        localStorage: { length: 0, key: () => null, getItem: () => null },
      },
    });
    expect(res.createdGuest).toBe(false);
    expect((await db.profiles.get(res.profileId))?.legacyId).toBe(A);
  });

  it('falls back to the most recently updated live profile when the active one is gone', async () => {
    const { db } = freshEnv();
    const { profileId } = await bootstrap(db, { import: noLegacy, now: 1000 });
    await db.profiles.update(profileId, { deletedAt: 2000 });
    await db.profiles.add({
      id: 'p2',
      name: 'Two',
      gender: null,
      dob: null,
      createdAt: 1,
      updatedAt: 3000,
      deletedAt: null,
    });
    expect((await bootstrap(db, { import: noLegacy })).profileId).toBe('p2');
  });

  it('never creates a guest when the import fails', async () => {
    const { db } = freshEnv();
    await expect(
      bootstrap(db, {
        import: {
          readSources: async () => {
            throw new Error('legacy read failed');
          },
        },
      }),
    ).rejects.toThrow('legacy read failed');
    expect(await db.profiles.count()).toBe(0);
  });
});

describe('updateSettings', () => {
  it('applies a validated patch and enqueues sync', async () => {
    const { db } = freshEnv();
    const { profileId } = await bootstrap(db, { import: noLegacy, now: 1000 });
    await updateSettings(db, profileId, { theme: 'dark', lat: 23.8, lng: 90.4 }, 2000);
    expect(await getSettings(db, profileId)).toMatchObject({
      theme: 'dark',
      lat: 23.8,
      lng: 90.4,
      updatedAt: 2000,
    });
    expect((await db.syncQueue.toArray()).some((q) => q.table === 'settings')).toBe(true);
  });

  it.each([
    { theme: 'neon' },
    { lat: 91 },
    { hijriOffset: 4 },
    { method: 'Nope' },
    { currency: 'EUR' },
    { unknownKey: 1 },
  ])('rejects %o', async (patch) => {
    const { db } = freshEnv();
    const { profileId } = await bootstrap(db, { import: noLegacy });
    await expect(updateSettings(db, profileId, patch as never)).rejects.toThrow(SettingsRepoError);
  });

  it('rejects an unknown profile', async () => {
    const { db } = freshEnv();
    await expect(updateSettings(db, 'missing', { theme: 'dark' })).rejects.toThrow(/No settings/);
  });
});
