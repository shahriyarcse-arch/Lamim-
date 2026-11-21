'use client';

import { addDays, scoreSalahDay, type DateStr, type SalahDayLog } from '@lamim/core';
import { memo, useMemo } from 'react';
import { CelestialStar } from '@/components/app/icons';
import { useApp } from '@/components/app/app-provider';

const DAYS = 21;

/** Intensity by daily points (0–50). Text colors verified ≥4.5:1 on each fill in both themes. */
function cellClass(points: number, logged: number): string {
  if (logged === 0) return 'bg-surface-subtle text-fg-muted';
  if (points === 0) return 'bg-terracotta/20 text-fg';
  if (points < 20) return 'bg-cerulean/25 text-fg';
  if (points < 40) return 'bg-cerulean/55 text-fg';
  return 'bg-cerulean-strong text-white';
}

interface Props {
  today: DateStr;
  selected: DateStr;
  days: ReadonlyMap<DateStr, SalahDayLog> | undefined;
  onSelect: (date: DateStr) => void;
}

const utcNoon = (d: DateStr) => Date.parse(`${d}T12:00:00Z`);

export const SalahHeatmap = memo(function SalahHeatmap({ today, selected, days, onSelect }: Props) {
  const { t, locale } = useApp();
  const fmt = useMemo(
    () => ({
      day: new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' }),
      long: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    }),
    [locale],
  );

  const cells = useMemo(
    () =>
      Array.from({ length: DAYS }, (_, i) => {
        const date = addDays(today, i - (DAYS - 1));
        const score = scoreSalahDay(days?.get(date));
        return { date, score };
      }),
    [today, days],
  );

  return (
    <section
      aria-labelledby="heatmap-heading"
      className="grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <h2 id="heatmap-heading" className="text-lead font-semibold text-fg">
        {t('salah.heatmap.title')}
      </h2>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.slice(0, 7).map(({ date }) => (
          <span key={`wd-${date}`} aria-hidden className="text-center text-micro text-fg-muted">
            {fmt.weekday.format(utcNoon(date))}
          </span>
        ))}
        {cells.map(({ date, score }) => {
          const label =
            score.logged === 0
              ? t('salah.heatmap.empty', { date: fmt.long.format(utcNoon(date)) })
              : t('salah.heatmap.cell', {
                  date: fmt.long.format(utcNoon(date)),
                  points: score.points,
                  prayed: score.prayed,
                });
          const isSelected = date === selected;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              aria-label={label}
              aria-pressed={isSelected}
              className={`relative grid aspect-square place-items-center rounded-md text-caption font-semibold tabular-nums transition-transform hover:scale-105 active:scale-95 ${cellClass(
                score.points,
                score.logged,
              )} ${isSelected ? 'outline-2 outline-offset-2 outline-focus' : ''} ${date === today ? 'ring-1 ring-fg-subtle ring-inset' : ''}`}
            >
              {fmt.day.format(utcNoon(date))}
              {score.isPerfectOnTime ? (
                <span className="absolute -top-1 -right-1">
                  <CelestialStar size={14} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div aria-hidden className="flex items-center justify-end gap-1 text-micro text-fg-muted">
        <span>{t('salah.heatmap.less')}</span>
        <span className="size-3 rounded-sm bg-surface-subtle" />
        <span className="size-3 rounded-sm bg-cerulean/25" />
        <span className="size-3 rounded-sm bg-cerulean/55" />
        <span className="size-3 rounded-sm bg-cerulean-strong" />
        <span>{t('salah.heatmap.more')}</span>
      </div>
    </section>
  );
});
