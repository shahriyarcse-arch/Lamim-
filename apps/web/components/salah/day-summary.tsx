'use client';

import { MAX_DAILY_SALAH_POINTS, type SalahDayScore, type SalahStreaks } from '@lamim/core';
import { CelestialStar } from '@/components/app/icons';
import { useApp } from '@/components/app/app-provider';

export function DaySummary({ score, streaks }: { score: SalahDayScore; streaks: SalahStreaks }) {
  const { t, locale } = useApp();
  const nf = new Intl.NumberFormat(locale);
  const pct = Math.round((score.points / MAX_DAILY_SALAH_POINTS) * 100);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="grid gap-2 rounded-lg border border-border bg-surface p-4 shadow-card">
        <p className="text-caption text-fg-muted">{t('salah.points')}</p>
        <p className="text-h2 font-bold text-fg tabular-nums">
          {nf.format(score.points)}
          <span className="text-body font-medium text-fg-muted">
            {' '}
            / {nf.format(MAX_DAILY_SALAH_POINTS)}
          </span>
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={MAX_DAILY_SALAH_POINTS}
          aria-valuenow={score.points}
          aria-label={t('salah.points')}
          className="h-2 overflow-hidden rounded-pill bg-surface-subtle"
        >
          <div
            className="bg-celestial h-full rounded-pill transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="flex flex-wrap items-center gap-2 text-caption text-fg-muted">
          {nf.format(score.prayed)} / {nf.format(5)} {t('salah.prayed')}
          {score.isPerfectOnTime ? (
            <span className="inline-flex items-center gap-1 font-semibold text-fg">
              <CelestialStar /> {t('salah.perfectOnTime')}
            </span>
          ) : score.isPerfect ? (
            <span className="font-semibold text-fg">· {t('salah.perfect')}</span>
          ) : null}
        </p>
      </div>
      <Streak
        label={t('salah.streak.perfect')}
        value={streaks.perfect}
        unit={t('salah.days')}
        nf={nf}
      />
      <Streak
        label={t('salah.streak.consistency')}
        value={streaks.consistency}
        unit={t('salah.days')}
        nf={nf}
      />
    </section>
  );
}

function Streak({
  label,
  value,
  unit,
  nf,
}: {
  label: string;
  value: number;
  unit: string;
  nf: Intl.NumberFormat;
}) {
  return (
    <div className="grid content-start gap-2 rounded-lg border border-border bg-surface p-4 shadow-card">
      <p className="text-caption text-fg-muted">{label}</p>
      <p className="text-h2 font-bold text-fg tabular-nums">
        {nf.format(value)} <span className="text-body font-medium text-fg-muted">{unit}</span>
      </p>
    </div>
  );
}
