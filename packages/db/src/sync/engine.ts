/**
 * Client side of bi-directional sync. Transport-agnostic: the web app supplies an
 * HTTP transport; tests supply an in-memory server. Conflicts use the shared
 * `lwwWins` rule from @lamim/sync-protocol, so client and server always agree.
 *
 * Invariants
 * - Every local write already lands in Dexie first (offline-first); sync never blocks the UI.
 * - Pulled rows are written directly to tables and are never enqueued (no echo).
 * - A queue item is removed only if the server accepted the exact version that was sent.
 * - The pull cursor advances in the same transaction that applies the rows.
 */
import {
  lwwWins,
  MAX_PUSH_ROWS,
  SYNC_TABLES,
  type PullResponse,
  type PushRequest,
  type PushResponse,
  type RowEnvelope,
  type SyncTable,
} from '@lamim/sync-protocol';
import type { LamimDB } from '../schema';
import { uuidv7 } from '../uuid';

export interface SyncTransport {
  push(request: PushRequest): Promise<PushResponse>;
  pull(cursor: string): Promise<PullResponse>;
}

/** Envelope fields lifted out of the stored row; everything else travels in `data`. */
const ENVELOPE_KEYS = ['id', 'profileId', 'updatedAt', 'deletedAt', '_deviceId'] as const;
/** Max queue attempts before an item is parked (kept, but no longer retried automatically). */
export const MAX_SYNC_ATTEMPTS = 5;

type Row = Record<string, unknown> & { id: string; updatedAt: number; deletedAt?: number | null };

/** Stable per-browser id, used as the LWW tie-breaker for versions written on this device. */
export async function getDeviceId(db: LamimDB): Promise<string> {
  const existing = (await db.meta.get('sync.deviceId'))?.value;
  if (typeof existing === 'string') return existing;
  const id = uuidv7();
  await db.meta.put({ key: 'sync.deviceId', value: id });
  return id;
}

export async function getCursor(db: LamimDB): Promise<string> {
  const v = (await db.meta.get('sync.cursor'))?.value;
  return typeof v === 'string' ? v : '0';
}

function profileIdOf(table: SyncTable, row: Row): string {
  return table === 'profiles' ? row.id : String(row.profileId);
}

export function toEnvelope(table: SyncTable, row: Row, deviceId: string): RowEnvelope {
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (!(ENVELOPE_KEYS as readonly string[]).includes(k) && v !== undefined) data[k] = v;
  }
  return {
    table,
    id: row.id,
    profileId: profileIdOf(table, row),
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
    deviceId,
    data,
  };
}

export function fromEnvelope(env: RowEnvelope): Row {
  const row: Row = {
    ...env.data,
    id: env.id,
    updatedAt: env.updatedAt,
    deletedAt: env.deletedAt,
    _deviceId: env.deviceId,
  };
  if (env.table !== 'profiles') row.profileId = env.profileId;
  return row;
}

/**
 * Queue every syncable row (first link of an account, or after a restore). Needed
 * because legacy-imported rows and pre-account writes were never enqueued.
 */
export async function enqueueAll(db: LamimDB, now = Date.now()): Promise<number> {
  let count = 0;
  await db.transaction('rw', [db.syncQueue, ...SYNC_TABLES.map((t) => db.table(t))], async () => {
    for (const table of SYNC_TABLES) {
      const ids = (await db.table(table).toCollection().primaryKeys()) as string[];
      for (const rowId of ids) {
        const pending = await db.syncQueue.where('[table+rowId]').equals([table, rowId]).first();
        if (!pending) {
          await db.syncQueue.add({ table, rowId, op: 'put', createdAt: now, attempts: 0 });
          count++;
        } else if (pending.seq !== undefined && pending.attempts > 0) {
          await db.syncQueue.update(pending.seq, { attempts: 0 }); // full re-upload retries parked rows
        }
      }
    }
  });
  return count;
}

export interface PushResult {
  sent: number;
  accepted: number;
  rejected: { table: string; id: string; reason: string }[];
}

/** Push one batch of queued changes. Call repeatedly until `sent === 0`. */
export async function pushBatch(db: LamimDB, transport: SyncTransport): Promise<PushResult> {
  const deviceId = await getDeviceId(db);
  const items = (await db.syncQueue.orderBy('seq').toArray())
    .filter(
      (q) => q.attempts < MAX_SYNC_ATTEMPTS && (SYNC_TABLES as readonly string[]).includes(q.table),
    )
    .slice(0, MAX_PUSH_ROWS);
  if (items.length === 0) return { sent: 0, accepted: 0, rejected: [] };

  // Snapshot rows and the queue item version we are sending.
  const changes: RowEnvelope[] = [];
  const sentVersion = new Map<string, { seq: number; createdAt: number }>();
  const orphanSeqs: number[] = [];
  for (const q of items) {
    const row = (await db.table(q.table).get(q.rowId)) as Row | undefined;
    if (!row) {
      orphanSeqs.push(q.seq!);
      continue;
    }
    changes.push(toEnvelope(q.table as SyncTable, row, deviceId));
    sentVersion.set(`${q.table}:${q.rowId}`, { seq: q.seq!, createdAt: q.createdAt });
  }
  if (orphanSeqs.length) await db.syncQueue.bulkDelete(orphanSeqs);
  if (changes.length === 0) return { sent: 0, accepted: 0, rejected: [] };

  let response: PushResponse;
  try {
    response = await transport.push({ deviceId, changes });
  } catch (error) {
    // Transient failure (network, 429, 5xx): keep everything queued and DON'T count an
    // attempt — attempts only track explicit server rejections, so an outage can never
    // park data. The caller backs off.
    throw error;
  }

  await db.transaction('rw', db.syncQueue, async () => {
    for (const a of response.accepted) {
      const v = sentVersion.get(`${a.table}:${a.id}`);
      if (!v) continue;
      const current = await db.syncQueue.get(v.seq);
      // Only drop the item if the row was not changed again while the request was in flight.
      if (current && current.createdAt === v.createdAt) await db.syncQueue.delete(v.seq);
    }
    for (const r of response.rejected) {
      const v = sentVersion.get(`${r.table}:${r.id}`);
      if (!v) continue;
      if (r.reason === 'superseded') {
        await db.syncQueue.delete(v.seq); // another version won by LWW; the pull will bring it
      } else {
        await db.syncQueue.update(v.seq, { attempts: MAX_SYNC_ATTEMPTS }); // park; never loop on bad data
      }
    }
  });
  return { sent: changes.length, accepted: response.accepted.length, rejected: response.rejected };
}

/** Local natural-key lookups for tables with a unique index besides `id`. */
async function findByNaturalKey(db: LamimDB, table: SyncTable, row: Row): Promise<Row | undefined> {
  const pid = row.profileId as string;
  switch (table) {
    case 'salahEntries':
      return (await db.salahEntries
        .where('[profileId+date+prayer]')
        .equals([pid, row.date as string, row.prayer as string])
        .first()) as Row | undefined;
    case 'salahDays':
    case 'dhikrLogs':
    case 'gymLogs':
    case 'careerLogs':
      return (await db
        .table(table)
        .where('[profileId+date]')
        .equals([pid, row.date as string])
        .first()) as Row | undefined;
    case 'settings':
    case 'zakatProfiles':
      return (await db.table(table).where('profileId').equals(pid).first()) as Row | undefined;
    case 'kv':
      return (await db.kv
        .where('[profileId+key]')
        .equals([pid, row.key as string])
        .first()) as Row | undefined;
    case 'profiles':
      return row.legacyId
        ? ((await db.profiles
            .where('legacyId')
            .equals(row.legacyId as string)
            .first()) as Row | undefined)
        : undefined;
    default:
      return undefined;
  }
}

async function localVersion(db: LamimDB, table: SyncTable, row: Row, deviceId: string) {
  const pending = await db.syncQueue.where('[table+rowId]').equals([table, row.id]).first();
  // A row with a pending local edit is this device's version; otherwise it is whatever we last pulled.
  return {
    updatedAt: row.updatedAt,
    deviceId: pending ? deviceId : ((row._deviceId as string | undefined) ?? deviceId),
  };
}

export interface PullResult {
  applied: number;
  skipped: number;
  hasMore: boolean;
}

/** Pull one page from the server and apply it with LWW. Call until `hasMore` is false. */
export async function pullBatch(db: LamimDB, transport: SyncTransport): Promise<PullResult> {
  const deviceId = await getDeviceId(db);
  const cursor = await getCursor(db);
  const page = await transport.pull(cursor);
  let applied = 0;
  let skipped = 0;

  await db.transaction(
    'rw',
    [db.meta, db.syncQueue, ...SYNC_TABLES.map((t) => db.table(t))],
    async () => {
      for (const env of page.rows) {
        const table = env.table;
        const incoming = fromEnvelope(env);
        const store = db.table(table);
        const existing = (await store.get(env.id)) as Row | undefined;
        if (existing && !lwwWins(env, await localVersion(db, table, existing, deviceId))) {
          skipped++;
          continue;
        }
        // Same natural key under a different id (e.g. the same prayer logged on two devices).
        // Always check: the incoming row may be new, or an existing id that moved onto a key
        // another local row holds (otherwise the unique index would abort the whole page).
        const twin = await findByNaturalKey(db, table, incoming);
        if (twin && twin.id !== env.id) {
          if (!lwwWins(env, await localVersion(db, table, twin, deviceId))) {
            skipped++;
            continue; // our version wins; it is (or will be) pushed and supersedes theirs
          }
          await store.delete(twin.id);
          await db.syncQueue.where('[table+rowId]').equals([table, twin.id]).delete();
        }
        await store.put(incoming);
        // The server's version is now authoritative for this row; any queued local edit was older.
        await db.syncQueue.where('[table+rowId]').equals([table, env.id]).delete();
        applied++;
      }
      await db.meta.put({ key: 'sync.cursor', value: page.cursor });
    },
  );
  return { applied, skipped, hasMore: page.hasMore };
}

export interface SyncSummary {
  pushed: number;
  pulled: number;
  rejected: PushResult['rejected'];
  at: number;
}

/** Full cycle: push everything pending, then pull until caught up. */
export async function syncNow(
  db: LamimDB,
  transport: SyncTransport,
  now = Date.now,
): Promise<SyncSummary> {
  let pushed = 0;
  const rejected: PushResult['rejected'] = [];
  for (let i = 0; i < 1000; i++) {
    const r = await pushBatch(db, transport);
    if (r.sent === 0) break;
    pushed += r.accepted;
    rejected.push(...r.rejected);
    if (r.accepted === 0) break; // everything in this batch was rejected/parked; stop looping
  }
  let pulled = 0;
  for (let i = 0; i < 1000; i++) {
    const r = await pullBatch(db, transport);
    pulled += r.applied;
    if (!r.hasMore) break;
  }
  const at = now();
  await db.meta.put({ key: 'sync.lastSyncedAt', value: at });
  return { pushed, pulled, rejected, at };
}

export async function pendingCount(db: LamimDB): Promise<number> {
  return db.syncQueue.filter((q) => q.attempts < MAX_SYNC_ATTEMPTS).count();
}

/** Forget sync state (sign-out). Local data stays; the next account link re-uploads everything. */
export async function resetSyncState(db: LamimDB): Promise<void> {
  await db.meta.bulkDelete(['sync.cursor', 'sync.lastSyncedAt']);
}
