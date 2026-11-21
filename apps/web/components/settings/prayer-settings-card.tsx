'use client';

import {
  CALCULATION_METHODS,
  PRAYER_NAMES,
  type AsrSchool,
  type CalculationMethod,
} from '@lamim/core';
import { updateSettings } from '@lamim/db';
import { useMemo, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { usePrayerSchedule } from '@/components/salah/use-prayer-schedule';
import type { MessageKey } from '@/lib/i18n';
import { refreshLocation } from '@/lib/location';
import { Segmented } from './segmented';

/** Karachi and MWL first (the Bangladesh and international defaults). */
const METHOD_ORDER: readonly CalculationMethod[] = ['Karachi', 'MWL', 'ISNA', 'Egypt'];

export function PrayerSettingsCard() {
  const { db, profileId, settings, t, locale } = useApp();
  const schedule = usePrayerSchedule();
  const [locState, setLocState] = useState<'idle' | 'busy' | 'ok' | 'failed'>('idle');
  const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }), [locale]);
  const timeFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
    [locale],
  );
  const inBangladeshZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Dhaka',
    [],
  );

  const save = (patch: { method?: CalculationMethod; asr?: AsrSchool }) =>
    updateSettings(db, profileId, patch).catch((e: unknown) =>
      console.error(JSON.stringify({ event: 'settings.prayer.failed', message: String(e) })),
    );

  const locate = () => {
    setLocState('busy');
    void refreshLocation(db, profileId).then((r) => setLocState(r === 'ok' ? 'ok' : 'failed'));
  };

  return (
    <section
      aria-labelledby="prayer-settings-heading"
      className="grid gap-6 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <h2 id="prayer-settings-heading" className="text-lead font-semibold text-fg">
        {t('prayerSettings.title')}
      </h2>

      <Segmented<CalculationMethod>
        legend={t('prayerSettings.method')}
        value={settings.method}
        onChange={(method) => void save({ method })}
        vertical
        options={METHOD_ORDER.map((m) => ({
          value: m,
          label: `${t(`prayerSettings.method.${m}` as MessageKey)} · ${t('prayerSettings.angles', {
            fajr: CALCULATION_METHODS[m].fajrAngle,
            isha: CALCULATION_METHODS[m].ishaAngle,
          })}`,
        }))}
      />

      <Segmented<AsrSchool>
        legend={t('prayerSettings.asr')}
        value={settings.asr}
        onChange={(asr) => void save({ asr })}
        vertical
        options={[
          { value: 'hanafi', label: t('prayerSettings.asr.hanafi') },
          { value: 'standard', label: t('prayerSettings.asr.standard') },
        ]}
      />

      <div className="grid gap-2">
        <h3 className="text-caption font-semibold text-fg">{t('prayerSettings.location')}</h3>
        <p className="text-caption text-fg-muted" data-testid="location-value">
          {settings.lat !== null && settings.lng !== null
            ? t('prayerSettings.location.coords', {
                lat: nf.format(settings.lat),
                lng: nf.format(settings.lng),
              })
            : inBangladeshZone
              ? t('prayerSettings.location.none')
              : t('prayerSettings.location.noneElsewhere')}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={locate}
            disabled={locState === 'busy'}
            className="rounded-pill border border-border px-4 py-2 text-caption font-semibold text-fg transition-colors hover:bg-surface-subtle disabled:opacity-60"
          >
            {locState === 'busy'
              ? t('prayerSettings.location.updating')
              : t('prayerSettings.location.update')}
          </button>
          {locState === 'ok' || locState === 'failed' ? (
            <p
              role={locState === 'ok' ? 'status' : 'alert'}
              className={`text-caption ${locState === 'ok' ? 'text-fg-muted' : 'text-terracotta-text'}`}
            >
              {t(
                locState === 'ok'
                  ? 'prayerSettings.location.updated'
                  : 'prayerSettings.location.failed',
              )}
            </p>
          ) : null}
        </div>
      </div>

      {schedule.today ? (
        <div className="grid gap-2 rounded-lg bg-surface-subtle p-4">
          <h3 className="text-caption font-semibold text-fg">{t('prayerSettings.preview')}</h3>
          <dl className="grid grid-cols-5 gap-1 text-center" data-testid="prayer-preview">
            {PRAYER_NAMES.map((p) => (
              <div key={p} className="grid gap-1">
                <dt className="text-micro text-fg-muted">{t(`prayer.${p}`)}</dt>
                <dd className="text-caption font-semibold text-fg tabular-nums">
                  {timeFormat.format(schedule.today![p])}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </section>
  );
}
