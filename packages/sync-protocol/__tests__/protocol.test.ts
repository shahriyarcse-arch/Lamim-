import { describe, expect, it } from 'vitest';
import {
  lwwWins,
  PullQuerySchema,
  PushRequestSchema,
  RegisterRequestSchema,
  RowEnvelopeSchema,
} from '../src/index';

const row = {
  table: 'salahEntries',
  id: '0193a8b2-7c1d-7e2f-8a3b-4c5d6e7f8091',
  profileId: 'p1',
  updatedAt: 1000,
  deletedAt: null,
  deviceId: 'dev-a',
  data: { date: '2026-11-21', prayer: 'fajr', status: 'jamaat' },
};

describe('lwwWins', () => {
  it('later updatedAt wins', () => {
    expect(lwwWins({ updatedAt: 2, deviceId: 'a' }, { updatedAt: 1, deviceId: 'z' })).toBe(true);
    expect(lwwWins({ updatedAt: 1, deviceId: 'z' }, { updatedAt: 2, deviceId: 'a' })).toBe(false);
  });

  it('ties break on deviceId deterministically, in either arrival order', () => {
    const a = { updatedAt: 5, deviceId: 'device-a' };
    const b = { updatedAt: 5, deviceId: 'device-b' };
    expect(lwwWins(b, a)).toBe(true);
    expect(lwwWins(a, b)).toBe(false);
  });

  it('identical versions are not re-applied; missing rows always accept', () => {
    expect(lwwWins({ updatedAt: 5, deviceId: 'a' }, { updatedAt: 5, deviceId: 'a' })).toBe(false);
    expect(lwwWins({ updatedAt: 0, deviceId: 'a' }, null)).toBe(true);
  });

  it('converges: applying versions in any order yields the same winner', () => {
    const versions = [
      { updatedAt: 3, deviceId: 'b' },
      { updatedAt: 7, deviceId: 'a' },
      { updatedAt: 7, deviceId: 'c' },
      { updatedAt: 1, deviceId: 'z' },
    ];
    const winnerOf = (order: typeof versions) =>
      order.reduce<(typeof versions)[number] | null>((cur, v) => (lwwWins(v, cur) ? v : cur), null);
    const forward = winnerOf(versions);
    const backward = winnerOf([...versions].reverse());
    expect(forward).toEqual({ updatedAt: 7, deviceId: 'c' });
    expect(backward).toEqual(forward);
  });
});

describe('schemas', () => {
  it('accepts a valid envelope and push request', () => {
    expect(RowEnvelopeSchema.parse(row)).toMatchObject({ table: 'salahEntries' });
    expect(PushRequestSchema.parse({ deviceId: 'dev-a', changes: [row] }).changes).toHaveLength(1);
  });

  it.each([
    [{ table: 'syncQueue' }],
    [{ table: 'legacyArchive' }],
    [{ id: 'has space' }],
    [{ updatedAt: -1 }],
    [{ updatedAt: 1.5 }],
    [{ deviceId: '' }],
  ])('rejects %o', (override) => {
    expect(RowEnvelopeSchema.safeParse({ ...row, ...override }).success).toBe(false);
  });

  it('caps push size', () => {
    const changes = Array.from({ length: 501 }, () => row);
    expect(PushRequestSchema.safeParse({ deviceId: 'd', changes }).success).toBe(false);
  });

  it('pull cursor is a numeric string; limit is clamped', () => {
    expect(PullQuerySchema.parse({})).toEqual({ cursor: '0', limit: 500 });
    expect(PullQuerySchema.safeParse({ cursor: '-1' }).success).toBe(false);
    expect(PullQuerySchema.safeParse({ cursor: '1; drop table' }).success).toBe(false);
    expect(PullQuerySchema.safeParse({ limit: '9999' }).success).toBe(false);
  });

  it('registration normalizes email and enforces password length', () => {
    expect(
      RegisterRequestSchema.parse({
        email: ' A@Example.COM ',
        password: 'x'.repeat(10),
        deviceId: 'd',
      }).email,
    ).toBe('a@example.com');
    expect(
      RegisterRequestSchema.safeParse({ email: 'a@b.co', password: 'short', deviceId: 'd' })
        .success,
    ).toBe(false);
    expect(
      RegisterRequestSchema.safeParse({
        email: 'not-an-email',
        password: 'x'.repeat(10),
        deviceId: 'd',
      }).success,
    ).toBe(false);
  });
});
