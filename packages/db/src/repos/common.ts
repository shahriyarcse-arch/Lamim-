import type { LamimDB, SyncQueueItem } from '../schema';

/**
 * Next `updatedAt` for a row: wall-clock now, but always strictly greater than the
 * previous value so last-write-wins ordering survives clock skew on one device.
 */
export function nextUpdatedAt(previous: number | undefined, now: number): number {
  return previous !== undefined && now <= previous ? previous + 1 : now;
}

/** Record a local change for the Phase 2 sync engine; coalesces pending items per row. Call inside a transaction that includes `syncQueue`. */
export async function enqueueSync(
  db: LamimDB,
  table: string,
  rowId: string,
  op: SyncQueueItem['op'],
  now: number,
): Promise<void> {
  const pending = await db.syncQueue.where('[table+rowId]').equals([table, rowId]).first();
  if (pending?.seq !== undefined) {
    // A new local edit is a new version: give it a fresh set of attempts.
    await db.syncQueue.update(pending.seq, { op, createdAt: now, attempts: 0 });
  } else {
    await db.syncQueue.add({ table, rowId, op, createdAt: now, attempts: 0 });
  }
}
