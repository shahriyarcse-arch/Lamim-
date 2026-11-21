'use client';

import { useEffect, useState } from 'react';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

function format(total: number, bn: boolean): string {
  const s = Math.max(0, total);
  const hms = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
  return bn ? hms.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]!) : hms;
}

/**
 * A demo countdown inside the marketing phone mock-ups. The server renders the
 * starting value (no hydration mismatch); after mount it ticks once a second.
 */
export function Countdown({ seconds, bn = false }: { seconds: number; bn?: boolean }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : seconds)), 1000);
    return () => clearInterval(id);
  }, [seconds]);
  return <span className="tabular-nums">{format(left, bn)}</span>;
}
