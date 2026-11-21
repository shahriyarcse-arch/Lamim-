/**
 * Cloud API client (auth + sync transport). Every request has a timeout; network
 * failures surface as `ApiError('network')` so the sync layer can back off and the
 * app keeps working offline. Tokens live in the local DB's meta store.
 *
 * Note: tokens in IndexedDB are readable by scripts on this origin. The app ships no
 * third-party scripts; moving the refresh token to an httpOnly cookie is a Phase 4 item.
 */
import type { LamimDB } from '@lamim/db';
import type { SyncTransport } from '@lamim/db';
import {
  AuthResponseSchema,
  PullResponseSchema,
  PushResponseSchema,
  type AuthResponse,
  type PullResponse,
  type PushRequest,
  type PushResponse,
} from '@lamim/sync-protocol';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(
  /\/$/,
  '',
);
const TIMEOUT_MS = 10_000;

export type ApiErrorCode =
  'network' | 'unauthorized' | 'conflict' | 'rate_limited' | 'invalid' | 'server';

export class ApiError extends Error {
  override name = 'ApiError';
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
  }
}

export interface StoredAuth {
  accessToken: string;
  accessExpiresAt: number;
  refreshToken: string;
  user: { id: string; email: string };
}

const AUTH_KEY = 'auth';

export async function getStoredAuth(db: LamimDB): Promise<StoredAuth | null> {
  const v = (await db.meta.get(AUTH_KEY))?.value as StoredAuth | undefined;
  return v && typeof v.refreshToken === 'string' ? v : null;
}

async function storeAuth(db: LamimDB, res: AuthResponse): Promise<StoredAuth> {
  const auth: StoredAuth = {
    accessToken: res.accessToken,
    accessExpiresAt: Date.now() + res.expiresIn * 1000,
    refreshToken: res.refreshToken,
    user: res.user,
  };
  await db.meta.put({ key: AUTH_KEY, value: auth });
  return auth;
}

export async function clearStoredAuth(db: LamimDB): Promise<void> {
  await db.meta.delete(AUTH_KEY);
}

async function request(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError('network', 'Could not reach the server');
  } finally {
    clearTimeout(timer);
  }
  if (res.ok) return res.status === 204 ? null : res.json();
  const retry = Number(res.headers.get('Retry-After'));
  const code: ApiErrorCode =
    res.status === 401
      ? 'unauthorized'
      : res.status === 409
        ? 'conflict'
        : res.status === 429
          ? 'rate_limited'
          : res.status >= 400 && res.status < 500
            ? 'invalid'
            : 'server';
  throw new ApiError(code, `HTTP ${res.status}`, Number.isFinite(retry) ? retry : undefined);
}

export async function register(db: LamimDB, email: string, password: string, deviceId: string) {
  const body = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, deviceId }),
  });
  return storeAuth(db, AuthResponseSchema.parse(body));
}

export async function login(db: LamimDB, email: string, password: string, deviceId: string) {
  const body = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, deviceId }),
  });
  return storeAuth(db, AuthResponseSchema.parse(body));
}

export async function logout(db: LamimDB): Promise<void> {
  const auth = await getStoredAuth(db);
  if (auth) {
    // Best effort: revoke server-side, but always sign out locally.
    await request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    }).catch(() => undefined);
  }
  await clearStoredAuth(db);
}

let refreshing: Promise<StoredAuth> | null = null;

/** Run `fn` under a cross-tab Web Lock when available (all tabs share one Dexie store). */
function withAuthLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  return locks ? (locks.request('lamim-auth-refresh', fn) as Promise<T>) : fn();
}

/**
 * Rotate tokens once even if several requests (or several tabs) hit 401 at the same
 * time. Inside the lock the stored tokens are re-read: if another tab already rotated
 * them, use its result instead of spending the old token (which the server would treat
 * as reuse and revoke the whole family).
 */
async function refresh(db: LamimDB, auth: StoredAuth): Promise<StoredAuth> {
  refreshing ??= (async () => {
    try {
      return await withAuthLock(async () => {
        const current = await getStoredAuth(db);
        if (!current) throw new ApiError('unauthorized', 'Signed out');
        if (current.refreshToken !== auth.refreshToken) return current;
        const body = await request('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: current.refreshToken }),
        });
        return await storeAuth(db, AuthResponseSchema.parse(body));
      });
    } catch (e) {
      if (e instanceof ApiError && (e.code === 'unauthorized' || e.code === 'invalid'))
        await clearStoredAuth(db);
      throw e;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function authed(db: LamimDB, path: string, init: RequestInit = {}): Promise<unknown> {
  let auth = await getStoredAuth(db);
  if (!auth) throw new ApiError('unauthorized', 'Not signed in');
  if (Date.now() > auth.accessExpiresAt - 30_000) auth = await refresh(db, auth);
  try {
    return await request(path, { ...init, token: auth.accessToken });
  } catch (e) {
    if (!(e instanceof ApiError) || e.code !== 'unauthorized') throw e;
    auth = await refresh(db, auth);
    return request(path, { ...init, token: auth.accessToken });
  }
}

export function httpTransport(db: LamimDB): SyncTransport {
  return {
    push: async (req: PushRequest): Promise<PushResponse> =>
      PushResponseSchema.parse(
        await authed(db, '/sync/push', { method: 'POST', body: JSON.stringify(req) }),
      ),
    pull: async (cursor: string): Promise<PullResponse> =>
      PullResponseSchema.parse(await authed(db, `/sync/pull?cursor=${encodeURIComponent(cursor)}`)),
  };
}
