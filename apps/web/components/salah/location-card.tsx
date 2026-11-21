'use client';

import { useState } from 'react';
import { PinIcon } from '@/components/app/icons';
import { useApp } from '@/components/app/app-provider';
import { refreshLocation } from '@/lib/location';

/** Location is requested only on an explicit tap — never on page load. */
export function LocationCard({ approximate }: { approximate: boolean }) {
  const { db, profileId, t } = useApp();
  const [state, setState] = useState<'idle' | 'busy' | 'denied'>('idle');

  const request = () => {
    setState('busy');
    void refreshLocation(db, profileId).then((r) => setState(r === 'ok' ? 'idle' : 'denied'));
  };

  return (
    <section className="grid gap-2 rounded-lg border border-border bg-surface-subtle p-4">
      <h2 className="flex items-center gap-2 text-body font-semibold text-fg">
        <PinIcon /> {t('salah.location.title')}
      </h2>
      <p className="text-caption text-fg-muted">
        {approximate ? t('salah.location.approx') : t('salah.location.body')}
      </p>
      {state === 'denied' ? (
        <p role="status" className="text-caption text-terracotta-text">
          {t('salah.location.denied')}
        </p>
      ) : null}
      <button
        type="button"
        onClick={request}
        disabled={state === 'busy'}
        className="justify-self-start rounded-pill bg-cerulean-strong px-4 py-2 text-caption font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95 disabled:opacity-60"
      >
        {t('salah.location.cta')}
      </button>
    </section>
  );
}
