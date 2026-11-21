import { Inject, Injectable } from '@nestjs/common';
import {
  GLOBAL_PROFILE_ID,
  MAX_ROW_BYTES,
  type PullResponse,
  type PushRequest,
  type PushResponse,
  type RowEnvelope,
  SYNC_TABLES,
  type SyncTable,
} from '@lamim/sync-protocol';
import { JsonLogger, LOGGER } from '../common/logger';
import { TooManyRequestsException } from '../common/rate-limit';
import { APP_CONFIG, type AppConfig } from '../config';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  applyQuota,
  type Candidate,
  checkOwnership,
  clockSkewError,
  type ExistingRow,
  planPush,
  profileShapeError,
  type Rejection,
  type RowRef,
} from './plan';
import { SyncGate } from './sync-gate';
import { TABLES, validateRowData } from './tables';

type Row = Record<string, unknown>;
type Tx = Prisma.TransactionClient;
interface Delegate {
  findMany(args: unknown): Promise<Row[]>;
  deleteMany(args: unknown): Promise<{ count: number }>;
  createMany(args: unknown): Promise<{ count: number }>;
}

/** A user may own at most this many distinct profiles (abuse guard on profile-id claiming). */
export const MAX_PROFILES_PER_USER = 20;
const MAX_INT8 = 9_223_372_036_854_775_807n;
/** Per-row accounting overhead for the envelope columns (ids, timestamps, rev). */
const ENVELOPE_BYTES = 128;
const rowBytes = (data: unknown): number =>
  Buffer.byteLength(JSON.stringify(data), 'utf8') + ENVELOPE_BYTES;

/** Physical table names (Prisma @@map) for the hand-written pull index query. */
const DB_TABLE: Readonly<Record<SyncTable, string>> = {
  profiles: 'profiles',
  settings: 'settings',
  salahEntries: 'salah_entries',
  salahDays: 'salah_days',
  dhikrLogs: 'dhikr_logs',
  gymLogs: 'gym_logs',
  careerLogs: 'career_logs',
  habits: 'habits',
  habitEvents: 'habit_events',
  transactions: 'transactions',
  vaults: 'vaults',
  zakatProfiles: 'zakat_profiles',
  kv: 'kv',
};

const COMMON = new Set(['id', 'userId', 'profileId', 'updatedAt', 'deletedAt', 'deviceId', 'rev']);

const delegate = (tx: Tx | PrismaService, table: SyncTable): Delegate =>
  (tx as unknown as Record<string, Delegate>)[TABLES[table].model] as Delegate;

/** Typed DB row → wire `data` (exact client row shape minus envelope fields). */
function toData(table: SyncTable, row: Row): Row {
  const domain: Row = {};
  for (const [key, value] of Object.entries(row)) if (!COMMON.has(key)) domain[key] = value;
  return TABLES[table].fromColumns(domain);
}

function toExisting(table: SyncTable, row: Row): ExistingRow {
  const data = toData(table, row);
  return {
    table,
    id: row.id as string,
    userId: row.userId as string,
    profileId: row.profileId as string,
    updatedAt: Number(row.updatedAt as bigint),
    deletedAt: row.deletedAt === null ? null : Number(row.deletedAt as bigint),
    deviceId: row.deviceId as string,
    // Round-trip through the wire shape so the columns are valid create input again.
    columns: TABLES[table].toColumns(data),
    bytes: rowBytes(data),
  };
}

const isRetryable = (err: unknown): boolean =>
  err instanceof Prisma.PrismaClientKnownRequestError &&
  (err.code === 'P2002' || err.code === 'P2034');

@Injectable()
export class SyncService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(LOGGER) private readonly logger: JsonLogger,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(SyncGate) private readonly gate: SyncGate,
  ) {}

  push(userId: string, req: PushRequest): Promise<PushResponse> {
    return this.gate.run(userId, () => this.pushNow(userId, req));
  }

  pull(userId: string, cursor: string, limit: number): Promise<PullResponse> {
    return this.gate.run(userId, () => this.pullNow(userId, cursor, limit));
  }

  private async pushNow(userId: string, req: PushRequest): Promise<PushResponse> {
    const now = Date.now();
    const rejected: Rejection[] = [];
    const candidates: Candidate[] = [];

    // Stateless validation first: size, envelope invariants, per-table data schema.
    for (const change of req.changes) {
      const reject = (reason: string) =>
        rejected.push({ table: change.table, id: change.id, reason });
      if (Buffer.byteLength(JSON.stringify(change.data), 'utf8') > MAX_ROW_BYTES) {
        reject('too_large');
        continue;
      }
      const shape = profileShapeError(change, GLOBAL_PROFILE_ID) ?? clockSkewError(change, now);
      if (shape) {
        reject(shape);
        continue;
      }
      const v = validateRowData(change.table, change, change.data);
      if (!v.ok && change.deletedAt === null) {
        reject(v.reason);
        continue;
      }
      candidates.push({
        table: change.table,
        id: change.id,
        profileId: change.profileId,
        updatedAt: change.updatedAt,
        deletedAt: change.deletedAt,
        deviceId: change.deviceId,
        columns: v.ok ? v.columns : null,
        ...(v.ok ? { bytes: rowBytes(change.data) } : {}),
      });
    }

    let result: { accepted: RowRef[]; rejected: Rejection[]; written: number } = {
      accepted: [],
      rejected: [],
      written: 0,
    };
    if (candidates.length > 0) {
      for (let attempt = 1; ; attempt++) {
        try {
          result = await this.prisma.$transaction((tx) => this.applyInTx(tx, userId, candidates), {
            maxWait: 5_000,
            timeout: 30_000,
          });
          break;
        } catch (err) {
          // A cross-user race on a brand-new id/profile id: retry once; the re-read resolves it.
          if (attempt >= 2 || !isRetryable(err)) throw err;
        }
      }
    }

    this.logger.event('info', 'sync.push', {
      userId,
      deviceId: req.deviceId,
      received: req.changes.length,
      written: result.written,
      accepted: result.accepted.length,
      rejected: rejected.length + result.rejected.length,
    });
    return {
      accepted: result.accepted,
      rejected: [...rejected, ...result.rejected],
      serverTime: Date.now(),
    };
  }

  private async applyInTx(
    tx: Tx,
    userId: string,
    incoming: Candidate[],
  ): Promise<{ accepted: RowRef[]; rejected: Rejection[]; written: number }> {
    // Serialise this user's pushes across API instances so revs commit in order (a puller can
    // never skip a lower rev that commits after a higher one). In-process callers are already
    // serialised by SyncGate, so a held lock means another instance: never wait on it while
    // holding a pooled connection; tell the client to retry instead.
    const [lock] = await tx.$queryRaw<
      { ok: boolean }[]
    >`SELECT pg_try_advisory_xact_lock(hashtext(${userId})) AS ok`;
    if (!lock?.ok)
      throw new TooManyRequestsException(2, 'Sync already in progress for this account');

    const rejected: Rejection[] = [];
    const owners = await this.claimProfiles(tx, userId, incoming, rejected);
    const owned = incoming.filter((c) => {
      const reason = checkOwnership(userId, c, owners, GLOBAL_PROFILE_ID);
      if (reason) rejected.push({ table: c.table, id: c.id, reason });
      return !reason;
    });

    const existing = await this.loadExisting(tx, userId, owned);
    const usage = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { syncRowCount: true, syncBytes: true },
    });
    const quota = applyQuota(
      userId,
      owned,
      existing,
      { rows: Number(usage.syncRowCount), bytes: Number(usage.syncBytes) },
      { rows: this.config.SYNC_QUOTA_ROWS, bytes: this.config.SYNC_QUOTA_BYTES },
    );
    rejected.push(...quota.rejected);
    const plan = planPush(userId, quota.allowed, existing);

    if (plan.writes.length > 0 || plan.deletes.length > 0) {
      const revs = plan.writes.length
        ? (
            await tx.$queryRaw<
              { v: string }[]
            >`SELECT nextval(${this.prisma.syncRevSequence}::regclass)::text AS v FROM generate_series(1, ${plan.writes.length}::int)`
          )
            .map((r) => BigInt(r.v))
            .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
        : [];

      for (const table of SYNC_TABLES) {
        const ids = plan.deletes.filter((d) => d.table === table).map((d) => d.id);
        if (ids.length)
          await delegate(tx, table).deleteMany({ where: { userId, id: { in: ids } } });
      }
      let i = 0;
      for (const table of SYNC_TABLES) {
        const data = plan.writes
          .filter((w) => w.table === table)
          .map((w) => ({
            ...w.columns,
            id: w.id,
            userId,
            profileId: w.profileId,
            updatedAt: BigInt(w.updatedAt),
            deletedAt: w.deletedAt === null ? null : BigInt(w.deletedAt),
            deviceId: w.deviceId,
            rev: revs[i++] as bigint,
          }));
        if (data.length) await delegate(tx, table).createMany({ data });
      }

      // Exact usage delta from what was actually written / removed.
      const storedById = new Map(existing.map((e) => [`${e.table}:${e.id}`, e]));
      const removedBytes = plan.deletes.reduce(
        (sum, d) => sum + (storedById.get(`${d.table}:${d.id}`)?.bytes ?? 0),
        0,
      );
      const addedBytes = plan.writes.reduce(
        (sum, w) => sum + (w.bytes ?? storedById.get(`${w.table}:${w.id}`)?.bytes ?? 0),
        0,
      );
      await tx.user.update({
        where: { id: userId },
        data: {
          syncRowCount: { increment: plan.writes.length - plan.deletes.length },
          syncBytes: { increment: addedBytes - removedBytes },
        },
      });
    }

    return {
      accepted: plan.accepted,
      rejected: [...rejected, ...plan.rejected],
      written: plan.writes.length,
    };
  }

  /** Load owners of every referenced profile, claiming unowned ids for this user (bounded). */
  private async claimProfiles(
    tx: Tx,
    userId: string,
    rows: Candidate[],
    rejected: Rejection[],
  ): Promise<Map<string, string>> {
    const ids = [...new Set(rows.map((r) => r.profileId).filter((p) => p !== GLOBAL_PROFILE_ID))];
    const owners = new Map<string, string>();
    if (ids.length === 0) return owners;
    for (const o of await tx.profileOwner.findMany({ where: { profileId: { in: ids } } }))
      owners.set(o.profileId, o.userId);

    const unclaimed = ids.filter((id) => !owners.has(id));
    if (unclaimed.length > 0) {
      const owned = await tx.profileOwner.count({ where: { userId } });
      const room = Math.max(0, MAX_PROFILES_PER_USER - owned);
      const claim = unclaimed.slice(0, room);
      const overflow = new Set(unclaimed.slice(room));
      if (claim.length) {
        await tx.profileOwner.createMany({
          data: claim.map((profileId) => ({ profileId, userId })),
          skipDuplicates: true,
        });
        for (const o of await tx.profileOwner.findMany({ where: { profileId: { in: claim } } }))
          owners.set(o.profileId, o.userId);
      }
      if (overflow.size) {
        for (const r of rows)
          if (overflow.has(r.profileId))
            rejected.push({ table: r.table, id: r.id, reason: 'profile_limit' });
        // Mark as foreign so checkOwnership drops them without a second rejection.
        for (const p of overflow) owners.set(p, '');
      }
    }
    return owners;
  }

  private async loadExisting(tx: Tx, userId: string, rows: Candidate[]): Promise<ExistingRow[]> {
    const out: ExistingRow[] = [];
    for (const table of SYNC_TABLES) {
      const mine = rows.filter((r) => r.table === table);
      if (mine.length === 0) continue;
      const seen = new Set<string>();
      const add = (r: Row) => {
        if (seen.has(r.id as string)) return;
        seen.add(r.id as string);
        out.push(toExisting(table, r));
      };
      // By id across all users, so a foreign id is detected (and rejected) instead of colliding.
      for (const r of await delegate(tx, table).findMany({
        where: { id: { in: mine.map((m) => m.id) } },
      }))
        add(r);

      const fields = TABLES[table].naturalKey;
      const keyed = mine.filter((m) => m.columns !== null);
      if (fields && keyed.length) {
        const or = keyed.map((m) => {
          const where: Row = { profileId: m.profileId };
          for (const f of fields) where[f] = (m.columns as Row)[f];
          return where;
        });
        for (const r of await delegate(tx, table).findMany({ where: { userId, OR: or } })) add(r);
      }
    }
    return out;
  }

  /**
   * One index query (UNION ALL of per-table `rev > cursor ORDER BY rev LIMIT n`, each served by
   * the (user_id, rev) index) picks the page; then only the tables on that page are fetched,
   * sequentially, so a pull holds one connection at a time.
   */
  private async pullNow(userId: string, cursor: string, limit: number): Promise<PullResponse> {
    const after = BigInt(cursor);
    if (after >= MAX_INT8) return { rows: [], cursor, hasMore: false };

    const take = limit + 1;
    const branches = SYNC_TABLES.map(
      (table) =>
        Prisma.sql`(SELECT ${table}::text AS t, id, rev FROM ${Prisma.raw(
          `${this.prisma.schemaSql}."${DB_TABLE[table]}"`,
        )} WHERE user_id = ${userId}::uuid AND rev > ${after}::bigint ORDER BY rev LIMIT ${take}::int)`,
    );
    const index = await this.prisma.$queryRaw<{ t: SyncTable; id: string; rev: string }[]>(
      Prisma.sql`SELECT t, id, rev::text AS rev FROM (${Prisma.join(branches, ' UNION ALL ')}) AS page ORDER BY page.rev LIMIT ${take}::int`,
    );
    const page = index.slice(0, limit).map((r) => ({ table: r.t, id: r.id, rev: BigInt(r.rev) }));

    const loaded = new Map<string, Row>();
    for (const table of SYNC_TABLES) {
      const ids = page.filter((p) => p.table === table).map((p) => p.id);
      if (ids.length === 0) continue;
      for (const row of await delegate(this.prisma, table).findMany({
        where: { userId, id: { in: ids } },
      }))
        loaded.set(`${table}:${row.id as string}`, row);
    }

    const rows: RowEnvelope[] = [];
    for (const { table, id } of page) {
      const row = loaded.get(`${table}:${id}`);
      if (!row) continue; // cannot happen inside the per-user lane; defensive
      rows.push({
        table,
        id,
        profileId: row.profileId as string,
        updatedAt: Number(row.updatedAt as bigint),
        deletedAt: row.deletedAt === null ? null : Number(row.deletedAt as bigint),
        deviceId: row.deviceId as string,
        data: toData(table, row),
      });
    }
    const last = page[page.length - 1];
    return { rows, cursor: last ? last.rev.toString() : cursor, hasMore: index.length > limit };
  }
}
