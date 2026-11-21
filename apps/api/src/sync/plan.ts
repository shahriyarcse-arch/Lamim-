/**
 * Pure push planner: given validated incoming rows and the rows currently on the server,
 * decide what to write, what to delete and what to report — no I/O, fully unit-testable.
 *
 * Rules (all conflicts resolved with the shared `lwwWins`):
 *  - Same id twice in a batch → only the LWW winner is considered; the loser is `accepted`.
 *  - id owned by another user → `rejected: forbidden`.
 *  - Incoming not newer than the stored version → `accepted` without writing (idempotent).
 *  - Natural-key clash (e.g. two devices created different ids for the same profile+date+prayer)
 *    → the LWW winner keeps the key; every loser id is `rejected: superseded`, and a losing
 *    stored row is deleted so the unique constraint can never fire.
 */
import { lwwWins, type SyncTable } from '@lamim/sync-protocol';
import { naturalKeyOf } from './tables';

type Row = Record<string, unknown>;

export interface Candidate {
  table: SyncTable;
  id: string;
  profileId: string;
  updatedAt: number;
  deletedAt: number | null;
  deviceId: string;
  /** Typed DB columns; null = tombstone with incomplete data (only applied over a stored row). */
  columns: Row | null;
  /** Quota-accounted size of the row (wire data + envelope overhead); undefined = reuse stored size. */
  bytes?: number;
}

export interface ExistingRow {
  table: SyncTable;
  id: string;
  userId: string;
  profileId: string;
  updatedAt: number;
  deletedAt: number | null;
  deviceId: string;
  columns: Row;
  bytes?: number;
}

export interface RowRef {
  table: SyncTable;
  id: string;
}

export interface Rejection extends RowRef {
  reason: string;
}

export type Write = Candidate & { columns: Row };

export interface PushPlan {
  writes: Write[];
  /** Stored rows to delete before the writes are inserted (replaced versions and superseded rows). */
  deletes: RowRef[];
  accepted: RowRef[];
  rejected: Rejection[];
}

const k = (table: string, part: string): string => `${table}\u0000${part}`;

export function planPush(
  userId: string,
  candidates: readonly Candidate[],
  existing: readonly ExistingRow[],
): PushPlan {
  const accepted: RowRef[] = [];
  const rejected: Rejection[] = [];
  const deletes = new Map<string, RowRef>();
  const ref = (r: RowRef): RowRef => ({ table: r.table, id: r.id });

  const byId = new Map<string, ExistingRow>();
  const byNk = new Map<string, ExistingRow>();
  for (const row of existing) {
    byId.set(k(row.table, row.id), row);
    if (row.userId !== userId) continue;
    const nk = naturalKeyOf(row.table, row.profileId, row.columns);
    if (nk !== null) byNk.set(k(row.table, nk), row);
  }

  // 1. Collapse duplicate ids inside the batch to their LWW winner.
  const latest = new Map<string, Candidate>();
  for (const c of candidates) {
    const key = k(c.table, c.id);
    const prev = latest.get(key);
    if (!prev) latest.set(key, c);
    else if (lwwWins(c, prev)) {
      latest.set(key, c);
      accepted.push(ref(prev));
    } else accepted.push(ref(c));
  }

  // 2. Ownership by id, LWW against the stored version, tombstone completion.
  const winners = new Map<string, Write & { nk: string | null }>();
  for (const [key, c] of latest) {
    const stored = byId.get(key);
    if (stored && stored.userId !== userId) {
      rejected.push({ ...ref(c), reason: 'forbidden' });
      continue;
    }
    if (stored && !lwwWins(c, stored)) {
      accepted.push(ref(c));
      continue;
    }
    let columns = c.columns;
    if (columns === null) {
      // Tombstone without a full row: nothing to delete if the server never had it.
      if (!stored) {
        accepted.push(ref(c));
        continue;
      }
      columns = stored.columns;
    }
    winners.set(key, { ...c, columns, nk: naturalKeyOf(c.table, c.profileId, columns) });
  }

  // 3. Natural-key conflicts: one live holder per key, chosen by LWW.
  const groups = new Map<string, (Write & { nk: string | null })[]>();
  for (const w of winners.values()) {
    if (w.nk === null) continue;
    const g = k(w.table, w.nk);
    const list = groups.get(g);
    if (list) list.push(w);
    else groups.set(g, [w]);
  }
  for (const [g, group] of groups) {
    type Contender = { kind: 'incoming'; row: Write } | { kind: 'stored'; row: ExistingRow };
    const contenders: Contender[] = group.map((row) => ({ kind: 'incoming', row }));
    const holder = byNk.get(g);
    // The stored holder competes unless a newer version of that same id is in the batch.
    if (holder && !winners.has(k(holder.table, holder.id)))
      contenders.push({ kind: 'stored', row: holder });
    if (contenders.length < 2) continue;

    let best = contenders[0] as Contender;
    for (const c of contenders.slice(1)) if (lwwWins(c.row, best.row)) best = c;

    for (const c of contenders) {
      if (c === best) continue;
      rejected.push({ ...ref(c.row), reason: 'superseded' });
      if (c.kind === 'stored') deletes.set(k(c.row.table, c.row.id), ref(c.row));
      else {
        winners.delete(k(c.row.table, c.row.id));
        // Its stored predecessor sits on this same key (holder) → it must go too.
        if (holder && holder.id === c.row.id) deletes.set(k(holder.table, holder.id), ref(holder));
      }
    }
  }

  // 4. Writes: replacing a stored version = delete + insert inside the same transaction.
  const writes: Write[] = [];
  for (const [key, w] of winners) {
    const { nk: _nk, ...write } = w;
    if (byId.has(key)) deletes.set(key, ref(write));
    writes.push(write);
    accepted.push(ref(write));
  }

  return { writes, deletes: [...deletes.values()], accepted, rejected };
}

/** Rows stamped further than this into the future are refused, so a wrong clock cannot win LWW forever. */
export const MAX_CLOCK_SKEW_MS = 5 * 60_000;

export function clockSkewError(
  row: { updatedAt: number; deletedAt: number | null },
  nowMs: number,
): string | null {
  const limit = nowMs + MAX_CLOCK_SKEW_MS;
  return row.updatedAt > limit || (row.deletedAt ?? 0) > limit ? 'clock_skew' : null;
}

export interface Usage {
  rows: number;
  bytes: number;
}

/**
 * Pre-plan quota filter. Projects each candidate's effect on (rows, bytes); anything that would
 * push the user over a quota is rejected `quota_exceeded`. Changes that do not grow usage
 * (edits that shrink, tombstones, idempotent re-pushes) always pass, so a user at the limit
 * can still edit and delete.
 */
export function applyQuota(
  userId: string,
  candidates: readonly Candidate[],
  existing: readonly ExistingRow[],
  usage: Usage,
  quota: Usage,
): { allowed: Candidate[]; rejected: Rejection[] } {
  const mine = new Map(
    existing.filter((e) => e.userId === userId).map((e) => [k(e.table, e.id), e]),
  );
  let { rows, bytes } = usage;
  const allowed: Candidate[] = [];
  const rejected: Rejection[] = [];
  for (const c of candidates) {
    const stored = mine.get(k(c.table, c.id));
    const dRows = stored ? 0 : 1;
    const dBytes = (c.bytes ?? stored?.bytes ?? 0) - (stored?.bytes ?? 0);
    const grows = dRows > 0 || dBytes > 0;
    if (grows && (rows + dRows > quota.rows || bytes + dBytes > quota.bytes)) {
      rejected.push({ table: c.table, id: c.id, reason: 'quota_exceeded' });
      continue;
    }
    rows += dRows;
    bytes += dBytes;
    allowed.push(c);
  }
  return { allowed, rejected };
}

/** Envelope invariants for profile ids that need no database lookup. */
export function profileShapeError(
  row: { table: SyncTable; id: string; profileId: string },
  globalProfileId: string,
): string | null {
  if (row.table !== 'profiles') return null;
  if (row.id === globalProfileId) return 'invalid: reserved profile id';
  if (row.profileId !== row.id) return 'invalid: profiles.profileId must equal id';
  return null;
}

/**
 * Profile ownership. `owners` maps profileId → owning userId after claiming.
 * "global" rows are always the caller's own (stored scoped by user_id).
 */
export function checkOwnership(
  userId: string,
  row: { table: SyncTable; id: string; profileId: string },
  owners: ReadonlyMap<string, string>,
  globalProfileId: string,
): string | null {
  const shape = profileShapeError(row, globalProfileId);
  if (shape) return shape;
  if (row.profileId === globalProfileId) return null;
  const owner = owners.get(row.profileId);
  if (owner === undefined) return 'forbidden: unknown profile';
  return owner === userId ? null : 'forbidden';
}
