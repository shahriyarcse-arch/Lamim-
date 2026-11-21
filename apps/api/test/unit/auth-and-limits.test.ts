import { describe, expect, it } from 'vitest';
import {
  decideRefresh,
  hashPassword,
  newRefreshToken,
  sha256Hex,
  verifyPassword,
} from '../../src/auth/tokens';
import { randomBytes } from 'node:crypto';
import { ipKey, SlidingWindowLimiter } from '../../src/common/rate-limit';
import { SyncGate } from '../../src/sync/sync-gate';
import { ConfigError, loadConfig } from '../../src/config';

describe('refresh token policy', () => {
  const now = new Date('2026-11-21T12:00:00Z');
  const later = new Date('2026-12-01T00:00:00Z');

  const ago = (ms: number) => new Date(now.getTime() - ms);
  const live = { expiresAt: later, revokedAt: null, revokeReason: null };

  it('rotates a live token', () => {
    expect(decideRefresh(live, now)).toBe('rotate');
  });
  it('a parent rotated < 30 s ago is a benign concurrent refresh (grace), later it is reuse', () => {
    expect(decideRefresh({ ...live, revokedAt: ago(5_000), revokeReason: 'rotated' }, now)).toBe(
      'grace',
    );
    expect(decideRefresh({ ...live, revokedAt: ago(30_000), revokeReason: 'rotated' }, now)).toBe(
      'grace',
    );
    expect(decideRefresh({ ...live, revokedAt: ago(31_000), revokeReason: 'rotated' }, now)).toBe(
      'reuse',
    );
  });
  it('a token ended by logout or an earlier reuse revocation is plain revoked, not reuse', () => {
    expect(decideRefresh({ ...live, revokedAt: ago(1_000), revokeReason: 'logout' }, now)).toBe(
      'revoked',
    );
    expect(decideRefresh({ ...live, revokedAt: ago(60_000), revokeReason: 'logout' }, now)).toBe(
      'revoked',
    );
    expect(decideRefresh({ ...live, revokedAt: ago(1_000), revokeReason: 'reuse' }, now)).toBe(
      'revoked',
    );
    expect(decideRefresh({ ...live, revokedAt: ago(1_000), revokeReason: null }, now)).toBe(
      'revoked',
    );
  });
  it('rejects unknown and expired tokens', () => {
    expect(decideRefresh(null, now)).toBe('unknown');
    expect(decideRefresh({ ...live, expiresAt: now }, now)).toBe('expired');
  });
  it('mints unique 256-bit opaque tokens and stores only a sha256 hex digest', () => {
    const a = newRefreshToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(newRefreshToken()).not.toBe(a);
    expect(sha256Hex(a)).toMatch(/^[0-9a-f]{64}$/);
  });
  it('hashes passwords with argon2id', async () => {
    const hash = await hashPassword('correct horse battery');
    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(await verifyPassword(hash, 'correct horse battery')).toBe(true);
    expect(await verifyPassword(hash, 'wrong password!')).toBe(false);
    expect(await verifyPassword('not-a-hash', 'x')).toBe(false);
  });
});

describe('SlidingWindowLimiter', () => {
  it('allows `limit` hits per rolling window, then reports Retry-After', () => {
    let t = 0;
    const limiter = new SlidingWindowLimiter(3, 60_000, () => t);
    expect([1, 2, 3].map(() => limiter.hit('ip').allowed)).toEqual([true, true, true]);
    t = 10_000;
    const blocked = limiter.hit('ip');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(50);
    expect(limiter.hit('other-ip').allowed).toBe(true);
  });

  it('slides: old hits expire individually', () => {
    let t = 0;
    const limiter = new SlidingWindowLimiter(2, 1_000, () => t);
    limiter.hit('k');
    t = 500;
    limiter.hit('k');
    t = 999;
    expect(limiter.hit('k').allowed).toBe(false);
    t = 1_000; // first hit left the window, second has not
    expect(limiter.hit('k').allowed).toBe(true);
    expect(limiter.hit('k').allowed).toBe(false);
  });

  it('sweeps idle keys', () => {
    let t = 0;
    const limiter = new SlidingWindowLimiter(5, 1_000, () => t);
    limiter.hit('a');
    t = 5_000;
    limiter.sweep();
    expect(limiter.size).toBe(0);
  });
});

describe('ipKey', () => {
  it('keys IPv4 and IPv4-mapped IPv6 by address', () => {
    expect(ipKey('203.0.113.7')).toBe('203.0.113.7');
    expect(ipKey('::ffff:203.0.113.7')).toBe('203.0.113.7');
  });
  it('keys native IPv6 by its /64 prefix', () => {
    const a = ipKey('2001:db8:abcd:12:1111:2222:3333:4444');
    expect(a).toBe('2001:db8:abcd:12::/64');
    expect(ipKey('2001:0db8:abcd:0012::1')).toBe(a);
    expect(ipKey('2001:db8:abcd:13::1')).not.toBe(a);
    expect(ipKey('::1')).toBe('0:0:0:0::/64');
    expect(ipKey('fe80::1%eth0')).toBe('fe80:0:0:0::/64');
  });
});

describe('SyncGate', () => {
  const deferred = () => {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
      resolve = r;
    });
    return { promise, resolve };
  };

  it('runs one request per user at a time, FIFO, and 429s beyond the in-flight cap', async () => {
    const gate = new SyncGate({ SYNC_MAX_IN_FLIGHT_PER_USER: 2 });
    const order: string[] = [];
    const first = deferred();
    const a = gate.run('u1', async () => {
      order.push('a:start');
      await first.promise;
      order.push('a:end');
    });
    const b = gate.run('u1', async () => {
      order.push('b');
    });
    await expect(gate.run('u1', async () => 'c')).rejects.toMatchObject({
      status: 429,
      retryAfterSec: 1,
    });
    // Other users are unaffected.
    await expect(gate.run('u2', async () => 'other')).resolves.toBe('other');
    await Promise.resolve();
    expect(order).toEqual(['a:start']);
    first.resolve();
    await Promise.all([a, b]);
    expect(order).toEqual(['a:start', 'a:end', 'b']);
    expect(gate.activeUsers).toBe(0);
  });

  it('a failing request releases the lane', async () => {
    const gate = new SyncGate({ SYNC_MAX_IN_FLIGHT_PER_USER: 1 });
    await expect(gate.run('u', async () => Promise.reject(new Error('boom')))).rejects.toThrow(
      'boom',
    );
    await expect(gate.run('u', async () => 1)).resolves.toBe(1);
  });
});

describe('config', () => {
  const base = { DATABASE_URL: 'postgresql://u:p@h/db' };
  const good = randomBytes(48).toString('base64url');
  const message = (env: Record<string, string>) => {
    try {
      loadConfig(env);
    } catch (err) {
      expect(err).toBeInstanceOf(ConfigError);
      return (err as Error).message;
    }
    return null;
  };

  it('accepts a real 256-bit+ random secret', () => {
    expect(message({ ...base, JWT_SECRET: good })).toBeNull();
  });
  it('fails fast on short, placeholder and low-entropy secrets without echoing them', () => {
    for (const secret of [
      'too-short-secret',
      'x'.repeat(40),
      'replace-with-a-long-random-secret-replace-with-a-long-random',
      'abababababababababababababababababababababababab',
      `${'a1'.repeat(30)}`,
      `${good.slice(0, 30)}`,
    ]) {
      const msg = message({ ...base, JWT_SECRET: secret });
      expect(msg).toContain('JWT_SECRET');
      expect(msg).not.toContain(secret);
    }
    expect(message({ ...base, JWT_SECRET: '' })).toContain('JWT_SECRET');
  });
  it('requires an explicit TRUST_PROXY in production', () => {
    expect(message({ ...base, JWT_SECRET: good, NODE_ENV: 'production' })).toContain('TRUST_PROXY');
    expect(
      message({ ...base, JWT_SECRET: good, NODE_ENV: 'production', TRUST_PROXY: '1' }),
    ).toBeNull();
    expect(message({ ...base, JWT_SECRET: good, NODE_ENV: 'development' })).toBeNull();
  });
  it('parses the CORS allow-list', () => {
    const c = loadConfig({
      ...base,
      JWT_SECRET: good,
      CORS_ORIGINS: 'https://lamim.tech, http://localhost:3000',
    });
    expect(c.CORS_ORIGINS).toEqual(['https://lamim.tech', 'http://localhost:3000']);
  });
});
