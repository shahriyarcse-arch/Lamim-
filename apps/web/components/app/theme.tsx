'use client';

import { updateSettings } from '@lamim/db';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useApp } from './app-provider';
import { THEME_STORAGE_KEY } from '@/lib/theme-script';
import { MoonIcon, SunIcon } from './icons';

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

function useSystemDark(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = darkQuery();
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => darkQuery().matches,
    () => false,
  );
}

export function useResolvedTheme(): 'light' | 'dark' {
  const { settings } = useApp();
  const systemDark = useSystemDark();
  return settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : settings.theme;
}

/** Applies the profile's theme to <html> and mirrors it for the pre-paint script. */
export function ThemeController() {
  const { settings } = useApp();
  const resolved = useResolvedTheme();
  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, settings.theme);
    } catch {
      /* storage may be unavailable; theme still applies for this session */
    }
  }, [resolved, settings.theme]);
  return null;
}

export function ThemeToggle() {
  const { db, profileId, t } = useApp();
  const resolved = useResolvedTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';
  const toggle = useCallback(() => {
    updateSettings(db, profileId, { theme: next }).catch((error: unknown) =>
      console.error(JSON.stringify({ event: 'settings.theme.failed', message: String(error) })),
    );
  }, [db, profileId, next]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t(next === 'dark' ? 'theme.toDark' : 'theme.toLight')}
      className="bg-celestial group grid size-10 place-items-center rounded-pill p-px transition-transform hover:scale-105 active:scale-95"
    >
      <span className="grid size-full place-items-center rounded-pill bg-surface text-fg transition-colors group-hover:bg-surface-subtle">
        {resolved === 'dark' ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
