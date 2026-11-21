'use client';

import {
  getCurrentPrayer,
  getPrayerTimes,
  type PrayerName,
  type PrayerSchedule,
  type PrayerTimesInput,
} from '@lamim/core';
import { useMemo } from 'react';
import { useApp } from '@/components/app/app-provider';
import { useMinuteClock, type Clock } from './use-clock';

const DHAKA = { lat: 23.8103, lng: 90.4125 };

export interface PrayerScheduleState {
  clock: Clock;
  /** null until the user sets a location (outside Bangladesh zone). */
  input: PrayerTimesInput | null;
  /** True when using the Dhaka fallback instead of saved coordinates. */
  approximate: boolean;
  today: PrayerSchedule | null;
  current: PrayerName | null;
}

/**
 * Shared prayer-time inputs for Home and Salah. Schedules are memoized in core per
 * (date, lat, lng, method, asr), so this is cheap on every minute tick.
 */
export function usePrayerSchedule(): PrayerScheduleState {
  const { settings } = useApp();
  const clock = useMinuteClock();
  const deviceZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const coords =
    settings.lat !== null && settings.lng !== null
      ? { lat: settings.lat, lng: settings.lng, approximate: false }
      : deviceZone === 'Asia/Dhaka'
        ? { ...DHAKA, approximate: true }
        : null;

  const input = useMemo<PrayerTimesInput | null>(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- coords is derived from these primitives
    [coords?.lat, coords?.lng, clock.calendarDate, settings.method, settings.asr],
  );
  const today = input ? getPrayerTimes(input) : null;

  return {
    clock,
    input,
    approximate: Boolean(coords?.approximate),
    today,
    current: today ? getCurrentPrayer(today, clock.now) : null,
  };
}
