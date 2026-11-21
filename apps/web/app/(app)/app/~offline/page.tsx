'use client';

import Link from 'next/link';
import { useApp } from '@/components/app/app-provider';

/** Served by the service worker for /app pages that were never cached. Data still works offline. */
export default function OfflinePage() {
  const { t } = useApp();
  return (
    <section className="grid gap-4 rounded-xl border border-border bg-surface p-6 shadow-card">
      <h1 className="text-h2 font-semibold text-fg">{t('offline.title')}</h1>
      <p className="text-body text-fg-muted">{t('offline.body')}</p>
      <Link
        href="/app/salah"
        className="justify-self-start rounded-pill bg-cerulean-strong px-6 py-2 font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95"
      >
        {t('home.cta')}
      </Link>
    </section>
  );
}
