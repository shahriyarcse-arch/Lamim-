'use client';

import {
  addDays,
  computeSalahStreaks,
  getCurrentPrayer,
  getPrayerTimes,
  PRAYER_NAMES,
  scoreSalahDay,
  type DateStr,
  type PrayerName,
  type PrayerTimesInput,
  type SalahDayLog,
  type SalahStatus,
} from '@lamim/core';
import { getSalahRange, setSalahStatus } from '@lamim/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useMemo, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { DaySummary } from '@/components/salah/day-summary';
import { SalahHeatmap } from '@/components/salah/heatmap';
import { LocationCard } from '@/components/salah/location-card';
import { NextPrayerCard } from '@/components/salah/next-prayer';
import { PrayerRow } from '@/components/salah/prayer-row';
import { useMinuteClock } from '@/components/salah/use-clock';

const DHAKA = { lat: 23.8103, lng: 90.4125 };
const STREAK_LOOKBACK_DAYS = 365;
const utcNoon = (d: DateStr) => Date.parse(`${d}T12:00:00Z`);
const EMPTY_DAY: SalahDayLog = {};

export default function SalahPage() {
  const { db, profileId, settings, t, locale } = useApp();
  const clock = useMinuteClock();
  const today = clock.wakingDate;
  const [picked, setPicked] = useState<DateStr | null>(null);
  const selected = picked && picked <= today ? picked : today;
  const [saveError, setSaveError] = useState(false);

  // One indexed range read feeds the heatmap, streaks and the selected day; re-runs on every write.
  const days = useLiveQuery(
    () => getSalahRange(db, profileId, addDays(today, -STREAK_LOOKBACK_DAYS), today),
    [db, profileId, today],
  );

  // Location: saved coordinates, else Dhaka for Bangladesh-zone devices (flagged as approximate).
  const deviceZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const coords =
    settings.lat !== null && settings.lng !== null
      ? { lat: settings.lat, lng: settings.lng, approximate: false }
      : deviceZone === 'Asia/Dhaka'
        ? { ...DHAKA, approximate: true }
        : null;

  const scheduleInput = useMemo<PrayerTimesInput | null>(
    () =>
      coords
        ? {
            date: clock.calendarDate,
            lat: coords.lat,
            lng: coords.lng,
            method: settings.method,
            asr: settings.asr,
          }
        : null,
    [coords?.lat, coords?.lng, clock.calendarDate, settings.method, settings.asr],
  );
  const selectedSchedule = useMemo(
    () => (scheduleInput ? getPrayerTimes({ ...scheduleInput, date: selected }) : null),
    [scheduleInput, selected],
  );
  const currentPrayer =
    selected === today && scheduleInput
      ? getCurrentPrayer(getPrayerTimes(scheduleInput), clock.now)
      : null;

  const timeFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
    [locale],
  );
  const dateFormat = useMemo(
    () => ({
      gregorian: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      }),
      // ICU islamic-civil == the tabular algorithm in @lamim/core (verified daily 1990–2060).
      hijri: new Intl.DateTimeFormat(`${locale}-u-ca-islamic-civil`, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    }),
    [locale],
  );

  const dayLog = useMemo(() => days?.get(selected) ?? EMPTY_DAY, [days, selected]);
  const score = useMemo(() => scoreSalahDay(dayLog), [dayLog]);
  const streaks = useMemo(
    () => computeSalahStreaks((d) => days?.get(d), today, STREAK_LOOKBACK_DAYS),
    [days, today],
  );

  const onChange = useCallback(
    (prayer: PrayerName, status: SalahStatus | null) => {
      setSaveError(false);
      setSalahStatus(db, { profileId, date: selected, prayer, status }).catch((error: unknown) => {
        console.error(
          JSON.stringify({ event: 'salah.save.failed', prayer, message: String(error) }),
        );
        setSaveError(true);
      });
    },
    [db, profileId, selected],
  );

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div className="grid gap-1">
          <h1 className="text-h1 font-bold text-fg">{t('salah.title')}</h1>
          <p className="text-body text-fg-muted">
            {selected === today ? `${t('salah.today')} · ` : ''}
            {dateFormat.gregorian.format(utcNoon(selected))}
            <span aria-hidden> · </span>
            {dateFormat.hijri.format(utcNoon(addDays(selected, settings.hijriOffset)))}
          </p>
        </div>
        {selected !== today ? (
          <button
            type="button"
            onClick={() => setPicked(null)}
            className="rounded-pill border border-border px-4 py-2 text-caption font-semibold text-fg transition-colors hover:bg-surface-subtle"
          >
            {t('salah.backToToday')}
          </button>
        ) : null}
      </header>

      {scheduleInput ? <NextPrayerCard input={scheduleInput} timeFormat={timeFormat} /> : null}
      {!coords || coords.approximate ? (
        <LocationCard approximate={Boolean(coords?.approximate)} />
      ) : null}

      {saveError ? (
        <p
          role="alert"
          className="rounded-md border border-terracotta bg-terracotta/10 px-4 py-2 text-caption text-fg"
        >
          {t('salah.saveFailed')}
        </p>
      ) : null}

      <div className="grid gap-4" aria-busy={days === undefined}>
        {PRAYER_NAMES.map((p) => (
          <PrayerRow
            key={p}
            prayer={p}
            status={dayLog[p] as SalahStatus | undefined}
            time={selectedSchedule ? timeFormat.format(selectedSchedule[p]) : null}
            isCurrent={currentPrayer === p}
            disabled={days === undefined}
            onChange={onChange}
          />
        ))}
      </div>

      <DaySummary score={score} streaks={streaks} />
      <SalahHeatmap today={today} selected={selected} days={days} onSelect={setPicked} />
    </div>
  );
}
