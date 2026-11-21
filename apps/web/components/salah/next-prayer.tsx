'use client';

import {
  createCountdownTicker,
  formatCountdown,
  getNextPrayer,
  type Countdown,
  type PrayerTimesInput,
} from '@lamim/core';
import { memo, useEffect, useMemo, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { localizeDigits } from '@/lib/i18n';

interface Props {
  input: PrayerTimesInput;
  timeFormat: Intl.DateTimeFormat;
}

/** Isolated so the per-second countdown only re-renders this card. */
export const NextPrayerCard = memo(function NextPrayerCard({ input, timeFormat }: Props) {
  const { t, lang } = useApp();
  const [generation, setGeneration] = useState(0);
  // Recomputed when the input changes or the previous target is reached.
  const next = useMemo(() => getNextPrayer(input, Date.now()), [input, generation]);
  const [remaining, setRemaining] = useState<Countdown | null>(null);

  useEffect(() => {
    const ticker = createCountdownTicker({
      target: next.at,
      onTick: setRemaining,
      onComplete: () => setGeneration((g) => g + 1),
    });
    return () => ticker.stop();
  }, [next.at]);

  return (
    <section
      aria-labelledby="next-prayer-heading"
      className="bg-dawn relative overflow-hidden rounded-xl p-px shadow-raised"
    >
      <div className="grid gap-2 rounded-xl bg-surface/95 p-6">
        <h2
          id="next-prayer-heading"
          className="text-caption font-semibold tracking-wide text-fg-muted uppercase"
        >
          {t('salah.next')}
        </h2>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-h2 font-bold text-fg">
            {t(`prayer.${next.name}`)}{' '}
            <span className="text-lead font-medium text-fg-muted">
              {timeFormat.format(next.at)}
              {next.isTomorrow ? ` · ${t('salah.tomorrow')}` : ''}
            </span>
          </p>
          <p className="text-h3 font-semibold text-cerulean-text tabular-nums" aria-live="off">
            <span className="sr-only">{t('salah.in')} </span>
            {remaining ? localizeDigits(formatCountdown(remaining), lang) : '--:--:--'}
          </p>
        </div>
      </div>
    </section>
  );
});
