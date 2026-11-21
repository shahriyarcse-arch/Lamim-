'use client';

import {
  adoptRemoteProfile,
  enqueueAll,
  getDeviceId,
  pendingCount,
  pullBatch,
  resetSyncState,
  syncNow,
} from '@lamim/db';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useApp } from '@/components/app/app-provider';
import {
  ApiError,
  getStoredAuth,
  httpTransport,
  login,
  logout,
  register,
  type StoredAuth,
} from '@/lib/api-client';

export type SyncStatus = 'signed-out' | 'offline' | 'syncing' | 'synced' | 'error';

interface SyncContextValue {
  status: SyncStatus;
  email: string | null;
  pending: number;
  lastSyncedAt: number | null;
  error: string | null;
  signIn: (mode: 'login' | 'register', email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncNowManual: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function useSync(): SyncContextValue {
  const ctx = use(SyncContext);
  if (!ctx) throw new Error('useSync must be used inside <SyncProvider>');
  return ctx;
}

const AUTO_DELAY_MS = 3_000;
const PERIODIC_PULL_MS = 60_000;
const MAX_BACKOFF_MS = 5 * 60_000;

function log(event: string, extra: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ event, ...extra }));
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { db, profileId } = useApp();
  const auth = useLiveQuery(() => getStoredAuth(db), [db]) as StoredAuth | null | undefined;
  const pending = useLiveQuery(() => pendingCount(db), [db]) ?? 0;
  const lastSyncedAt =
    (useLiveQuery(() => db.meta.get('sync.lastSyncedAt'), [db])?.value as number | undefined) ??
    null;

  const [online, setOnline] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const failures = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const run = useCallback(async () => {
    if (inFlight.current || !navigator.onLine || !(await getStoredAuth(db))) return;
    inFlight.current = true;
    setRunning(true);
    clearTimeout(retryTimer.current);
    try {
      const summary = await syncNow(db, httpTransport(db));
      failures.current = 0;
      setError(null);
      log('sync.ok', {
        pushed: summary.pushed,
        pulled: summary.pulled,
        rejected: summary.rejected.length,
      });
    } catch (e) {
      failures.current += 1;
      const code = e instanceof ApiError ? e.code : 'unknown';
      setError(code);
      log('sync.failed', { code, attempt: failures.current });
      if (code !== 'unauthorized') {
        // Exponential backoff with a cap; a reconnect or a new local write also retries.
        const retryAfter =
          e instanceof ApiError && e.retryAfterSeconds ? e.retryAfterSeconds * 1000 : 0;
        const delay = Math.max(
          retryAfter,
          Math.min(MAX_BACKOFF_MS, 5_000 * 2 ** (failures.current - 1)),
        );
        retryTimer.current = setTimeout(() => void run(), delay);
      }
    } finally {
      inFlight.current = false;
      setRunning(false);
    }
  }, [db]);

  // Auto-sync shortly after local writes, on reconnect, and periodically to pull other devices' changes.
  useEffect(() => {
    if (!auth || !online || pending === 0) return;
    const t = setTimeout(() => void run(), AUTO_DELAY_MS);
    return () => clearTimeout(t);
  }, [auth, online, pending, run]);

  useEffect(() => {
    if (!auth || !online) return;
    void run();
    const t = setInterval(() => void run(), PERIODIC_PULL_MS);
    return () => clearInterval(t);
  }, [auth, online, run]);

  useEffect(() => () => clearTimeout(retryTimer.current), []);

  const signIn = useCallback(
    async (mode: 'login' | 'register', email: string, password: string) => {
      const deviceId = await getDeviceId(db);
      await (mode === 'register'
        ? register(db, email, password, deviceId)
        : login(db, email, password, deviceId));
      log('auth.signed_in', { mode });
      if (mode === 'login') {
        // Pull first: on a fresh/wiped browser this restores everything, then we adopt the real profile.
        const transport = httpTransport(db);
        for (let i = 0; i < 1000; i++) if (!(await pullBatch(db, transport)).hasMore) break;
        const adopted = await adoptRemoteProfile(db, profileId);
        if (adopted) {
          log('sync.profile_restored');
          window.location.reload();
          return;
        }
      }
      // Link everything on this device (including legacy-imported and guest data) to the account.
      await enqueueAll(db);
      await run();
    },
    [db, profileId, run],
  );

  const signOut = useCallback(async () => {
    await logout(db);
    await resetSyncState(db);
    setError(null);
    log('auth.signed_out');
  }, [db]);

  const status: SyncStatus = !auth
    ? 'signed-out'
    : !online
      ? 'offline'
      : running
        ? 'syncing'
        : error
          ? 'error'
          : 'synced';

  const value = useMemo<SyncContextValue>(
    () => ({
      status,
      email: auth?.user.email ?? null,
      pending,
      lastSyncedAt,
      error,
      signIn,
      signOut,
      syncNowManual: () => void run(),
    }),
    [status, auth, pending, lastSyncedAt, error, signIn, signOut, run],
  );

  return <SyncContext value={value}>{children}</SyncContext>;
}
