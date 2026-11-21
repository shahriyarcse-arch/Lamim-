'use client';

import { localDateStr, wakingDateStr, type DateStr } from '@lamim/core';
import { useEffect, useState } from 'react';

export interface Clock {
  /** Epoch ms, refreshed on each minute boundary. */
  now: number;
  /** Calendar date at the device location (prayer schedule date). */
  calendarDate: DateStr;
  /** Logging day — rolls over at 03:00, not midnight. */
  wakingDate: DateStr;
}

function read(): Clock {
  const now = Date.now();
  return { now, calendarDate: localDateStr(now), wakingDate: wakingDateStr(now) };
}

/** Minute-resolution clock aligned to minute boundaries (no per-second re-renders). */
export function useMinuteClock(): Clock {
  const [clock, setClock] = useState(read);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          setClock(read());
          schedule();
        },
        60_000 - (Date.now() % 60_000) + 50,
      );
    };
    schedule();
    const onVisible = () => document.visibilityState === 'visible' && setClock(read());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return clock;
}
