import {
  GLOBAL_PROFILE_ID,
  PullResponseSchema,
  PushResponseSchema,
  type RowEnvelope,
  SYNC_TABLES,
  type SyncTable,
} from '@lamim/sync-protocol';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { envelope, rid, sampleData, startApp } from '../helpers';

const schema = inject('dbSchema');

describe.skipIf(!schema)('sync (integration, isolated schema)', () => {
  let app: NestExpressApplication;
  const http = () => request(app.getHttpServer());

  async function newUser(deviceId = 'devA') {
    const email = `${rid('sync')}@example.test`;
    const password = 'correct horse battery staple';
    const res = await http().post('/auth/register').send({ email, password, deviceId });
    expect(res.status).toBe(201);
    return { email, password, token: res.body.accessToken as string, profileId: rid('profile') };
  }

  async function push(token: string, changes: RowEnvelope[], deviceId = 'devA') {
    const res = await http()
      .post('/sync/push')
      .set('Authorization', `Bearer ${token}`)
      .send({ deviceId, changes });
    expect(res.status).toBe(200);
    return PushResponseSchema.parse(res.body);
  }

  async function pull(token: string, cursor = '0', limit = 500) {
    const res = await http()
      .get('/sync/pull')
      .query({ cursor, limit })
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    return PullResponseSchema.parse(res.body);
  }

  async function pullAll(token: string, cursor = '0', limit = 500) {
    const rows: RowEnvelope[] = [];
    let c = cursor;
    for (;;) {
      const page = await pull(token, c, limit);
      rows.push(...page.rows);
      c = page.cursor;
      if (!page.hasMore) return { rows, cursor: c };
    }
  }

  /** One row per table for a profile (profile row first). */
  const fullSet = (profileId: string, opts: { updatedAt?: number; deviceId?: string } = {}) =>
    SYNC_TABLES.map((t) => envelope(t, profileId, opts));

  beforeAll(async () => {
    app = await startApp({ DB_SCHEMA: schema });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('push → pull round-trips every table exactly (including integer money)', async () => {
    const u = await newUser();
    const rows = [
      ...fullSet(u.profileId),
      envelope('kv', GLOBAL_PROFILE_ID, { data: { key: 'fxRate', value: 121.53 } }),
    ];
    const res = await push(u.token, rows);
    expect(res.rejected).toEqual([]);
    expect(res.accepted).toHaveLength(rows.length);

    const pulled = await pull(u.token);
    expect(pulled.hasMore).toBe(false);
    const byId = new Map(pulled.rows.map((r) => [`${r.table}:${r.id}`, r]));
    for (const row of rows) expect(byId.get(`${row.table}:${row.id}`)).toEqual(row);
  });

  it('LWW: older write ignored, newer applied, ties broken by deviceId', async () => {
    const u = await newUser();
    await push(u.token, [envelope('profiles', u.profileId)]);
    const id = rid('tx');
    const v = (updatedAt: number, deviceId: string, amountMinor: number) =>
      envelope('transactions', u.profileId, {
        id,
        updatedAt,
        deviceId,
        data: { ...sampleData('transactions'), amountMinor },
      });

    await push(u.token, [v(2_000, 'devA', 200)]);
    const older = await push(u.token, [v(1_000, 'devB', 100)]);
    expect(older.accepted).toEqual([{ table: 'transactions', id }]); // accepted (client may drop it) …
    const current = async () => (await pull(u.token)).rows.find((r) => r.id === id);
    expect((await current())?.data.amountMinor).toBe(200); // … but not applied

    await push(u.token, [v(3_000, 'devA', 300)]);
    expect((await current())?.data.amountMinor).toBe(300);

    await push(u.token, [v(3_000, 'devB', 301)]); // tie: 'devB' > 'devA' wins
    expect((await current())?.data.amountMinor).toBe(301);
    await push(u.token, [v(3_000, 'devA', 999)]); // tie: 'devA' < 'devB' loses
    expect(await current()).toMatchObject({ deviceId: 'devB', data: { amountMinor: 301 } });
  });

  it('tombstones sync (full and data-less) and are pulled', async () => {
    const u = await newUser();
    const habit = envelope('habits', u.profileId, { updatedAt: 1_000 });
    const vault = envelope('vaults', u.profileId, { updatedAt: 1_000 });
    await push(u.token, [envelope('profiles', u.profileId), habit, vault]);

    const res = await push(u.token, [
      { ...habit, updatedAt: 2_000, deletedAt: 2_000 },
      { ...vault, updatedAt: 2_000, deletedAt: 2_000, data: {} },
      { ...envelope('kv', u.profileId), updatedAt: 2_000, deletedAt: 2_000, data: {} }, // never existed → no-op
    ]);
    expect(res.rejected).toEqual([]);
    const rows = (await pull(u.token)).rows;
    expect(rows.find((r) => r.id === habit.id)).toMatchObject({
      deletedAt: 2_000,
      data: habit.data,
    });
    expect(rows.find((r) => r.id === vault.id)).toMatchObject({
      deletedAt: 2_000,
      data: vault.data,
    });
    expect(rows.filter((r) => r.table === 'kv')).toEqual([]);
  });

  it('re-pushing the same batch is idempotent (no new revisions)', async () => {
    const u = await newUser();
    const batch = fullSet(u.profileId);
    await push(u.token, batch);
    const { cursor } = await pullAll(u.token);
    const again = await push(u.token, batch);
    expect(again.accepted).toHaveLength(batch.length);
    expect(again.rejected).toEqual([]);
    const after = await pull(u.token, cursor);
    expect(after.rows).toEqual([]);
    expect(after.cursor).toBe(cursor);
  });

  it("cross-user isolation: B can never pull or overwrite A's rows", async () => {
    const a = await newUser();
    const b = await newUser();
    const aTx = envelope('transactions', a.profileId);
    const aGlobal = envelope('kv', GLOBAL_PROFILE_ID, { data: { key: 'fxRate', value: 1 } });
    await push(a.token, [envelope('profiles', a.profileId), aTx, aGlobal]);

    const attack = await push(b.token, [
      // write into A's profile
      envelope('salahEntries', a.profileId, { updatedAt: 9_999 }),
      // hijack A's profile row
      envelope('profiles', a.profileId, {
        updatedAt: 9_999,
        data: { ...sampleData('profiles'), name: 'pwned' },
      }),
      // overwrite A's row id from B's own profile
      { ...aTx, profileId: b.profileId, updatedAt: 9_999 },
      // overwrite A's global row id
      { ...aGlobal, updatedAt: 9_999, data: { key: 'fxRate', value: 666 } },
      envelope('profiles', b.profileId),
    ]);
    expect(attack.accepted).toEqual([{ table: 'profiles', id: b.profileId }]);
    expect(attack.rejected).toHaveLength(4);
    for (const r of attack.rejected) expect(r.reason).toMatch(/^forbidden/);

    const bRows = (await pull(b.token)).rows;
    expect(bRows.map((r) => r.id)).toEqual([b.profileId]);
    const aRows = (await pull(a.token)).rows;
    expect(aRows.find((r) => r.id === a.profileId)?.data.name).toBe('Profile 1');
    expect(aRows.find((r) => r.id === aTx.id)).toEqual(aTx);
    expect(aRows.find((r) => r.id === aGlobal.id)?.data.value).toBe(1);

    // Global rows are per user: B can hold its own "fxRate" key independently.
    const bGlobal = await push(b.token, [
      envelope('kv', GLOBAL_PROFILE_ID, { data: { key: 'fxRate', value: 2 } }),
    ]);
    expect(bGlobal.rejected).toEqual([]);
  });

  it('natural-key race (same profile+date+prayer, different ids) resolves by LWW without a 500', async () => {
    const u = await newUser();
    await push(u.token, [envelope('profiles', u.profileId)]);
    const data = sampleData('salahEntries');
    const x = envelope('salahEntries', u.profileId, {
      id: rid('x'),
      updatedAt: 1_000,
      deviceId: 'dev1',
      data,
    });
    const y = envelope('salahEntries', u.profileId, {
      id: rid('y'),
      updatedAt: 2_000,
      deviceId: 'dev2',
      data: { ...data, status: 'alone' },
    });
    await push(u.token, [x], 'dev1');
    const res = await push(u.token, [y], 'dev2');
    expect(res.accepted).toEqual([{ table: 'salahEntries', id: y.id }]);
    expect(res.rejected).toEqual([{ table: 'salahEntries', id: x.id, reason: 'superseded' }]);

    const late = await push(u.token, [{ ...x, updatedAt: 1_500 }], 'dev1');
    expect(late.rejected).toEqual([{ table: 'salahEntries', id: x.id, reason: 'superseded' }]);

    const entries = (await pull(u.token)).rows.filter((r) => r.table === 'salahEntries');
    expect(entries).toEqual([y]);
  });

  it('rejects invalid rows individually and invalid requests wholesale', async () => {
    const u = await newUser();
    await push(u.token, [envelope('profiles', u.profileId)]);
    const res = await push(u.token, [
      envelope('transactions', u.profileId, {
        data: { ...sampleData('transactions'), amountMinor: 10.5 },
      }),
      envelope('kv', u.profileId, { data: { key: 'big', value: 'x'.repeat(70_000) } }),
      envelope('vaults', u.profileId),
    ]);
    expect(res.accepted).toHaveLength(1);
    expect(res.rejected.map((r) => r.reason)).toEqual([
      expect.stringMatching(/^invalid: amountMinor/),
      'too_large',
    ]);

    const auth = { Authorization: `Bearer ${u.token}` };
    const unknownTable = await http()
      .post('/sync/push')
      .set(auth)
      .send({ deviceId: 'devA', changes: [{ ...envelope('kv', u.profileId), table: 'users' }] });
    expect(unknownTable.status).toBe(400);
    const tooMany = await http()
      .post('/sync/push')
      .set(auth)
      .send({
        deviceId: 'devA',
        changes: Array.from({ length: 501 }, () => envelope('kv', u.profileId)),
      });
    expect([400, 413]).toContain(tooMany.status);
    expect((await http().get('/sync/pull').query({ cursor: '-1' }).set(auth)).status).toBe(400);
    expect((await http().get('/sync/pull').query({ limit: 501 }).set(auth)).status).toBe(400);
  });

  it('fresh device restore: a new login pulls exactly the latest version of every row', async () => {
    const u = await newUser('phone');
    const second = rid('profile');
    const expected = new Map<string, RowEnvelope>();
    const remember = (rows: RowEnvelope[]) => {
      for (const r of rows) expected.set(`${r.table}:${r.id}`, r);
    };

    // v1 of everything across two profiles plus global rows.
    const v1 = [
      ...fullSet(u.profileId, { updatedAt: 1_000, deviceId: 'phone' }),
      ...fullSet(second, { updatedAt: 1_000, deviceId: 'phone' }),
      ...Array.from({ length: 12 }, (_, n) =>
        envelope('transactions', u.profileId, { n, updatedAt: 1_000, deviceId: 'phone' }),
      ),
      envelope('kv', GLOBAL_PROFILE_ID, {
        data: { key: 'dhikrPresets', value: ['a', 'b'] },
        deviceId: 'phone',
      }),
    ];
    expect((await push(u.token, v1, 'phone')).rejected).toEqual([]);
    remember(v1);

    // v2 edits for half the rows, one tombstone, then a stale v0 that must lose.
    const v2 = v1
      .filter((_, i) => i % 2 === 0 && v1[i]?.table !== 'profiles')
      .map((r) => ({
        ...r,
        updatedAt: 2_000,
        data: r.table === 'transactions' ? { ...r.data, amountMinor: 777 } : r.data,
      }));
    const tomb = {
      ...(v1.find((r) => r.table === 'habits') as RowEnvelope),
      updatedAt: 3_000,
      deletedAt: 3_000,
    };
    expect((await push(u.token, [...v2, tomb], 'phone')).rejected).toEqual([]);
    remember([...v2, tomb]);
    const stale = v2.slice(0, 3).map((r) => ({ ...r, updatedAt: 500, deviceId: 'zzz' }));
    await push(u.token, stale, 'phone');

    // New device: log in and page through from cursor 0 in small pages.
    const login = await http()
      .post('/auth/login')
      .send({ email: u.email, password: u.password, deviceId: 'laptop' });
    expect(login.status).toBe(200);
    const { rows } = await pullAll(login.body.accessToken, '0', 7);

    const got = new Map(rows.map((r) => [`${r.table}:${r.id}`, r]));
    expect(got.size).toBe(rows.length); // each row exactly once
    expect(got.size).toBe(expected.size);
    for (const [key, row] of expected) expect(got.get(key)).toEqual(row);
    const tables = new Set<SyncTable>(rows.map((r) => r.table));
    expect(tables.size).toBe(SYNC_TABLES.length);
  });

  it('rejects rows stamped more than 5 minutes in the future (clock_skew)', async () => {
    const u = await newUser();
    await push(u.token, [envelope('profiles', u.profileId)]);
    const future = Date.now() + 60 * 60_000;
    const res = await push(u.token, [
      envelope('kv', u.profileId, { updatedAt: future }),
      { ...envelope('vaults', u.profileId), deletedAt: future },
      envelope('habits', u.profileId, { updatedAt: Date.now() }),
    ]);
    expect(res.rejected.map((r) => r.reason)).toEqual(['clock_skew', 'clock_skew']);
    expect(res.accepted).toHaveLength(1);
  });

  it('caps concurrent sync requests per user (third in flight → 429) and keeps others working', async () => {
    const u = await newUser();
    const v = await newUser();
    await push(u.token, [envelope('profiles', u.profileId)]);
    const batch = () =>
      Array.from({ length: 40 }, (_, n) => envelope('transactions', u.profileId, { n }));
    const send = (token: string, changes: RowEnvelope[]) =>
      http()
        .post('/sync/push')
        .set('Authorization', `Bearer ${token}`)
        .send({ deviceId: 'devA', changes });
    const results = await Promise.all([
      send(u.token, batch()),
      send(u.token, batch()),
      send(u.token, batch()),
      send(u.token, batch()),
      send(v.token, [envelope('profiles', v.profileId)]),
    ]);
    const statuses = results.map((r) => r.status);
    expect(statuses.slice(0, 4).filter((s) => s === 200).length).toBeGreaterThanOrEqual(2);
    const limited = results.slice(0, 4).filter((r) => r.status === 429);
    expect(limited.length).toBeGreaterThanOrEqual(1);
    for (const r of limited) expect(Number(r.headers['retry-after'])).toBeGreaterThan(0);
    expect(statuses[4]).toBe(200);
    // Nothing half-applied: every accepted row is pullable exactly once.
    const rows = (await pullAll(u.token)).rows;
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
  });
});

describe.skipIf(!schema)('sync quotas (integration, isolated schema)', () => {
  let app: NestExpressApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await startApp({ DB_SCHEMA: schema, SYNC_QUOTA_ROWS: '5', SYNC_QUOTA_BYTES: '4000' });
  });
  afterAll(async () => {
    await app?.close();
  });

  it('rejects growth beyond the per-user row/byte quota with quota_exceeded, still allowing edits', async () => {
    const email = `${rid('quota')}@example.test`;
    const reg = await http()
      .post('/auth/register')
      .send({ email, password: 'correct horse battery staple', deviceId: 'devA' });
    const token = reg.body.accessToken as string;
    const profileId = rid('profile');
    const push = async (changes: RowEnvelope[]) => {
      const res = await http()
        .post('/sync/push')
        .set('Authorization', `Bearer ${token}`)
        .send({ deviceId: 'devA', changes });
      expect(res.status).toBe(200);
      return PushResponseSchema.parse(res.body);
    };

    const rows = [
      envelope('profiles', profileId),
      ...Array.from({ length: 6 }, (_, n) => envelope('vaults', profileId, { n })),
    ];
    const first = await push(rows);
    expect(first.accepted).toHaveLength(5);
    expect(first.rejected).toEqual([
      { table: 'vaults', id: rows[5]?.id, reason: 'quota_exceeded' },
      { table: 'vaults', id: rows[6]?.id, reason: 'quota_exceeded' },
    ]);

    // At the row limit an edit of an existing row still syncs; a big one breaks the byte quota.
    const v = rows[1] as RowEnvelope;
    const edit = await push([{ ...v, updatedAt: 2_000, data: { ...v.data, name: 'Umrah' } }]);
    expect(edit.rejected).toEqual([]);
    const bloated = await push([
      { ...v, updatedAt: 3_000, data: { ...v.data, extra: { blob: 'x'.repeat(5_000) } } },
    ]);
    expect(bloated.rejected).toEqual([{ table: 'vaults', id: v.id, reason: 'quota_exceeded' }]);

    // Deleting frees nothing in row count (tombstones are rows) but must never be blocked.
    const tomb = await push([{ ...v, updatedAt: 4_000, deletedAt: 4_000 }]);
    expect(tomb.rejected).toEqual([]);

    const usage = await app.get(PrismaService).user.findUniqueOrThrow({
      where: { email },
      select: { syncRowCount: true },
    });
    expect(Number(usage.syncRowCount)).toBe(5);
  });
});
