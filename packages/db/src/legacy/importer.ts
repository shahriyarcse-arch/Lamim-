/**
 * Legacy importer: reads the vanilla app's storage once and commits the mapped
 * rows into the new database inside ONE read-write transaction — all or nothing.
 *
 * - Idempotent: `meta.migratedFrom` is written in the same transaction; once it
 *   exists the importer is a no-op. Concurrent tabs are serialized by the
 *   transaction and the loser sees the marker and writes nothing.
 * - The legacy database is opened read-only and never deleted (rollback path).
 * - On failure nothing is written and the marker stays absent, so the next boot retries.
 */
import { DB_NAME, type LamimDB } from '../schema';
import { uuidv7 } from '../uuid';
import { planLegacyImport, LEGACY_IMPORT_VERSION, type ImportReport } from './plan';
import {
  readLegacyIndexedDB,
  readLegacyLocalStorage,
  type LegacySnapshot,
  type StorageLike,
} from './source';

export type ImportResult =
  | { status: 'already-migrated' }
  | { status: 'no-legacy-data' }
  | { status: 'imported'; report: ImportReport };

export interface ImportOptions {
  /** Override legacy reading (tests, workers). Default: IndexedDB `lamim_db` + localStorage. */
  readSources?: () => Promise<LegacySnapshot[]>;
  /** Legacy-source dependencies for the default reader. */
  indexedDB?: IDBFactory;
  localStorage?: StorageLike;
  now?: () => number;
  newId?: () => string;
}

export async function defaultLegacySources(
  factory: IDBFactory | undefined = globalThis.indexedDB,
  storage: StorageLike | undefined = (globalThis as { localStorage?: StorageLike }).localStorage,
): Promise<LegacySnapshot[]> {
  const out: LegacySnapshot[] = [];
  const idb = await readLegacyIndexedDB(factory);
  if (idb) out.push(idb);
  let ls: LegacySnapshot | null = null;
  try {
    ls = readLegacyLocalStorage(storage);
  } catch {
    ls = null; // Storage access can throw (privacy mode); IndexedDB data is still imported.
  }
  if (ls) out.push(ls);
  return out;
}

export async function runLegacyImport(db: LamimDB, options: ImportOptions = {}): Promise<ImportResult> {
  if (db.name !== DB_NAME && !options.readSources && !options.indexedDB) {
    // Guard against accidentally importing into a test/scratch database from real storage.
    throw new Error(`runLegacyImport: refusing default sources for non-production DB "${db.name}"`);
  }
  if (await db.meta.get('migratedFrom')) return { status: 'already-migrated' };

  const now = options.now ?? Date.now;
  const snapshots = options.readSources
    ? await options.readSources()
    : await defaultLegacySources(options.indexedDB, options.localStorage);
  const nonEmpty = snapshots.filter((s) => s.entries.size > 0);

  if (nonEmpty.length === 0) {
    await db.transaction('rw', db.meta, async () => {
      if (await db.meta.get('migratedFrom')) return;
      await db.meta.put({ key: 'migratedFrom', value: { version: 'none', at: now() } });
    });
    return { status: 'no-legacy-data' };
  }

  // Map outside the transaction (pure, synchronous); only Dexie calls inside it.
  const plan = planLegacyImport(nonEmpty, { now: now(), newId: options.newId ?? (() => uuidv7()) });

  let raced = false;
  await db.transaction('rw', db.tables, async () => {
    if (await db.meta.get('migratedFrom')) {
      raced = true;
      return;
    }
    const { rows } = plan;
    await Promise.all([
      db.profiles.bulkAdd(rows.profiles),
      db.settings.bulkAdd(rows.settings),
      db.salahEntries.bulkAdd(rows.salahEntries),
      db.salahDays.bulkAdd(rows.salahDays),
      db.dhikrLogs.bulkAdd(rows.dhikrLogs),
      db.gymLogs.bulkAdd(rows.gymLogs),
      db.careerLogs.bulkAdd(rows.careerLogs),
      db.habits.bulkAdd(rows.habits),
      db.habitEvents.bulkAdd(rows.habitEvents),
      db.transactions.bulkAdd(rows.transactions),
      db.vaults.bulkAdd(rows.vaults),
      db.zakatProfiles.bulkAdd(rows.zakatProfiles),
      db.kv.bulkAdd(rows.kv),
      db.quarantine.bulkAdd(plan.quarantine),
      db.legacyArchive.bulkAdd(plan.archive),
    ]);
    // Marker last: it only becomes visible if everything above committed.
    await db.meta.bulkPut(plan.meta);
  });

  if (raced) return { status: 'already-migrated' };
  return { status: 'imported', report: plan.report };
}

export { LEGACY_IMPORT_VERSION };
