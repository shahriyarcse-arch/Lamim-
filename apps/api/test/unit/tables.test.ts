import { SYNC_TABLES } from '@lamim/sync-protocol';
import { describe, expect, it } from 'vitest';
import { naturalKeyOf, TABLES, validateRowData } from '../../src/sync/tables';
import { sampleData } from '../helpers';

const env = { id: 'r1', profileId: 'p1', updatedAt: 1, deletedAt: null };

describe('per-table validation', () => {
  it.each(SYNC_TABLES)('%s: a valid row maps to columns and back unchanged', (table) => {
    const data = sampleData(table);
    const v = validateRowData(
      table,
      table === 'profiles' ? { ...env, profileId: 'r1' } : env,
      data,
    );
    expect(v.ok).toBe(true);
    if (v.ok) {
      // fromColumns must accept the DB representation (BigInt money) and reproduce the input.
      expect(TABLES[table].fromColumns(v.columns)).toEqual(data);
    }
  });

  it('stores money as BigInt minor units', () => {
    const v = validateRowData('transactions', env, sampleData('transactions'));
    expect(v.ok && typeof v.columns.amountMinor).toBe('bigint');
  });

  it('rejects fractional or unsafe money', () => {
    expect(
      validateRowData('transactions', env, { ...sampleData('transactions'), amountMinor: 12.5 }).ok,
    ).toBe(false);
    expect(
      validateRowData('vaults', env, { ...sampleData('vaults'), savedMinor: 2 ** 60 }).ok,
    ).toBe(false);
    expect(
      validateRowData('zakatProfiles', env, { ...sampleData('zakatProfiles'), cashMinor: '100' })
        .ok,
    ).toBe(false);
  });

  it('rejects unknown keys, wrong enums, oversized strings and bad dates', () => {
    expect(
      validateRowData('salahEntries', env, { ...sampleData('salahEntries'), hacked: 1 }).ok,
    ).toBe(false);
    expect(
      validateRowData('salahEntries', env, { ...sampleData('salahEntries'), prayer: 'brunch' }).ok,
    ).toBe(false);
    expect(
      validateRowData('transactions', env, {
        ...sampleData('transactions'),
        description: 'x'.repeat(1001),
      }).ok,
    ).toBe(false);
    expect(
      validateRowData('dhikrLogs', env, { ...sampleData('dhikrLogs'), date: '21/11/2026' }).ok,
    ).toBe(false);
    expect(validateRowData('settings', env, { ...sampleData('settings'), lat: 123 }).ok).toBe(
      false,
    );
  });

  it('rejects a kv row without a value but accepts a JSON null value', () => {
    expect(validateRowData('kv', env, { key: 'a' }).ok).toBe(false);
    expect(validateRowData('kv', env, { key: 'a', value: null }).ok).toBe(true);
  });

  it('caps kv.value JSON size', () => {
    expect(validateRowData('kv', env, { key: 'a', value: 'x'.repeat(32 * 1024 - 2) }).ok).toBe(
      true,
    );
    expect(validateRowData('kv', env, { key: 'a', value: 'x'.repeat(32 * 1024) }).ok).toBe(false);
  });

  it('accepts envelope fields repeated in data only when they agree', () => {
    expect(
      validateRowData('salahEntries', env, {
        ...sampleData('salahEntries'),
        id: 'r1',
        updatedAt: 1,
      }).ok,
    ).toBe(true);
    const v = validateRowData('salahEntries', env, { ...sampleData('salahEntries'), id: 'other' });
    expect(v.ok).toBe(false);
  });

  it('natural keys include the profile and the table-specific fields', () => {
    const cols = { date: '2026-11-21', prayer: 'fajr', status: 'alone' };
    expect(naturalKeyOf('salahEntries', 'p1', cols)).toBe(
      JSON.stringify(['p1', '2026-11-21', 'fajr']),
    );
    expect(naturalKeyOf('settings', 'p1', {})).toBe(JSON.stringify(['p1']));
    expect(naturalKeyOf('transactions', 'p1', {})).toBeNull();
  });
});
