'use client';

import { calculateShs } from '@lamim/core';
import { getSalahDayDetails, getShsInput } from '@lamim/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { useApp } from '@/components/app/app-provider';
import { AyahCard } from '@/components/home/ayah-card';
import { FastingToggle } from '@/components/home/fasting-toggle';
import { PrayerTimeline } from '@/components/home/prayer-timeline';
import { SpiritOrb } from '@/components/home/spirit-orb';
import { LocationCard } from '@/components/salah/location-card';
import { NextPrayerCard } from '@/components/salah/next-prayer';
import { usePrayerSchedule } from '@/components/salah/use-prayer-schedule';

export default function HomeDashboard() {
  const { db, profileId, t, locale } = useApp();
  const schedule = usePrayerSchedule();
  const today = schedule.clock.wakingDate;

  // One live read across modules; re-runs whenever Salah, Dhikr, habits or fasting change.
  const day = useLiveQuery(async () => {
    const [shsInput, details] = await Promise.all([
      getShsInput(db, profileId, today),
      getSalahDayDetails(db, profileId, today),
    ]);
    return { shsInput, fasting: details?.fasting ?? false };
  }, [db, profileId, today]);

  const shs = useMemo(() => (day ? calculateShs(day.shsInput) : null), [day]);
  const timeFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }),
    [locale],
  );

  return (
    <div className="grid gap-6">
      <h1 className="text-h1 font-bold text-fg">{t('home.title')}</h1>
      {schedule.input ? (
        <NextPrayerCard input={schedule.input} timeFormat={timeFormat} />
      ) : (
        <LocationCard approximate={false} />
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {shs ? (
          <SpiritOrb shs={shs} />
        ) : (
          <div className="min-h-80 animate-pulse rounded-xl bg-surface-subtle" aria-busy />
        )}
        <div className="grid content-start gap-6">
          <PrayerTimeline
            log={day?.shsInput.salah ?? {}}
            schedule={schedule.today}
            current={schedule.current}
            timeFormat={timeFormat}
          />
          <FastingToggle date={today} fasting={day?.fasting ?? false} />
        </div>
      </div>
      <AyahCard date={today} />
    </div>
  );
}
