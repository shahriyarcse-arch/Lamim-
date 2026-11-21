import { describe, expect, it } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { planLegacyImport, unescapeLegacyHtml } from '../src/legacy/plan';
import { readLegacyIndexedDB, readLegacyLocalStorage } from '../src/legacy/source';
import { SCHEMA_V1 } from '../src/schema';
import { UUID_V7_RE, uuidv7, uuidv7Timestamp } from '../src/uuid';
import { databaseNames, memoryStorage } from './fixtures';

describe('uuidv7', () => {
  it('produces RFC 9562 version-7 ids carrying the timestamp', () => {
    const t = Date.UTC(2026, 10, 21);
    const id = uuidv7(t + 5_000); // later than any previous call in this file
    expect(id).toMatch(UUID_V7_RE);
    expect(uuidv7Timestamp(id)).toBe(t + 5_000);
  });

  it('is unique and strictly increasing within the same millisecond', () => {
    const t = Date.UTC(2030, 0, 1);
    const ids = Array.from({ length: 5_000 }, () => uuidv7(t));
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(ids);
  });

  it('stays monotonic when the clock goes backwards', () => {
    const a = uuidv7(Date.UTC(2031, 0, 1));
    const b = uuidv7(Date.UTC(2020, 0, 1));
    expect(b > a).toBe(true);
  });
});

describe('unescapeLegacyHtml', () => {
  it('reverses legacy Utils.escapeHTML exactly once', () => {
    expect(unescapeLegacyHtml('a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#39;')).toBe(
      `a & b <c> "d" 'e'`,
    );
    expect(unescapeLegacyHtml('&amp;lt;')).toBe('&lt;'); // no double-unescape
    expect(unescapeLegacyHtml('plain & text')).toBe('plain & text');
  });
});

describe('legacy sources', () => {
  it('readLegacyIndexedDB returns null without creating the database', async () => {
    const factory = new IDBFactory();
    expect(await readLegacyIndexedDB(factory)).toBeNull();
    expect(await databaseNames(factory)).not.toContain('lamim_db');
  });

  it('readLegacyIndexedDB tolerates a database without the keyvalue store', async () => {
    const factory = new IDBFactory();
    await new Promise<void>((resolve) => {
      const req = factory.open('lamim_db', 1);
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
    });
    expect(await readLegacyIndexedDB(factory)).toEqual({ source: 'indexeddb', entries: new Map() });
  });

  it('readLegacyIndexedDB returns null when no factory is available', async () => {
    expect(await readLegacyIndexedDB(undefined)).toBeNull();
  });

  it('readLegacyLocalStorage keeps only legacy keys', () => {
    const snap = readLegacyLocalStorage(
      memoryStorage({ lamim_a: '1', usr_x_lamim_b: '2', other: '3' }),
    );
    expect(Object.fromEntries(snap!.entries)).toEqual({ lamim_a: '1', usr_x_lamim_b: '2' });
    expect(readLegacyLocalStorage(undefined)).toBeNull();
  });
});

describe('planLegacyImport (pure)', () => {
  let n = 0;
  const opts = { now: 1, newId: () => `id-${++n}` };

  it('unscoped data without an active profile is quarantined, not dropped', () => {
    const plan = planLegacyImport(
      [
        {
          source: 'indexeddb',
          entries: new Map([['lamim_salah_2026-11-20', '{"fajr":"jamaat"}']]),
        },
      ],
      opts,
    );
    expect(plan.rows.salahEntries).toHaveLength(0);
    expect(plan.quarantine).toEqual([
      expect.objectContaining({
        legacyKey: 'lamim_salah_2026-11-20',
        reason: 'unscoped data with no active profile',
      }),
    ]);
    expect(plan.archive).toHaveLength(1);
  });

  it('scoped data wins over an unscoped orphan for the same key', () => {
    const plan = planLegacyImport(
      [
        {
          source: 'indexeddb',
          entries: new Map([
            ['lamim_user', JSON.stringify({ id: 'u1', name: 'U' })],
            ['lamim_salah_2026-11-20', '{"fajr":"missed"}'],
            ['usr_u1_lamim_salah_2026-11-20', '{"fajr":"jamaat"}'],
          ]),
        },
      ],
      opts,
    );
    expect(plan.rows.salahEntries.map((e) => e.status)).toEqual(['jamaat']);
  });

  it('invalid prayer coordinates and settings values fall back safely', () => {
    const plan = planLegacyImport(
      [
        {
          source: 'indexeddb',
          entries: new Map([
            ['lamim_user', JSON.stringify({ id: 'u1', name: 'U' })],
            [
              'usr_u1_lamim_settings',
              JSON.stringify({ lat: 999, lng: 'x', currency: 'EUR', hijriOffset: 9 }),
            ],
          ]),
        },
      ],
      opts,
    );
    expect(plan.rows.settings[0]).toMatchObject({
      lat: null,
      lng: null,
      currency: 'USD',
      hijriOffset: 0,
    });
  });
});

describe('schema', () => {
  it('declares the unique per-day and per-prayer indexes', () => {
    expect(SCHEMA_V1.salahEntries).toContain('&[profileId+date+prayer]');
    for (const t of ['salahDays', 'dhikrLogs', 'gymLogs', 'careerLogs'] as const) {
      expect(SCHEMA_V1[t]).toContain('&[profileId+date]');
    }
  });
});
