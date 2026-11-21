'use client';

import { julianDayNumber, type DateStr } from '@lamim/core';
import { memo } from 'react';
import { useApp } from '@/components/app/app-provider';
import { DAILY_AYAT } from '@/lib/daily-ayah';

/** Same ayah all day (by waking date), rotating through the curated set. */
export const AyahCard = memo(function AyahCard({ date }: { date: DateStr }) {
  const { t, lang, locale } = useApp();
  const ayah = DAILY_AYAT[julianDayNumber(date) % DAILY_AYAT.length]!;
  const ref = ayah.ref.replace(/\d+/g, (n) => new Intl.NumberFormat(locale).format(Number(n)));

  return (
    <section aria-labelledby="ayah-heading" className="bg-dusk rounded-xl p-px shadow-card">
      <figure className="grid gap-4 rounded-xl bg-surface p-6">
        <h2
          id="ayah-heading"
          className="text-caption font-semibold tracking-wide text-fg-muted uppercase"
        >
          {t('home.ayah.title')}
        </h2>
        <blockquote className="grid gap-4">
          <p lang="ar" dir="rtl" className="font-quran text-quran text-fg">
            {ayah.arabic}
          </p>
          <p lang={lang} className="text-body text-fg-muted">
            {lang === 'bn' ? ayah.bn : ayah.en}
          </p>
        </blockquote>
        <figcaption className="text-caption font-semibold text-violet-text">
          {t('home.ayah.source', { ref })}
        </figcaption>
      </figure>
    </section>
  );
});
