'use client';

import { useEffect, useState } from 'react';

/** Current time, refreshed on each `intervalMs` boundary while `enabled`. */
export function useNow(intervalMs: number, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      timer = setTimeout(tick, intervalMs - (Date.now() % intervalMs) + 5);
    };
    tick();
    return () => clearTimeout(timer);
  }, [intervalMs, enabled]);
  return now;
}
