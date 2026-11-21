'use client';

import type { DateStr } from '@lamim/core';
import { setFasting } from '@lamim/db';
import { useState } from 'react';
import { useApp } from '@/components/app/app-provider';

export function FastingToggle({ date, fasting }: { date: DateStr; fasting: boolean }) {
  const { db, profileId, t } = useApp();
  const [failed, setFailed] = useState(false);

  const toggle = () => {
    setFailed(false);
    setFasting(db, { profileId, date, fasting: !fasting }).catch((error: unknown) => {
      console.error(JSON.stringify({ event: 'fasting.save.failed', message: String(error) }));
      setFailed(true);
    });
  };

  return (
    <section className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6">
      <div className="grid gap-1">
        <h2 id="fasting-label" className="text-lead font-semibold text-fg">
          {t('home.fasting.title')}
        </h2>
        <p
          className={`text-caption ${failed ? 'text-terracotta-text' : 'text-fg-muted'}`}
          role={failed ? 'alert' : undefined}
        >
          {failed ? t('salah.saveFailed') : t(fasting ? 'home.fasting.on' : 'home.fasting.off')}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={fasting}
        aria-labelledby="fasting-label"
        onClick={toggle}
        className={`relative h-8 w-14 shrink-0 rounded-pill border transition-colors ${
          fasting ? 'border-transparent bg-raspberry-strong' : 'border-border bg-surface-subtle'
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-1/2 left-1 size-6 -translate-y-1/2 rounded-pill bg-white shadow-card transition-transform ${
            fasting ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </section>
  );
}
