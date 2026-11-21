'use client';

import Link from 'next/link';
import { useApp } from '@/components/app/app-provider';

/** Hub for modules that do not fit in the five-slot dock. */
export default function MorePage() {
  const { t } = useApp();
  return (
    <div className="grid gap-6">
      <h1 className="text-h1 font-bold text-fg">{t('more.title')}</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            href="/app/habits"
            className="grid gap-1 rounded-xl border border-border bg-surface p-6 shadow-card transition-colors hover:bg-surface-subtle active:scale-[0.99]"
          >
            <span className="text-lead font-semibold text-fg">{t('more.habits')}</span>
            <span className="text-caption text-fg-muted">{t('more.habitsBody')}</span>
          </Link>
        </li>
      </ul>
      <p className="text-caption text-fg-muted">{t('more.soon')}</p>
    </div>
  );
}
