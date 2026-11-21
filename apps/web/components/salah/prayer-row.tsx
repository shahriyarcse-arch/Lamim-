'use client';

import { SALAH_POINTS, SALAH_STATUSES, type PrayerName, type SalahStatus } from '@lamim/core';
import { memo } from 'react';
import { useApp } from '@/components/app/app-provider';

/** Selected-state fills: brand -strong shades so white label text passes 4.5:1. */
const STATUS_FILL: Record<SalahStatus, string> = {
  jamaat: 'peer-checked:bg-cerulean-strong peer-checked:border-cerulean-strong',
  alone: 'peer-checked:bg-iris-strong peer-checked:border-iris-strong',
  qaza: 'peer-checked:bg-violet-strong peer-checked:border-violet-strong',
  missed: 'peer-checked:bg-terracotta-strong peer-checked:border-terracotta-strong',
};

interface Props {
  prayer: PrayerName;
  status: SalahStatus | undefined;
  time: string | null;
  isCurrent: boolean;
  disabled: boolean;
  onChange: (prayer: PrayerName, status: SalahStatus | null) => void;
}

export const PrayerRow = memo(function PrayerRow({
  prayer,
  status,
  time,
  isCurrent,
  disabled,
  onChange,
}: Props) {
  const { t } = useApp();
  const name = `salah-${prayer}`;

  return (
    <fieldset
      className={`grid gap-2 rounded-lg border bg-surface p-4 shadow-card transition-colors ${
        isCurrent ? 'border-cerulean' : 'border-border'
      }`}
      disabled={disabled}
    >
      <legend className="sr-only">{t(`prayer.${prayer}`)}</legend>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span aria-hidden className="text-lead font-semibold text-fg">
            {t(`prayer.${prayer}`)}
          </span>
          {time ? <span className="text-caption text-fg-muted tabular-nums">{time}</span> : null}
          {isCurrent ? <span aria-hidden className="bg-cerulean size-2 rounded-pill" /> : null}
        </div>
        {status ? (
          <button
            type="button"
            onClick={() => onChange(prayer, null)}
            className="rounded-pill px-2 py-1 text-caption text-fg-muted transition-colors hover:bg-surface-subtle hover:text-fg"
          >
            {t('salah.clear')}
            <span className="sr-only"> {t(`prayer.${prayer}`)}</span>
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SALAH_STATUSES.map((s) => (
          <label key={s} className="relative cursor-pointer has-disabled:cursor-not-allowed">
            <input
              type="radio"
              name={name}
              value={s}
              checked={status === s}
              onChange={() => onChange(prayer, s)}
              className="peer sr-only"
            />
            <span
              className={`flex min-h-11 items-center justify-center gap-1 rounded-md border border-border px-2 py-2 text-caption font-medium text-fg-muted transition-all peer-hover:bg-surface-subtle peer-hover:text-fg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus peer-checked:text-white peer-checked:shadow-card peer-active:scale-[0.97] ${STATUS_FILL[s]}`}
            >
              {t(`status.${s}`)}
              <span className="opacity-80 tabular-nums">+{SALAH_POINTS[s]}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
});
