import { IDBKeyRange } from 'fake-indexeddb';
import { describe, expect, it } from 'vitest';
import { LamimDB } from '../src/schema';
import { runLegacyImport } from '../src/legacy/importer';
import { readLegacyIndexedDB } from '../src/legacy/source';
import { UUID_V7_RE } from '../src/uuid';
import {
  A,
  databaseNames,
  encode,
  freshEnv,
  LEGACY_IDB,
  LEGACY_LS,
  memoryStorage,
  R,
  seedLegacyIDB,
} from './fixtures';

async function importFixture() {
  const env = freshEnv();
  await seedLegacyIDB(env.factory, LEGACY_IDB);
  const result = await runLegacyImport(env.db, {
    indexedDB: env.factory,
    localStorage: memoryStorage(LEGACY_LS),
    now: () => Date.UTC(2026, 10, 21, 12),
  });
  const profiles = await env.db.profiles.toArray();
  const idOf = (legacyId: string) => profiles.find((p) => p.legacyId === legacyId)!.id;
  return { ...env, result, idOf, a: idOf(A), r: idOf(R) };
}

describe('runLegacyImport — full fixture', () => {
  it('imports and reports', async () => {
    const { result } = await importFixture();
    expect(result.status).toBe('imported');
    if (result.status !== 'imported') return;
    expect(result.report.counts).toMatchObject({
      profiles: 2,
      settings: 2,
      salahDays: 5, // A: 11-19 (LS), 11-20, 11-21, 2025-01-01 orphan; R: 11-20
      dhikrLogs: 1,
      gymLogs: 1,
      careerLogs: 1,
      habits: 1,
      habitEvents: 1,
      transactions: 5,
      vaults: 1,
      zakatProfiles: 1,
      kv: 2,
    });
  });

  it('profiles get UUID v7 ids, keep legacy ids, active profile is recorded', async () => {
    const { db, a, r } = await importFixture();
    const amina = (await db.profiles.get(a))!;
    expect(amina).toMatchObject({
      legacyId: A,
      name: 'Amina',
      gender: 'female',
      dob: '1998-04-12',
      deletedAt: null,
    });
    expect(amina.createdAt).toBe(Date.parse('2025-01-10T08:00:00.000Z'));
    expect(amina.extra).toMatchObject({ bio: 'hi', email: 'local@lamim.offline' });
    expect(a).toMatch(UUID_V7_RE);
    expect((await db.profiles.get(r))!).toMatchObject({ name: 'Rahim', dob: null });
    expect((await db.meta.get('activeProfileId'))?.value).toBe(a);
  });

  it('settings are mapped and prayer settings pinned to the legacy MWL + Hanafi', async () => {
    const { db, a, r } = await importFixture();
    const sa = (await db.settings.where('profileId').equals(a).first())!;
    expect(sa).toMatchObject({
      lang: 'bn',
      currency: 'BDT',
      lat: 23.81,
      lng: 90.41,
      locationName: 'Dhaka',
      method: 'MWL',
      asr: 'hanafi',
      hijriOffset: -1,
      theme: 'dark',
    });
    expect(sa.extra).toMatchObject({ notifications: true, jumuahMode: true });
    // Rahim has no scoped settings → falls back to the unscoped localStorage mirror.
    const sr = (await db.settings.where('profileId').equals(r).first())!;
    expect(sr).toMatchObject({
      currency: 'USD',
      lang: 'en',
      lat: null,
      lng: null,
      method: 'MWL',
      asr: 'hanafi',
    });
  });

  it('salah: one row per prayer, legacy aliases normalized, day fields kept', async () => {
    const { db, a } = await importFixture();
    const day = await db.salahEntries.where('[profileId+date]').equals([a, '2026-11-20']).toArray();
    expect(Object.fromEntries(day.map((e) => [e.prayer, e.status]))).toEqual({
      fajr: 'jamaat', // IndexedDB value, not the conflicting localStorage 'missed'
      dhuhr: 'alone',
      asr: 'qaza',
      maghrib: 'missed',
    });
    const next = await db.salahEntries
      .where('[profileId+date]')
      .equals([a, '2026-11-21'])
      .toArray();
    expect(Object.fromEntries(next.map((e) => [e.prayer, e.status]))).toEqual({
      fajr: 'jamaat',
      dhuhr: 'alone',
    });

    const d20 = (await db.salahDays.where('[profileId+date]').equals([a, '2026-11-20']).first())!;
    expect(d20).toMatchObject({
      tahajjud: true,
      tahajjudRakat: 8,
      witr: 3,
      jummah: false,
      notes: { fajr: 'late' },
      sunnah: { fajr_s: true },
    });
    const d21 = (await db.salahDays.where('[profileId+date]').equals([a, '2026-11-21']).first())!;
    expect(d21.extra).toEqual({ invalidStatuses: { asr: 'weird' } });
  });

  it('localStorage-only days and pre-multi-profile orphans are imported for the active profile', async () => {
    const { db, a } = await importFixture();
    expect(await db.salahEntries.where('[profileId+date]').equals([a, '2026-11-19']).count()).toBe(
      2,
    );
    expect(await db.salahEntries.where('[profileId+date]').equals([a, '2025-01-01']).count()).toBe(
      1,
    );
  });

  it('dhikr, gym, career and kv documents', async () => {
    const { db, a } = await importFixture();
    const dhikr = (await db.dhikrLogs.where('[profileId+date]').equals([a, '2026-11-20']).first())!;
    expect(dhikr.counts).toEqual({ subhanallah: 33, alhamdulillah: 34 });
    expect(dhikr.extra).toEqual({ bad: 'x' });
    expect((await db.gymLogs.toArray())[0]!.data).toEqual({ water: { amount: 1500, goal: 3000 } });
    expect((await db.careerLogs.toArray())[0]!.data).toMatchObject({ studyDuration: 45 });
    expect(
      (await db.kv.where('[profileId+key]').equals([a, 'gym.bodyMetrics']).first())!.value,
    ).toEqual({
      entries: [{ date: '2026-11-01', weight: 60 }],
    });
    expect(
      (await db.kv.where('[profileId+key]').equals(['global', 'dhikr.presets']).first())!.value,
    ).toEqual([{ id: 'p1', latin: 'Ya Latif', target: 129 }]);
  });

  it('habits become rows plus immutable events with unescaped reasons', async () => {
    const { db } = await importFixture();
    const [habit] = await db.habits.toArray();
    expect(habit).toMatchObject({
      legacyId: 'custom-abc',
      label: 'No sugar',
      icon: 'leaf',
      startDate: '2026-11-01T00:00:00.000Z',
    });
    expect(habit!.extra).toMatchObject({ customStart: true, longestStreak: 5 });
    const [event] = await db.habitEvents.toArray();
    expect(event).toMatchObject({
      habitId: habit!.id,
      date: '2026-10-30',
      type: 'relapse',
      reason: 'Tom & Jerry <3',
      streak: 4,
      at: '2026-10-30T10:00:00.000Z',
    });
  });

  it('finance: integer USD cents, transfers linked to the new vault id, zakat breakdown', async () => {
    const { db, a } = await importFixture();
    const tx = await db.transactions
      .where('[profileId+date]')
      .between([a, ''], [a, '￿'])
      .sortBy('date');
    expect(
      tx.map((t) => [t.legacyId, t.type, t.amountMinor, t.baseMinor, t.currency, t.date]),
    ).toEqual([
      ['i1', 'income', 100_010, 100_010, 'USD', '2026-11-01'],
      ['i2', 'income', 20, 20, 'USD', '2026-11-02'],
      ['e1', 'expense', 10, 10, 'USD', '2026-11-03'],
      ['e2', 'transfer', 5_000, 5_000, 'USD', '2026-11-04'],
      ['e4', 'expense', 500, 500, 'USD', '2026-11-05'],
    ]);
    for (const t of tx) expect(Number.isInteger(t.amountMinor)).toBe(true);
    const [vault] = await db.vaults.toArray();
    expect(vault).toMatchObject({
      legacyId: 'v1',
      name: 'Hajj',
      targetMinor: 500_000,
      savedMinor: 5_000,
    });
    expect(tx.find((t) => t.legacyId === 'e2')!.vaultId).toBe(vault!.id);
    const zakat = (await db.zakatProfiles.where('profileId').equals(a).first())!;
    expect(zakat).toMatchObject({
      nisabMinor: 60_000,
      cashMinor: 10_050,
      goldMinor: 0,
      silverMinor: 0,
    });
    expect(zakat.extra).toEqual({ debts: [{ name: 'loan', amount: 10 }] });
  });

  it('finance reconciliation shows zero rounding drift', async () => {
    const { result, a } = await importFixture();
    if (result.status !== 'imported') throw new Error('expected import');
    expect(result.report.finance).toEqual([
      { profileId: a, legacyBalanceMinor: 94_520, importedBalanceMinor: 94_520, diffMinor: 0 },
    ]);
  });

  it('quarantines invalid records with reasons instead of dropping them', async () => {
    const { db } = await importFixture();
    const q = await db.quarantine.toArray();
    const find = (key: string, path: string | null = null) =>
      q.find((e) => e.legacyKey === key && e.path === path);
    expect(find(`usr_${A}_lamim_salah_2026-02-30`)?.reason).toMatch(/invalid date/);
    expect(find('usr_ghost_lamim_salah_2026-11-20')?.reason).toMatch(
      /unknown legacy profile "ghost"/,
    );
    expect(find(`usr_${A}_lamim_dhikr_2026-11-18`)?.reason).toBe('invalid JSON');
    expect(find(`usr_${A}_lamim_habits`, '[0].history[1]')?.reason).toMatch(/date/);
    expect(find(`usr_${A}_lamim_habits`, '[1]')).toBeDefined();
    expect(find(`usr_${A}_lamim_finance`, 'expenses[2]')?.reason).toMatch(/finite number/);
    expect(find('lamim_profiles_vault', '[2]')).toBeDefined();
    expect(q).toHaveLength(7);
    for (const e of q) expect(e.raw.length).toBeGreaterThan(0); // raw source kept verbatim
  });

  it('archives every legacy key verbatim from every source', async () => {
    const { db, result } = await importFixture();
    const legacyKeys = Object.keys(LEGACY_IDB).length;
    const lsKeys = Object.keys(LEGACY_LS).filter(
      (k) => k.startsWith('lamim_') || k.startsWith('usr_'),
    ).length;
    expect(await db.legacyArchive.count()).toBe(legacyKeys + lsKeys);
    expect((await db.legacyArchive.get(`indexeddb:usr_${A}_lamim_salah_2026-11-20`))!.raw).toBe(
      encode(LEGACY_IDB[`usr_${A}_lamim_salah_2026-11-20`]),
    );
    expect((await db.legacyArchive.get(`localStorage:usr_${A}_lamim_salah_2026-11-20`))!.raw).toBe(
      LEGACY_LS[`usr_${A}_lamim_salah_2026-11-20`],
    );
    if (result.status !== 'imported') throw new Error('expected import');
    expect(result.report.archivedOnlyKeys).toEqual(
      expect.arrayContaining([`usr_${A}_lamim_salah_intro_done`, 'lamim_current_sw_version']),
    );
  });

  it('never modifies or deletes the legacy database', async () => {
    const { factory } = await importFixture();
    expect(await databaseNames(factory)).toContain('lamim_db');
    const after = await readLegacyIndexedDB(factory);
    expect(Object.fromEntries(after!.entries)).toEqual(
      Object.fromEntries(Object.entries(LEGACY_IDB).map(([k, v]) => [k, encode(v)])),
    );
  });

  it('every synced row has id, profileId, updatedAt and a null tombstone', async () => {
    const { db } = await importFixture();
    for (const table of [
      'settings',
      'salahEntries',
      'salahDays',
      'dhikrLogs',
      'habits',
      'habitEvents',
      'transactions',
      'vaults',
      'kv',
    ] as const) {
      for (const row of await db.table(table).toArray()) {
        expect(row.id, table).toMatch(UUID_V7_RE);
        expect(typeof row.profileId, table).toBe('string');
        expect(row.updatedAt, table).toBe(Date.UTC(2026, 10, 21, 12));
        expect(row.deletedAt, table).toBeNull();
      }
    }
  });
});

describe('runLegacyImport — safety properties', () => {
  it('is idempotent: a second run is a no-op', async () => {
    const { db, factory } = await importFixture();
    const before = await db.salahEntries.count();
    expect(
      await runLegacyImport(db, { indexedDB: factory, localStorage: memoryStorage(LEGACY_LS) }),
    ).toEqual({
      status: 'already-migrated',
    });
    expect(await db.salahEntries.count()).toBe(before);
    expect(await db.profiles.count()).toBe(2);
  });

  it('is atomic: a failure mid-write leaves nothing behind and the next boot retries', async () => {
    const { db, factory } = freshEnv();
    await seedLegacyIDB(factory, LEGACY_IDB);
    const opts = { indexedDB: factory, localStorage: memoryStorage(LEGACY_LS) };
    const fail = () => {
      throw new Error('disk full');
    };
    db.transactions.hook('creating', fail);

    await expect(runLegacyImport(db, opts)).rejects.toThrow();
    for (const table of db.tables) expect(await table.count(), table.name).toBe(0);
    expect(await db.meta.get('migratedFrom')).toBeUndefined();

    db.transactions.hook('creating').unsubscribe(fail);
    expect((await runLegacyImport(db, opts)).status).toBe('imported');
    expect(await db.transactions.count()).toBe(5);
  });

  it('two tabs importing concurrently write the data exactly once', async () => {
    const { factory } = freshEnv();
    await seedLegacyIDB(factory, LEGACY_IDB);
    const tab1 = new LamimDB('lamim', { indexedDB: factory, IDBKeyRange });
    const tab2 = new LamimDB('lamim', { indexedDB: factory, IDBKeyRange });
    const results = await Promise.all([
      runLegacyImport(tab1, { indexedDB: factory, localStorage: memoryStorage({}) }),
      runLegacyImport(tab2, { indexedDB: factory, localStorage: memoryStorage({}) }),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual(['already-migrated', 'imported']);
    expect(await tab1.profiles.count()).toBe(2);
  });

  it('with no legacy data: marks migration and does not create lamim_db', async () => {
    const { db, factory } = freshEnv();
    expect(
      await runLegacyImport(db, { indexedDB: factory, localStorage: memoryStorage({}) }),
    ).toEqual({
      status: 'no-legacy-data',
    });
    expect(await databaseNames(factory)).not.toContain('lamim_db');
    expect((await db.meta.get('migratedFrom'))?.value).toMatchObject({ version: 'none' });
    expect(await db.profiles.count()).toBe(0);
  });

  it('imports localStorage-only data (legacy IndexedDB never existed)', async () => {
    const { db, factory } = freshEnv();
    const result = await runLegacyImport(db, {
      indexedDB: factory,
      localStorage: memoryStorage({
        lamim_user: JSON.stringify({ id: 'u1', name: 'Fallback User' }),
        usr_u1_lamim_salah_2026_bad: '{}',
        'usr_u1_lamim_salah_2026-11-20': JSON.stringify({ fajr: 'jamaat' }),
      }),
    });
    expect(result.status).toBe('imported');
    expect(await db.salahEntries.count()).toBe(1);
  });

  it('still imports IndexedDB data when localStorage access throws', async () => {
    const { db, factory } = freshEnv();
    await seedLegacyIDB(factory, LEGACY_IDB);
    const throwing = {
      get length(): number {
        throw new Error('SecurityError');
      },
      key: () => null,
      getItem: () => null,
    };
    expect((await runLegacyImport(db, { indexedDB: factory, localStorage: throwing })).status).toBe(
      'imported',
    );
  });

  it('refuses default sources for a non-production database name', async () => {
    const { factory } = freshEnv();
    const scratch = new LamimDB('scratch', { indexedDB: factory, IDBKeyRange });
    await expect(runLegacyImport(scratch)).rejects.toThrow(/refusing default sources/);
  });
});
