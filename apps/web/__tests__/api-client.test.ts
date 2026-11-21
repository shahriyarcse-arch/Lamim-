import { LamimDB } from '@lamim/db';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getStoredAuth, httpTransport, login } from '../lib/api-client';

const db = () => new LamimDB('lamim', { indexedDB: new IDBFactory(), IDBKeyRange });

const authBody = (n: number, expiresIn = 900) => ({
  accessToken: `access-${n}`,
  expiresIn,
  refreshToken: `refresh-${n}-${'x'.repeat(40)}`,
  user: { id: 'u1', email: 'a@example.com' },
});
const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
const pullBody = { rows: [], cursor: '0', hasMore: false };

afterEach(() => vi.unstubAllGlobals());

describe('api client', () => {
  it('stores tokens on login', async () => {
    const d = db();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(200, authBody(1))),
    );
    await login(d, 'a@example.com', 'password!!', 'dev');
    expect(await getStoredAuth(d)).toMatchObject({
      accessToken: 'access-1',
      user: { email: 'a@example.com' },
    });
  });

  it('refreshes an expired access token before calling, then uses the new one', async () => {
    const d = db();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(200, authBody(1, 1))),
    ); // expires almost immediately
    await login(d, 'a@example.com', 'password!!', 'dev');
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push(
          `${url.split('4000')[1]} ${(init.headers as Record<string, string>).Authorization ?? ''}`,
        );
        return url.endsWith('/auth/refresh') ? json(200, authBody(2)) : json(200, pullBody);
      }),
    );
    await httpTransport(d).pull('0');
    expect(calls).toEqual(['/auth/refresh ', '/sync/pull?cursor=0 Bearer access-2']);
  });

  it('retries once after a 401 with a refreshed token', async () => {
    const d = db();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(200, authBody(1))),
    );
    await login(d, 'a@example.com', 'password!!', 'dev');
    let pulls = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/auth/refresh')) return json(200, authBody(2));
        pulls += 1;
        return pulls === 1 ? json(401, { message: 'expired' }) : json(200, pullBody);
      }),
    );
    expect(await httpTransport(d).pull('0')).toEqual(pullBody);
    expect(pulls).toBe(2);
  });

  it('concurrent 401s share a single refresh (rotation-safe)', async () => {
    const d = db();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(200, authBody(1))),
    );
    await login(d, 'a@example.com', 'password!!', 'dev');
    let refreshes = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        if (url.endsWith('/auth/refresh')) {
          refreshes += 1;
          await new Promise((r) => setTimeout(r, 20));
          return json(200, authBody(2));
        }
        const token = (init.headers as Record<string, string>).Authorization;
        return token === 'Bearer access-1' ? json(401, {}) : json(200, pullBody);
      }),
    );
    const t = httpTransport(d);
    await Promise.all([t.pull('0'), t.pull('0'), t.pull('0')]);
    expect(refreshes).toBe(1);
  });

  it('skips refreshing when another tab already rotated the tokens', async () => {
    const d = db();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(200, authBody(1))),
    );
    await login(d, 'a@example.com', 'password!!', 'dev');
    let refreshes = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        if (url.endsWith('/auth/refresh')) {
          refreshes += 1;
          return json(401, {}); // spending the old token would be reuse
        }
        const token = (init.headers as Record<string, string>).Authorization;
        if (token === 'Bearer access-1') {
          // Another tab rotates while this request is in flight.
          const b = authBody(2);
          await d.meta.put({
            key: 'auth',
            value: {
              accessToken: b.accessToken,
              accessExpiresAt: Date.now() + 900_000,
              refreshToken: b.refreshToken,
              user: b.user,
            },
          });
          return json(401, {});
        }
        return json(200, pullBody);
      }),
    );
    expect(await httpTransport(d).pull('0')).toEqual(pullBody);
    expect(refreshes).toBe(0);
    expect(await getStoredAuth(d)).toMatchObject({ accessToken: 'access-2' });
  });

  it('a rejected refresh signs the user out locally', async () => {
    const d = db();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(200, authBody(1))),
    );
    await login(d, 'a@example.com', 'password!!', 'dev');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(401, {})),
    );
    await expect(httpTransport(d).pull('0')).rejects.toMatchObject({ code: 'unauthorized' });
    expect(await getStoredAuth(d)).toBeNull();
  });

  it('maps failures to typed errors (network, rate limit with Retry-After, conflict)', async () => {
    const d = db();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))),
    );
    await expect(login(d, 'a@example.com', 'p', 'dev')).rejects.toMatchObject({ code: 'network' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(429, {}, { 'Retry-After': '30' })),
    );
    const err = await login(d, 'a@example.com', 'p', 'dev').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ code: 'rate_limited', retryAfterSeconds: 30 });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(409, {})),
    );
    await expect(login(d, 'a@example.com', 'p', 'dev')).rejects.toMatchObject({ code: 'conflict' });
  });

  it('rejects malformed server responses instead of trusting them', async () => {
    const d = db();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json(200, { accessToken: 1 })),
    );
    await expect(login(d, 'a@example.com', 'p', 'dev')).rejects.toThrow();
    expect(await getStoredAuth(d)).toBeNull();
  });
});
