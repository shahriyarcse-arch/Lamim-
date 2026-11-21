/**
 * Real client ⇄ real API, end to end: the production @lamim/db sync engine (Dexie on
 * fake-indexeddb) talks to the in-process API backed by an isolated Neon schema.
 *
 * Device A: imports the full legacy fixture, then writes through every repository.
 * It registers and uploads everything — the server must reject nothing.
 * Device B: a wiped browser. It signs in, pulls, adopts the account profile, and must
 * end up with exactly the same rows in every synced table.
 */
import {
  adoptRemoteProfile,
  addEntry,
  bootstrap,
  createHabit,
  createVault,
  depositToVault,
  enqueueAll,
  incrementDhikr,
  LamimDB,
  logRelapse,
  pendingCount,
  pullBatch,
  setFasting,
  setSalahStatus,
  syncNow,
  updateSettings,
  type SyncTransport,
} from '@lamim/db';
import { PullResponseSchema, PushResponseSchema, SYNC_TABLES } from '@lamim/sync-protocol';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import {
  LEGACY_IDB,
  LEGACY_LS,
  memoryStorage,
  seedLegacyIDB,
} from '../../../../packages/db/__tests__/fixtures';
import { rid, startApp } from '../helpers';

const schema = inject('dbSchema');
const D = '2026-11-21';

describe.skipIf(!schema)('real client restore (integration, isolated schema)', () => {
  let app: NestExpressApplication;
  const http = () => request(app.getHttpServer());

  function transport(token: () => string): SyncTransport {
    return {
      push: async (req) => {
        const res = await http()
          .post('/sync/push')
          .set('Authorization', `Bearer ${token()}`)
          .send(req);
        expect(res.status).toBe(200);
        return PushResponseSchema.parse(res.body);
      },
      pull: async (cursor) => {
        const res = await http()
          .get('/sync/pull')
          .query({ cursor })
          .set('Authorization', `Bearer ${token()}`);
        expect(res.status).toBe(200);
        return PullResponseSchema.parse(res.body);
      },
    };
  }

  async function snapshot(db: LamimDB) {
    const out: Record<string, unknown[]> = {};
    for (const table of SYNC_TABLES) {
      out[table] = (await db.table(table).toArray())
        .map(({ _deviceId, ...row }: Record<string, unknown>) => row)
        .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }
    return out;
  }

  beforeAll(async () => {
    app = await startApp({ DB_SCHEMA: schema });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('legacy import + every module: uploads with zero rejections and restores byte-identical on a wiped browser', async () => {
    // ---- Device A: legacy user upgrading to the new app --------------------------------
    const factoryA = new IDBFactory();
    await seedLegacyIDB(factoryA, LEGACY_IDB);
    const a = new LamimDB('lamim', { indexedDB: factoryA, IDBKeyRange });
    const bootA = await bootstrap(a, {
      timeZone: 'Asia/Dhaka',
      import: { indexedDB: factoryA, localStorage: memoryStorage(LEGACY_LS) },
    });
    expect(bootA.importResult.status).toBe('imported');
    const pid = bootA.profileId;

    await setSalahStatus(a, { profileId: pid, date: D, prayer: 'isha', status: 'jamaat' });
    await setFasting(a, { profileId: pid, date: D, fasting: true });
    await incrementDhikr(a, { profileId: pid, date: D, presetId: 'subhanallah', by: 33 });
    await addEntry(a, {
      profileId: pid,
      type: 'expense',
      amountMinor: 1_250_50,
      currency: 'BDT',
      fxRateMicro: 121_530_000,
      date: D,
      categoryId: 'fish',
      description: 'Ilish',
    });
    await addEntry(a, {
      profileId: pid,
      type: 'income',
      amountMinor: 50_000_00,
      currency: 'BDT',
      fxRateMicro: null,
      date: D,
    });
    const vault = await createVault(a, {
      profileId: pid,
      name: 'Eid',
      targetMinor: 3_000_00,
      currency: 'BDT',
    });
    await depositToVault(a, {
      profileId: pid,
      vaultId: vault.id,
      amountMinor: 1_000_00,
      currency: 'BDT',
      fxRateMicro: 121_530_000,
      date: D,
    });
    const habit = await createHabit(a, { profileId: pid, label: 'Social Media' });
    await logRelapse(a, { profileId: pid, habitId: habit.id, date: D, reason: 'late night' });
    await updateSettings(a, pid, { theme: 'dark', method: 'Karachi' });

    const email = `${rid('restore')}@example.test`;
    const password = 'correct horse battery staple';
    const reg = await http().post('/auth/register').send({ email, password, deviceId: 'device-a' });
    expect(reg.status).toBe(201);
    let tokenA = reg.body.accessToken as string;

    expect(await enqueueAll(a)).toBeGreaterThan(20);
    const summary = await syncNow(
      a,
      transport(() => tokenA),
    );
    expect(summary.rejected).toEqual([]); // every real row shape is accepted
    expect(await pendingCount(a)).toBe(0);

    // ---- Device B: browser storage wiped, new install -----------------------------------
    const b = new LamimDB('lamim', { indexedDB: new IDBFactory(), IDBKeyRange });
    const bootB = await bootstrap(b, {
      timeZone: 'Asia/Dhaka',
      import: { readSources: async () => [] },
    });
    expect(bootB.createdGuest).toBe(true);

    const login = await http().post('/auth/login').send({ email, password, deviceId: 'device-b' });
    expect(login.status).toBe(200);
    const tokenB = login.body.accessToken as string;
    for (let i = 0; i < 100; i++)
      if (
        !(
          await pullBatch(
            b,
            transport(() => tokenB),
          )
        ).hasMore
      )
        break;
    expect(await adoptRemoteProfile(b, bootB.profileId)).toBe(pid);

    const [before, after] = [await snapshot(a), await snapshot(b)];
    for (const table of SYNC_TABLES) {
      expect(after[table], `table ${table}`).toEqual(before[table]);
    }
    expect((await b.meta.get('activeProfileId'))?.value).toBe(pid);
    expect(await pendingCount(b)).toBe(0); // pulled rows never echo back

    // ---- Round trip: an edit on B reaches A ----------------------------------------------
    await setSalahStatus(b, {
      profileId: pid,
      date: D,
      prayer: 'isha',
      status: 'qaza',
      now: Date.now() + 1000,
    });
    await syncNow(
      b,
      transport(() => tokenB),
    );
    tokenA = (await http().post('/auth/login').send({ email, password, deviceId: 'device-a' })).body
      .accessToken;
    await syncNow(
      a,
      transport(() => tokenA),
    );
    const isha = await a.salahEntries
      .where('[profileId+date+prayer]')
      .equals([pid, D, 'isha'])
      .first();
    expect(isha?.status).toBe('qaza');
  });
});
