'use client';

import type { ShsResult } from '@lamim/core';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { memo, useEffect, useMemo } from 'react';
import { useApp } from '@/components/app/app-provider';

const SIZE = 208;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;

/**
 * Spirit Score orb: a celestial-gradient ring fills to the score, the number counts up,
 * and a soft dawn glow breathes behind it. Motion runs only when the score changes;
 * with reduced motion the ring and number jump straight to the value.
 */
export const SpiritOrb = memo(function SpiritOrb({ shs }: { shs: ShsResult }) {
  const { t, locale } = useApp();
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }), [locale]);
  const display = useTransform(value, (v) => nf.format(v));
  const progress = useTransform(value, (v) => v / 100);

  useEffect(() => {
    if (reduce) {
      value.set(shs.total);
      return;
    }
    const controls = animate(value, shs.total, { duration: 1.2, ease: [0.4, 0, 0.2, 1] });
    return () => controls.stop();
  }, [shs.total, reduce, value]);

  const rating = t(`shs.${shs.rating}`);
  const b = shs.breakdown;

  return (
    <section
      aria-labelledby="shs-heading"
      className="grid justify-items-center gap-4 rounded-xl border border-border bg-surface p-6 shadow-card"
    >
      <h2 id="shs-heading" className="justify-self-start text-lead font-semibold text-fg">
        {t('home.shs.title')}
      </h2>
      <div className="relative grid place-items-center" style={{ width: SIZE, height: SIZE }}>
        <motion.div
          aria-hidden
          className="bg-celestial absolute inset-6 rounded-full opacity-25 blur-2xl"
          {...(reduce
            ? {}
            : {
                animate: { scale: [1, 1.06, 1], opacity: [0.2, 0.32, 0.2] },
                transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
              })}
        />
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={t('home.shs.label', { score: Math.round(shs.total), rating })}
          className="relative -rotate-90"
        >
          <defs>
            <linearGradient id="orb-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-terracotta)" />
              <stop offset="25%" stopColor="var(--color-raspberry)" />
              <stop offset="50%" stopColor="var(--color-violet)" />
              <stop offset="75%" stopColor="var(--color-iris)" />
              <stop offset="100%" stopColor="var(--color-cerulean)" />
            </linearGradient>
          </defs>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="var(--color-surface)"
            stroke="var(--color-surface-subtle)"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="url(#orb-ring)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            style={{ pathLength: progress }}
          />
        </svg>
        <div aria-hidden className="absolute grid justify-items-center">
          <motion.span className="text-display leading-none font-bold text-fg tabular-nums">
            {display}
          </motion.span>
          <span className="text-caption font-semibold text-fg-muted">{rating}</span>
        </div>
      </div>
      <p className="text-center text-caption text-fg-muted">
        {t('home.shs.breakdown', {
          salah: b.salah,
          nafl: b.nafl,
          dhikr: b.dhikr,
          habits: b.habits,
          bonus: b.consistency,
        })}
      </p>
    </section>
  );
});
