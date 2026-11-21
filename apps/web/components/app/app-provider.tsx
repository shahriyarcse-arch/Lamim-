'use client';

import { bootstrap, getSettings, type LamimDB, type Settings } from '@lamim/db';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getDb } from '@/lib/db';
import { createT, locale, type Lang, type Translate } from '@/lib/i18n';

interface AppContextValue {
  db: LamimDB;
  profileId: string;
  settings: Settings;
  lang: Lang;
  locale: string;
  t: Translate;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = use(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

type BootState =
  | { status: 'loading' }
  | { status: 'ready'; profileId: string }
  | { status: 'error'; error: Error };

/** Boot screens render before settings exist: English first (matches SSR), then the browser language. */
function useBootT(): Translate {
  const [t, setT] = useState<Translate>(() => createT('en'));
  useEffect(() => {
    if (navigator.language.toLowerCase().startsWith('bn')) setT(() => createT('bn'));
  }, []);
  return t;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [boot, setBoot] = useState<BootState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const bootT = useBootT();

  useEffect(() => {
    let cancelled = false;
    setBoot({ status: 'loading' });
    bootstrap(getDb(), { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
      .then((res) => {
        if (!cancelled) setBoot({ status: 'ready', profileId: res.profileId });
      })
      .catch((error: unknown) => {
        console.error(JSON.stringify({ event: 'app.bootstrap.failed', message: String(error) }));
        if (!cancelled)
          setBoot({
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (boot.status === 'error') {
    return <BootError t={bootT} message={bootT('app.import.failed')} onRetry={retry} />;
  }
  if (boot.status === 'loading') return <BootSplash label={bootT('app.loading')} />;
  return (
    <ReadyProvider profileId={boot.profileId} bootT={bootT}>
      {children}
    </ReadyProvider>
  );
}

function ReadyProvider({
  profileId,
  bootT,
  children,
}: {
  profileId: string;
  bootT: Translate;
  children: ReactNode;
}) {
  const db = getDb();
  const settings = useLiveQuery(() => getSettings(db, profileId), [db, profileId]);
  const lang: Lang = settings?.lang ?? 'en';
  const value = useMemo<AppContextValue | null>(
    () =>
      settings ? { db, profileId, settings, lang, locale: locale(lang), t: createT(lang) } : null,
    [db, profileId, settings, lang],
  );

  useEffect(() => {
    if (value) document.documentElement.lang = value.lang;
  }, [value]);

  if (!value) return <BootSplash label={bootT('app.loading')} />;
  return <AppContext value={value}>{children}</AppContext>;
}

function BootSplash({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="grid min-h-dvh place-items-center bg-app">
      <div className="grid justify-items-center gap-4">
        <span aria-hidden className="bg-celestial size-12 animate-pulse rounded-full" />
        <p className="text-body text-fg-muted">{label}</p>
      </div>
    </div>
  );
}

export function BootError({
  t,
  message,
  onRetry,
}: {
  t: Translate;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="grid min-h-dvh place-items-center bg-app px-4">
      <div className="grid max-w-sm gap-4 rounded-lg border border-border bg-surface p-6 text-center shadow-card">
        <h1 className="text-h3 font-semibold text-fg">{t('app.error.title')}</h1>
        <p className="text-body text-fg-muted">{message}</p>
        <p className="text-body text-fg-muted">{t('app.error.body')}</p>
        <button
          type="button"
          onClick={onRetry}
          className="justify-self-center rounded-pill bg-cerulean-strong px-6 py-2 font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95"
        >
          {t('app.error.retry')}
        </button>
      </div>
    </div>
  );
}
