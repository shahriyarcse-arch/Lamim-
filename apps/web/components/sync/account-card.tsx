'use client';

import { useId, useMemo, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { Segmented } from '@/components/settings/segmented';
import { ApiError } from '@/lib/api-client';
import type { MessageKey } from '@/lib/i18n';
import { useSync } from './sync-provider';

const input =
  'w-full rounded-md border border-border bg-surface px-4 py-2 text-body text-fg focus:outline-2 focus:outline-focus';

export function AccountCard() {
  const { t, locale } = useApp();
  const sync = useSync();
  const ids = { email: useId(), password: useId(), hint: useId() };
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }),
    [locale],
  );

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await sync.signIn(mode, email, password);
      setPassword('');
    } catch (e) {
      const code = e instanceof ApiError ? e.code : 'invalid';
      setError(t(`account.err.${code}` as MessageKey));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby="account-heading"
      className="grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="account-heading" className="text-lead font-semibold text-fg">
          {t('account.title')}
        </h2>
        <SyncChip />
      </div>

      {sync.email ? (
        <div className="grid gap-4">
          <p className="text-body text-fg">{t('account.signedInAs', { email: sync.email })}</p>
          <p className="text-caption text-fg-muted" data-testid="sync-detail">
            {sync.lastSyncedAt
              ? t('account.lastSynced', { time: timeFmt.format(sync.lastSyncedAt) })
              : t('account.never')}
            {sync.pending > 0 ? ` · ${t('account.pending', { count: sync.pending })}` : ''}
          </p>
          {sync.error && sync.error !== 'network' ? (
            <p role="alert" className="text-caption text-terracotta-text">
              {t(`account.err.${sync.error}` as MessageKey)}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={sync.syncNowManual}
              disabled={sync.status === 'syncing' || sync.status === 'offline'}
              className="rounded-pill bg-cerulean-strong px-6 py-2 text-caption font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
            >
              {t('account.syncNow')}
            </button>
            <button
              type="button"
              onClick={() => void sync.signOut()}
              className="rounded-pill border border-border px-4 py-2 text-caption font-semibold text-fg transition-colors hover:bg-surface-subtle"
            >
              {t('account.signOut')}
            </button>
          </div>
          <p className="text-caption text-fg-muted">{t('account.signOutNote')}</p>
        </div>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <p className="text-caption text-fg-muted">{t('account.intro')}</p>
          <Segmented<'login' | 'register'>
            legend={t('account.mode')}
            value={mode}
            onChange={setMode}
            options={[
              { value: 'login', label: t('account.signIn') },
              { value: 'register', label: t('account.register') },
            ]}
          />
          <div className="grid gap-1">
            <label htmlFor={ids.email} className="text-caption font-semibold text-fg">
              {t('account.email')}
            </label>
            <input
              id={ids.email}
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor={ids.password} className="text-caption font-semibold text-fg">
              {t('account.password')}
            </label>
            <input
              id={ids.password}
              type="password"
              required
              minLength={mode === 'register' ? 10 : 1}
              maxLength={128}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              aria-describedby={mode === 'register' ? ids.hint : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
            {mode === 'register' ? (
              <p id={ids.hint} className="text-caption text-fg-muted">
                {t('account.passwordHint')}
              </p>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="text-caption text-terracotta-text">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="justify-self-start rounded-pill bg-cerulean-strong px-6 py-2 text-caption font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            {mode === 'register' ? t('account.submitRegister') : t('account.submitSignIn')}
          </button>
        </form>
      )}
    </section>
  );
}

/** Explicit sync state (offline / syncing / synced / error), also shown in the app header. */
export function SyncChip() {
  const { t } = useApp();
  const { status } = useSync();
  const dot =
    status === 'synced'
      ? 'bg-cerulean-strong'
      : status === 'syncing'
        ? 'bg-iris animate-pulse'
        : status === 'error'
          ? 'bg-terracotta-strong'
          : 'bg-fg-subtle';
  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 rounded-pill border border-border px-2 py-1 text-micro font-medium text-fg-muted"
      data-testid="sync-status"
    >
      <span aria-hidden className={`size-2 rounded-pill ${dot}`} />
      {t(`sync.status.${status}` as MessageKey)}
    </span>
  );
}
