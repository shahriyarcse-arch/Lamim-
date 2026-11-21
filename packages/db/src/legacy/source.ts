/**
 * Read-only access to the legacy vanilla app's storage.
 *
 * The legacy app kept everything as JSON strings in IndexedDB `lamim_db` →
 * object store `keyvalue`, and fell back to localStorage (`lamim_*`, `usr_*`)
 * whenever IndexedDB was unavailable. Both are read; neither is ever modified.
 */

export const LEGACY_DB_NAME = 'lamim_db';
export const LEGACY_STORE = 'keyvalue';

export type LegacySourceName = 'indexeddb' | 'localStorage';

export interface LegacySnapshot {
  readonly source: LegacySourceName;
  readonly entries: ReadonlyMap<string, string>;
}

const isLegacyKey = (k: string) => k.startsWith('lamim_') || k.startsWith('usr_');

/**
 * Read every key/value from `lamim_db`. Returns null when the database does not
 * exist — without creating it: an upgrade event means "new database", so the
 * versionchange transaction is aborted and nothing is persisted.
 */
export function readLegacyIndexedDB(
  factory: IDBFactory | undefined = globalThis.indexedDB,
  dbName: string = LEGACY_DB_NAME,
): Promise<LegacySnapshot | null> {
  if (!factory) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    let isNew = false;
    try {
      request = factory.open(dbName); // no version: never triggers an upgrade on an existing DB
    } catch (err) {
      reject(err);
      return;
    }

    request.onupgradeneeded = () => {
      isNew = true;
      request.transaction?.abort();
    };

    request.onblocked = () => {
      /* another tab holds an old connection; open completes when it closes */
    };

    request.onerror = (event) => {
      if (isNew) {
        event.preventDefault();
        resolve(null);
        return;
      }
      reject(request.error ?? new Error('Failed to open legacy database'));
    };

    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LEGACY_STORE)) {
        db.close();
        resolve({ source: 'indexeddb', entries: new Map() });
        return;
      }
      const entries = new Map<string, string>();
      const tx = db.transaction(LEGACY_STORE, 'readonly');
      const cursorReq = tx.objectStore(LEGACY_STORE).openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) return;
        const key = String(cursor.key);
        const value = cursor.value as unknown;
        if (isLegacyKey(key)) {
          entries.set(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        cursor.continue();
      };
      tx.oncomplete = () => {
        db.close();
        resolve({ source: 'indexeddb', entries });
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error ?? new Error('Failed to read legacy database'));
      };
    };
  });
}

/** Minimal Storage surface so tests can pass a plain object. */
export interface StorageLike {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
}

export function readLegacyLocalStorage(storage: StorageLike | undefined): LegacySnapshot | null {
  if (!storage) return null;
  const entries = new Map<string, string>();
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !isLegacyKey(key)) continue;
    const value = storage.getItem(key);
    if (value !== null) entries.set(key, value);
  }
  return { source: 'localStorage', entries };
}
