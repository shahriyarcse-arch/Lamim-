'use client';

import { motion, useReducedMotion } from 'motion/react';
import { memo } from 'react';

const SIZE = 240;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;

/** Celestial-gradient milestone ring; `pulseKey` changes on each milestone to replay the pulse. */
export const ProgressRing = memo(function ProgressRing({
  progress,
  pulseKey,
}: {
  progress: number;
  pulseKey: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className="relative grid place-items-center"
      style={{ width: SIZE, height: SIZE }}
    >
      {pulseKey > 0 && !reduce ? (
        <motion.span
          key={pulseKey}
          className="bg-celestial absolute inset-0 rounded-full"
          initial={{ opacity: 0.45, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.25 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      ) : null}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="relative -rotate-90"
      >
        <defs>
          <linearGradient id="dhikr-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-terracotta)" />
            <stop offset="35%" stopColor="var(--color-violet)" />
            <stop offset="70%" stopColor="var(--color-iris)" />
            <stop offset="100%" stopColor="var(--color-cerulean)" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--color-surface-subtle)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="url(#dhikr-ring)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: progress, opacity: progress > 0 ? 1 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
    </div>
  );
});
