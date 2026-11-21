'use client';

import {
  normalizeStatus,
  PRAYER_NAMES,
  type PrayerName,
  type PrayerSchedule,
  type SalahDayLog,
  type SalahStatus,
} from '@lamim/core';
import Link from 'next/link';
import { memo } from 'react';
import { useApp } from '@/components/app/app-provider';

const DOT: Record<SalahStatus, string> = {
  jamaat: 'bg-cerulean-strong border-cerulean-strong',
  alone: 'bg-iris-strong border-iris-strong',
  qaza: 'bg-violet-strong border-violet-strong',
  missed: 'bg-terracotta-strong border-terracotta-strong',
};

interface Props {
  log: SalahDayLog;
  schedule: PrayerSchedule | null;
  current: PrayerName | null;
  timeFormat: Intl.DateTimeFormat;
}

/** Five tappable dots; each opens the Salah tracker. */
export const PrayerTimeline = memo(function PrayerTimeline({
  log,
  schedule,
  current,
  timeFormat,
}: Props) {
  const { t } = useApp();
  return (
    <section
      aria-labelledby="timeline-heading"
      className="grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <h2 id="timeline-heading" className="text-lead font-semibold text-fg">
        {t('home.timeline.title')}
      </h2>
      <ol className="relative grid grid-cols-5 gap-1">
        <span aria-hidden className="absolute inset-x-[10%] top-5 h-px bg-border" />
        {PRAYER_NAMES.map((p) => {
          const status = normalizeStatus(log[p]);
          const time = schedule ? timeFormat.format(schedule[p]) : '';
          return (
            <li key={p} className="relative">
              <Link
                href="/app/salah"
                aria-label={t('home.timeline.item', {
                  prayer: t(`prayer.${p}`),
                  time,
                  status: status ? t(`status.${status}`) : t('home.timeline.notLogged'),
                })}
                className="grid justify-items-center gap-1 rounded-md py-1 transition-colors hover:bg-surface-subtle active:scale-95"
              >
                <span
                  aria-hidden
                  className={`grid size-10 place-items-center rounded-pill border-2 transition-colors ${
                    status ? DOT[status] : 'border-border bg-surface'
                  } ${current === p ? 'ring-2 ring-cerulean ring-offset-2 ring-offset-surface' : ''}`}
                >
                  {status && status !== 'missed' ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 5 5 9-10" />
                    </svg>
                  ) : null}
                </span>
                <span aria-hidden className="text-caption font-medium text-fg">
                  {t(`prayer.${p}`)}
                </span>
                <span aria-hidden className="text-micro text-fg-muted tabular-nums">
                  {time}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
});
