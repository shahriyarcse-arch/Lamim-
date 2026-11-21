import { GLOBAL_PROFILE_ID, lwwWins } from '@lamim/sync-protocol';
import { describe, expect, it } from 'vitest';
import {
  applyQuota,
  type Candidate,
  checkOwnership,
  clockSkewError,
  type ExistingRow,
  MAX_CLOCK_SKEW_MS,
  planPush,
} from '../../src/sync/plan';

const U = 'user-a';
const entry = (
  id: string,
  updatedAt: number,
  deviceId = 'devA',
  prayer = 'fajr',
  status = 'jamaat',
): Candidate => ({
  table: 'salahEntries',
  id,
  profileId: 'p1',
  updatedAt,
  deletedAt: null,
  deviceId,
  columns: { date: '2026-11-21', prayer, status },
});
const stored = (c: Candidate, userId = U): ExistingRow => ({
  ...c,
  userId,
  columns: c.columns ?? {},
});

describe('lwwWins (shared contract)', () => {
  it('later updatedAt wins, ties go to the larger deviceId, equal versions are not re-applied', () => {
    expect(lwwWins({ updatedAt: 2, deviceId: 'a' }, { updatedAt: 1, deviceId: 'z' })).toBe(true);
    expect(lwwWins({ updatedAt: 1, deviceId: 'z' }, { updatedAt: 2, deviceId: 'a' })).toBe(false);
    expect(lwwWins({ updatedAt: 1, deviceId: 'b' }, { updatedAt: 1, deviceId: 'a' })).toBe(true);
    expect(lwwWins({ updatedAt: 1, deviceId: 'a' }, { updatedAt: 1, deviceId: 'a' })).toBe(false);
  });
});

describe('planPush', () => {
  it('writes a brand-new row', () => {
    const plan = planPush(U, [entry('e1', 10)], []);
    expect(plan.writes.map((w) => w.id)).toEqual(['e1']);
    expect(plan.deletes).toEqual([]);
    expect(plan.accepted).toEqual([{ table: 'salahEntries', id: 'e1' }]);
  });

  it('ignores an older write but still accepts it', () => {
    const plan = planPush(U, [entry('e1', 5)], [stored(entry('e1', 10))]);
    expect(plan.writes).toEqual([]);
    expect(plan.accepted).toEqual([{ table: 'salahEntries', id: 'e1' }]);
    expect(plan.rejected).toEqual([]);
  });

  it('applies a newer write as delete + insert of the same id', () => {
    const plan = planPush(U, [entry('e1', 20, 'devA', 'fajr', 'alone')], [stored(entry('e1', 10))]);
    expect(plan.writes[0]?.columns.status).toBe('alone');
    expect(plan.deletes).toEqual([{ table: 'salahEntries', id: 'e1' }]);
  });

  it('breaks exact timestamp ties by deviceId', () => {
    expect(
      planPush(U, [entry('e1', 10, 'devZ')], [stored(entry('e1', 10, 'devA'))]).writes,
    ).toHaveLength(1);
    expect(
      planPush(U, [entry('e1', 10, 'devA')], [stored(entry('e1', 10, 'devZ'))]).writes,
    ).toHaveLength(0);
  });

  it('is idempotent: re-pushing the stored version writes nothing', () => {
    const plan = planPush(U, [entry('e1', 10)], [stored(entry('e1', 10))]);
    expect(plan.writes).toEqual([]);
    expect(plan.accepted).toHaveLength(1);
  });

  it('collapses duplicate ids in one batch to the LWW winner', () => {
    const plan = planPush(
      U,
      [entry('e1', 10, 'devA', 'fajr', 'alone'), entry('e1', 30), entry('e1', 20)],
      [],
    );
    expect(plan.writes).toHaveLength(1);
    expect(plan.writes[0]?.updatedAt).toBe(30);
    expect(plan.accepted).toHaveLength(3);
  });

  it("rejects writes to another user's row id", () => {
    const plan = planPush(U, [entry('e1', 99)], [stored(entry('e1', 1), 'user-b')]);
    expect(plan.writes).toEqual([]);
    expect(plan.rejected).toEqual([{ table: 'salahEntries', id: 'e1', reason: 'forbidden' }]);
  });

  it('natural-key clash: newer incoming id takes the key, stored loser is deleted and reported', () => {
    const plan = planPush(U, [entry('y', 20)], [stored(entry('x', 10))]);
    expect(plan.writes.map((w) => w.id)).toEqual(['y']);
    expect(plan.deletes).toEqual([{ table: 'salahEntries', id: 'x' }]);
    expect(plan.rejected).toEqual([{ table: 'salahEntries', id: 'x', reason: 'superseded' }]);
  });

  it('natural-key clash: older incoming id is rejected as superseded', () => {
    const plan = planPush(U, [entry('y', 5)], [stored(entry('x', 10))]);
    expect(plan.writes).toEqual([]);
    expect(plan.deletes).toEqual([]);
    expect(plan.rejected).toEqual([{ table: 'salahEntries', id: 'y', reason: 'superseded' }]);
  });

  it('natural-key clash inside one batch keeps only the winner', () => {
    const plan = planPush(U, [entry('x', 10), entry('y', 10, 'devZ')], []);
    expect(plan.writes.map((w) => w.id)).toEqual(['y']);
    expect(plan.rejected).toEqual([{ table: 'salahEntries', id: 'x', reason: 'superseded' }]);
  });

  it('a row moving off a key frees it for another incoming row', () => {
    const moved = {
      ...entry('x', 20),
      columns: { date: '2026-11-21', prayer: 'dhuhr', status: 'alone' },
    };
    const plan = planPush(U, [moved, entry('y', 15)], [stored(entry('x', 10))]);
    expect(plan.writes.map((w) => w.id).sort()).toEqual(['x', 'y']);
    expect(plan.rejected).toEqual([]);
  });

  it('tombstone with incomplete data: no-op when unknown, applied over the stored row otherwise', () => {
    const tomb: Candidate = { ...entry('e1', 50), deletedAt: 50, columns: null };
    expect(planPush(U, [tomb], []).writes).toEqual([]);
    expect(planPush(U, [tomb], []).accepted).toHaveLength(1);
    const plan = planPush(U, [tomb], [stored(entry('e1', 10))]);
    expect(plan.writes[0]).toMatchObject({
      id: 'e1',
      deletedAt: 50,
      columns: { prayer: 'fajr', status: 'jamaat' },
    });
  });
});

describe('checkOwnership', () => {
  const owners = new Map([
    ['p1', U],
    ['p2', 'user-b'],
  ]);
  it('allows own profiles and the per-user global profile', () => {
    expect(
      checkOwnership(U, { table: 'kv', id: 'k', profileId: 'p1' }, owners, GLOBAL_PROFILE_ID),
    ).toBeNull();
    expect(
      checkOwnership(
        U,
        { table: 'kv', id: 'k', profileId: GLOBAL_PROFILE_ID },
        owners,
        GLOBAL_PROFILE_ID,
      ),
    ).toBeNull();
    expect(
      checkOwnership(
        U,
        { table: 'profiles', id: 'p1', profileId: 'p1' },
        owners,
        GLOBAL_PROFILE_ID,
      ),
    ).toBeNull();
  });
  it("rejects another user's profile and unknown profiles", () => {
    expect(
      checkOwnership(U, { table: 'kv', id: 'k', profileId: 'p2' }, owners, GLOBAL_PROFILE_ID),
    ).toBe('forbidden');
    expect(
      checkOwnership(U, { table: 'kv', id: 'k', profileId: 'p9' }, owners, GLOBAL_PROFILE_ID),
    ).toMatch(/^forbidden/);
  });
  it('enforces profile envelope invariants', () => {
    expect(
      checkOwnership(
        U,
        { table: 'profiles', id: 'p1', profileId: 'p3' },
        owners,
        GLOBAL_PROFILE_ID,
      ),
    ).toMatch(/^invalid/);
    expect(
      checkOwnership(
        U,
        { table: 'profiles', id: GLOBAL_PROFILE_ID, profileId: GLOBAL_PROFILE_ID },
        owners,
        GLOBAL_PROFILE_ID,
      ),
    ).toMatch(/^invalid/);
  });
});

describe('clockSkewError', () => {
  const now = 1_800_000_000_000;
  it('accepts past and near-future stamps, rejects > 5 min ahead', () => {
    expect(clockSkewError({ updatedAt: now - 1e9, deletedAt: null }, now)).toBeNull();
    expect(clockSkewError({ updatedAt: now + MAX_CLOCK_SKEW_MS, deletedAt: null }, now)).toBeNull();
    expect(clockSkewError({ updatedAt: now + MAX_CLOCK_SKEW_MS + 1, deletedAt: null }, now)).toBe(
      'clock_skew',
    );
    expect(clockSkewError({ updatedAt: now, deletedAt: now + 3_600_000 }, now)).toBe('clock_skew');
  });
});

describe('applyQuota', () => {
  const sized = (c: Candidate, bytes: number): Candidate => ({ ...c, bytes });
  it('rejects new rows beyond the row quota but lets edits and tombstones through', () => {
    const existingRow = { ...stored(entry('e1', 1)), bytes: 100 };
    const res = applyQuota(
      U,
      [sized(entry('new', 5, 'devA', 'dhuhr'), 100), sized(entry('e1', 5), 80)],
      [existingRow],
      { rows: 10, bytes: 1_000 },
      { rows: 10, bytes: 1_000_000 },
    );
    expect(res.rejected).toEqual([{ table: 'salahEntries', id: 'new', reason: 'quota_exceeded' }]);
    expect(res.allowed.map((c) => c.id)).toEqual(['e1']);
  });
  it('rejects growth beyond the byte quota, counting cumulatively within the batch', () => {
    const res = applyQuota(
      U,
      [sized(entry('a', 1, 'devA', 'fajr'), 400), sized(entry('b', 1, 'devA', 'asr'), 400)],
      [],
      { rows: 0, bytes: 300 },
      { rows: 100, bytes: 1_000 },
    );
    expect(res.allowed.map((c) => c.id)).toEqual(['a']);
    expect(res.rejected).toEqual([{ table: 'salahEntries', id: 'b', reason: 'quota_exceeded' }]);
  });
  it("does not credit another user's row as an existing one", () => {
    const foreign = { ...stored(entry('x', 1), 'user-b'), bytes: 100 };
    const res = applyQuota(
      U,
      [sized(entry('x', 5), 100)],
      [foreign],
      { rows: 1, bytes: 0 },
      { rows: 1, bytes: 1e6 },
    );
    expect(res.rejected).toHaveLength(1);
  });
});
