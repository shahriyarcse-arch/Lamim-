import {
  lwwWins,
  type PullResponse,
  type PushRequest,
  type PushResponse,
  type RowEnvelope,
} from '@lamim/sync-protocol';
import { describe, expect, it } from 'vitest';
import { bootstrap } from '../src/repos/bootstrap';
import { addEntry, createVault, depositToVault } from '../src/repos/finance';
import { incrementDhikr } from '../src/repos/daily';
import { getSalahDay, setSalahStatus } from '../src/repos/salah';
import { updateSettings } from '../src/repos/settings';
import {
  enqueueAll,
  getCursor,
  pendingCount,
  pushBatch,
  syncNow,
  type SyncTransport,
} from '../src/sync/engine';
import { freshEnv } from './fixtures';

/** In-memory server with the same rules the API enforces: LWW, monotonic rev, natural keys. */
class FakeServer {
  rows = new Map<string, RowEnvelope & { rev: number }>();
  rev = 0;
  failNextPush = false;

  private naturalKey(r: RowEnvelope): string | null {
    if (r.table === 'salahEntries')
      return `${r.table}|${r.profileId}|${r.data.date}|${r.data.prayer}`;
    if (['salahDays', 'dhikrLogs'].includes(r.table))
      return `${r.table}|${r.profileId}|${r.data.date}`;
    if (r.table === 'settings') return `${r.table}|${r.profileId}`;
    return null;
  }

  transport(): SyncTransport {
    return {
      push: async (req: PushRequest): Promise<PushResponse> => {
        if (this.failNextPush) {
          this.failNextPush = false;
          throw new Error('network down');
        }
        const accepted: PushResponse['accepted'] = [];
        const rejected: PushResponse['rejected'] = [];
        for (const r of req.changes) {
          if (r.data.amountMinor !== undefined && !Number.isInteger(r.data.amountMinor)) {
            rejected.push({ table: r.table, id: r.id, reason: 'invalid amountMinor' });
            continue;
          }
          const nk = this.naturalKey(r);
          const twin = nk
            ? [...this.rows.values()].find((x) => x.id !== r.id && this.naturalKey(x) === nk)
            : undefined;
          if (twin) {
            if (!lwwWins(r, twin)) {
              rejected.push({ table: r.table, id: r.id, reason: 'superseded' });
              continue;
            }
            this.rows.delete(twin.id);
          }
          const existing = this.rows.get(r.id);
          if (lwwWins(r, existing)) this.rows.set(r.id, { ...structuredClone(r), rev: ++this.rev });
          accepted.push({ table: r.table, id: r.id });
        }
        return { accepted, rejected, serverTime: Date.now() };
      },
      pull: async (cursor: string): Promise<PullResponse> => {
        const after = Number(cursor);
        const page = [...this.rows.values()]
          .filter((r) => r.rev > after)
          .sort((a, b) => a.rev - b.rev)
          .slice(0, 3); // small pages exercise paging
        const last = page.at(-1)?.rev ?? after;
        const hasMore = [...this.rows.values()].some((r) => r.rev > last);
        return {
          rows: page.map(({ rev: _rev, ...r }) => structuredClone(r)),
          cursor: String(last),
          hasMore,
        };
      },
    };
  }
}

const noLegacy = { readSources: async () => [] };
const D = '2026-11-21';

async function device() {
  const env = freshEnv();
  const { profileId } = await bootstrap(env.db, { import: noLegacy, timeZone: 'Asia/Dhaka' });
  return { ...env, profileId };
}

async function snapshot(db: Awaited<ReturnType<typeof device>>['db']) {
  const out: Record<string, unknown[]> = {};
  for (const t of [
    'profiles',
    'settings',
    'salahEntries',
    'dhikrLogs',
    'transactions',
    'vaults',
    'kv',
  ] as const) {
    out[t] = (await db.table(t).toArray())
      .map(({ _deviceId, ...r }: Record<string, unknown>) => r)
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }
  return out;
}

describe('sync engine', () => {
  it('restores 100% of a user’s data onto a wiped browser', async () => {
    const server = new FakeServer();
    const a = await device();
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'fajr',
      status: 'jamaat',
    });
    await incrementDhikr(a.db, {
      profileId: a.profileId,
      date: D,
      presetId: 'subhanallah',
      by: 33,
    });
    await addEntry(a.db, {
      profileId: a.profileId,
      type: 'income',
      amountMinor: 50_000_00,
      currency: 'BDT',
      fxRateMicro: null,
      date: D,
    });
    const v = await createVault(a.db, {
      profileId: a.profileId,
      name: 'Hajj',
      targetMinor: 500_000_00,
      currency: 'BDT',
    });
    await depositToVault(a.db, {
      profileId: a.profileId,
      vaultId: v.id,
      amountMinor: 10_000_00,
      currency: 'BDT',
      fxRateMicro: null,
      date: D,
    });
    await updateSettings(a.db, a.profileId, { theme: 'dark' });
    await enqueueAll(a.db); // first account link uploads everything, including bootstrap rows
    const summary = await syncNow(a.db, server.transport());
    expect(summary.rejected).toEqual([]);
    expect(await pendingCount(a.db)).toBe(0);

    // "Wipe the browser": a brand-new database pulls from cursor 0.
    const restored = freshEnv();
    await syncNow(restored.db, server.transport());
    const [before, after] = [await snapshot(a.db), await snapshot(restored.db)];
    expect(after).toEqual(before);
    expect(await getSalahDay(restored.db, a.profileId, D)).toEqual({ fajr: 'jamaat' });
    expect(await pendingCount(restored.db)).toBe(0); // pulled rows never echo back
  });

  it('two devices converge on the later write (LWW), in both directions', async () => {
    const server = new FakeServer();
    const a = await device();
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'asr',
      status: 'alone',
      now: 1000,
    });
    await enqueueAll(a.db);
    await syncNow(a.db, server.transport());

    const b = freshEnv();
    await syncNow(b.db, server.transport());
    await setSalahStatus(b.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'asr',
      status: 'jamaat',
      now: 5000,
    }); // later
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'asr',
      status: 'qaza',
      now: 3000,
    }); // earlier, offline

    await syncNow(b.db, server.transport());
    await syncNow(a.db, server.transport());
    await syncNow(b.db, server.transport());
    expect(await getSalahDay(a.db, a.profileId, D)).toEqual({ asr: 'jamaat' });
    expect(await getSalahDay(b.db, a.profileId, D)).toEqual({ asr: 'jamaat' });
  });

  it('resolves the same prayer logged on two devices with different row ids', async () => {
    const server = new FakeServer();
    const a = await device();
    await enqueueAll(a.db);
    await syncNow(a.db, server.transport());
    const b = freshEnv();
    await syncNow(b.db, server.transport());

    // Both log Fajr offline → two different ids for the same natural key.
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'fajr',
      status: 'alone',
      now: 2000,
    });
    await setSalahStatus(b.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'fajr',
      status: 'jamaat',
      now: 4000,
    });
    await syncNow(a.db, server.transport());
    await syncNow(b.db, server.transport());
    await syncNow(a.db, server.transport());

    for (const db of [a.db, b.db]) {
      const rows = await db.salahEntries
        .where('[profileId+date]')
        .equals([a.profileId, D])
        .toArray();
      expect(rows.map((r) => r.status)).toEqual(['jamaat']);
    }
    expect([...server.rows.values()].filter((r) => r.table === 'salahEntries')).toHaveLength(1);
  });

  it('a pull never overwrites a newer local edit that has not been pushed yet', async () => {
    const server = new FakeServer();
    const a = await device();
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'asr',
      status: 'alone',
      now: 1000,
    });
    await enqueueAll(a.db);
    await syncNow(a.db, server.transport());
    const b = freshEnv();
    await syncNow(b.db, server.transport());

    await setSalahStatus(b.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'asr',
      status: 'qaza',
      now: 3000,
    });
    await syncNow(b.db, server.transport()); // server now holds B's 3000 version
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'asr',
      status: 'jamaat',
      now: 5000,
    }); // newer, unpushed

    // Pull only (e.g. the push failed offline but a pull got through).
    const { pullBatch } = await import('../src/sync/engine');
    await pullBatch(a.db, server.transport());
    expect(await getSalahDay(a.db, a.profileId, D)).toEqual({ asr: 'jamaat' });
    expect(await pendingCount(a.db)).toBe(1); // still queued for push

    await syncNow(a.db, server.transport());
    await syncNow(b.db, server.transport());
    expect(await getSalahDay(b.db, a.profileId, D)).toEqual({ asr: 'jamaat' });
  });

  it('propagates deletions as tombstones', async () => {
    const server = new FakeServer();
    const a = await device();
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'isha',
      status: 'alone',
      now: 1000,
    });
    await enqueueAll(a.db);
    await syncNow(a.db, server.transport());
    const b = freshEnv();
    await syncNow(b.db, server.transport());
    expect(await getSalahDay(b.db, a.profileId, D)).toEqual({ isha: 'alone' });

    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'isha',
      status: null,
      now: 2000,
    });
    await syncNow(a.db, server.transport());
    await syncNow(b.db, server.transport());
    expect(await getSalahDay(b.db, a.profileId, D)).toEqual({});
  });

  it('keeps the queue on network failure and retries successfully', async () => {
    const server = new FakeServer();
    const a = await device();
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'fajr',
      status: 'jamaat',
    });
    // A long outage must never park data: transport failures don't count as attempts.
    for (let i = 0; i < 8; i++) {
      server.failNextPush = true;
      await expect(pushBatch(a.db, server.transport())).rejects.toThrow('network down');
    }
    expect(await pendingCount(a.db)).toBe(1);
    expect((await a.db.syncQueue.toArray())[0]!.attempts).toBe(0);
    await syncNow(a.db, server.transport());
    expect(await pendingCount(a.db)).toBe(0);
  });

  it('a new local edit or a full re-upload un-parks a rejected row', async () => {
    const server = new FakeServer();
    const a = await device();
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'fajr',
      status: 'alone',
    });
    const item = (await a.db.syncQueue.toArray()).find((q) => q.table === 'salahEntries')!;
    await a.db.syncQueue.update(item.seq!, { attempts: 5 }); // parked
    expect(await pendingCount(a.db)).toBe(0);
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'fajr',
      status: 'jamaat',
    });
    expect(await pendingCount(a.db)).toBe(1);

    await a.db.syncQueue.update(item.seq!, { attempts: 5 });
    await enqueueAll(a.db);
    expect((await a.db.syncQueue.get(item.seq!))!.attempts).toBe(0);
    await syncNow(a.db, server.transport());
    expect([...server.rows.values()].find((r) => r.table === 'salahEntries')?.data.status).toBe(
      'jamaat',
    );
  });

  it('a pulled row that moved onto a key held by another local row replaces it', async () => {
    const server = new FakeServer();
    const a = await device();
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'fajr',
      status: 'alone',
      now: 1000,
    });
    await enqueueAll(a.db);
    await syncNow(a.db, server.transport());
    const b = freshEnv();
    await syncNow(b.db, server.transport());
    await setSalahStatus(b.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'dhuhr',
      status: 'qaza',
      now: 2000,
    }); // local row, different id, unpushed

    // Server-side, the row B already holds (same id) now carries B's dhuhr key, newer.
    const moved = [...server.rows.values()].find((r) => r.table === 'salahEntries')!;
    server.rows.set(moved.id, {
      ...moved,
      updatedAt: 9000,
      data: { ...moved.data, prayer: 'dhuhr', status: 'jamaat', updatedAt: 9000 },
      rev: ++server.rev,
    });
    const { pullBatch } = await import('../src/sync/engine');
    await pullBatch(b.db, server.transport()); // used to abort on the unique index
    const rows = await b.db.salahEntries
      .where('[profileId+date]')
      .equals([a.profileId, D])
      .toArray();
    expect(rows.map((r) => [r.id, r.prayer, r.status])).toEqual([[moved.id, 'dhuhr', 'jamaat']]);
  });

  it('does not drop a change made while its push was in flight', async () => {
    const server = new FakeServer();
    const a = await device();
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'fajr',
      status: 'alone',
      now: 1000,
    });
    const inner = server.transport();
    const slow: SyncTransport = {
      pull: inner.pull,
      push: async (req) => {
        // User edits the same prayer while the request is on the wire.
        await setSalahStatus(a.db, {
          profileId: a.profileId,
          date: D,
          prayer: 'fajr',
          status: 'jamaat',
          now: 2000,
        });
        return inner.push(req);
      },
    };
    await pushBatch(a.db, slow);
    expect(await pendingCount(a.db)).toBe(1); // the newer edit is still queued
    await syncNow(a.db, server.transport());
    expect([...server.rows.values()].find((r) => r.table === 'salahEntries')?.data.status).toBe(
      'jamaat',
    );
  });

  it('parks rows the server rejects as invalid instead of retrying forever', async () => {
    const server = new FakeServer();
    const a = await device();
    await a.db.transactions.add({
      id: 'bad',
      profileId: a.profileId,
      type: 'expense',
      amountMinor: 1.5,
      currency: 'USD',
      fxRateMicro: null,
      baseMinor: 1,
      categoryId: null,
      description: '',
      date: D,
      vaultId: null,
      updatedAt: 1,
      deletedAt: null,
    });
    await enqueueAll(a.db);
    const summary = await syncNow(a.db, server.transport());
    expect(summary.rejected).toEqual([
      { table: 'transactions', id: 'bad', reason: 'invalid amountMinor' },
    ]);
    expect(await pendingCount(a.db)).toBe(0); // parked (kept in the queue, not retried)
    expect(await a.db.syncQueue.count()).toBe(1);
  });

  it('advances the cursor and resumes paging from it', async () => {
    const server = new FakeServer();
    const a = await device();
    for (const prayer of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
      await setSalahStatus(a.db, { profileId: a.profileId, date: D, prayer, status: 'jamaat' });
    }
    await enqueueAll(a.db);
    await syncNow(a.db, server.transport());
    const b = freshEnv();
    await syncNow(b.db, server.transport());
    expect(await getCursor(b.db)).toBe(String(server.rev));
    expect(Object.keys(await getSalahDay(b.db, a.profileId, D))).toHaveLength(5);
  });
});

describe('account linking', () => {
  it('a wiped browser adopts the account profile and drops the empty guest', async () => {
    const { adoptRemoteProfile } = await import('../src/sync/account');
    const server = new FakeServer();
    const a = await device();
    await setSalahStatus(a.db, {
      profileId: a.profileId,
      date: D,
      prayer: 'fajr',
      status: 'jamaat',
    });
    await enqueueAll(a.db);
    await syncNow(a.db, server.transport());

    const fresh = await device(); // bootstrap created an empty Guest
    await syncNow(fresh.db, server.transport());
    expect(await fresh.db.profiles.count()).toBe(2);
    expect(await adoptRemoteProfile(fresh.db, fresh.profileId)).toBe(a.profileId);
    expect(await fresh.db.profiles.count()).toBe(1);
    expect((await fresh.db.meta.get('activeProfileId'))?.value).toBe(a.profileId);
    expect(await fresh.db.settings.where('profileId').equals(fresh.profileId).count()).toBe(0);
  });

  it('a guest with real data is kept and uploaded (guest → cloud link)', async () => {
    const { adoptRemoteProfile } = await import('../src/sync/account');
    const server = new FakeServer();
    const a = await device();
    await enqueueAll(a.db);
    await syncNow(a.db, server.transport());

    const used = await device();
    await incrementDhikr(used.db, {
      profileId: used.profileId,
      date: D,
      presetId: 'subhanallah',
      by: 5,
    });
    await syncNow(used.db, server.transport());
    expect(await adoptRemoteProfile(used.db, used.profileId)).toBeNull();
    await enqueueAll(used.db);
    await syncNow(used.db, server.transport());
    expect(
      [...server.rows.values()].some((r) => r.table === 'profiles' && r.id === used.profileId),
    ).toBe(true);
  });

  it('nothing to adopt when the account is new', async () => {
    const { adoptRemoteProfile } = await import('../src/sync/account');
    const a = await device();
    expect(await adoptRemoteProfile(a.db, a.profileId)).toBeNull();
    expect(await a.db.profiles.count()).toBe(1);
  });
});
