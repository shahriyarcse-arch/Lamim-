'use client';

import { BREATHING_478, breathingStateAt, type BreathPhase } from '@lamim/core';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/app/app-provider';

const SIZE = 240;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;

/** Gentle, distinct cues per phase (ignored where vibration is unsupported, e.g. iOS). */
const HAPTICS: Record<BreathPhase, number | number[]> = {
  inhale: 40,
  hold: [20, 80, 20],
  exhale: 60,
};

function vibrate(pattern: number | number[]) {
  try {
    if ('vibrate' in navigator && (navigator.userActivation?.hasBeenActive ?? true))
      navigator.vibrate(pattern);
  } catch {
    /* unsupported */
  }
}

interface Shown {
  phase: BreathPhase;
  index: number;
  cycle: number;
  secondsLeft: number;
}

/**
 * 4-7-8 breathing. Phase and countdown are driven by timers aligned to whole
 * seconds and read from the wall clock (correct after the tab was backgrounded,
 * and independent of requestAnimationFrame, which some WebViews pause). The ring
 * and orb are declarative motion animations sized to each phase, so React renders
 * only once per second.
 */
export function BreathingCircle() {
  const { t, locale } = useApp();
  const reduce = useReducedMotion();
  const [running, setRunning] = useState(false);
  const [shown, setShown] = useState<Shown | null>(null);
  const nf = new Intl.NumberFormat(locale);

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    let prev: Shown | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = breathingStateAt(performance.now() - start);
      const next: Shown = {
        phase: s.phase,
        index: s.index,
        cycle: s.cycle,
        secondsLeft: Math.ceil(s.phaseRemainingMs / 1000),
      };
      if (!prev || prev.index !== next.index || prev.cycle !== next.cycle)
        vibrate(HAPTICS[next.phase]);
      prev = next;
      setShown(next);
      // Wake at the next whole-second (or phase) boundary.
      timer = setTimeout(tick, (s.phaseRemainingMs % 1000 || 1000) + 5);
    };
    tick();
    return () => clearTimeout(timer);
  }, [running]);

  const stop = () => {
    setRunning(false);
    setShown(null);
  };

  const phase = shown?.phase ?? null;
  const step = phase ? BREATHING_478.find((s) => s.phase === phase)! : null;
  // Scale tells the story: grow while inhaling, stay full while holding, shrink while exhaling.
  const scale = reduce ? 1 : phase === 'inhale' || phase === 'hold' ? 1 : 0.62;
  const duration = reduce || !step ? 0 : phase === 'hold' ? 0 : step.ms / 1000;

  return (
    <section
      aria-labelledby="breath-heading"
      className="grid justify-items-center gap-4 rounded-xl border border-border bg-surface p-6 shadow-card"
    >
      <div className="grid gap-1 justify-self-stretch">
        <h2 id="breath-heading" className="text-lead font-semibold text-fg">
          {t('breath.title')}
        </h2>
        <p className="text-caption text-fg-muted">{t('breath.body')}</p>
      </div>

      <div className="relative grid place-items-center" style={{ width: SIZE, height: SIZE }}>
        <motion.div
          aria-hidden
          className="bg-dawn absolute inset-6 rounded-full opacity-30"
          initial={false}
          animate={{ scale: running ? scale : 0.62 }}
          transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
          data-testid="breath-orb"
        />
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-hidden
          className="relative -rotate-90"
        >
          <defs>
            <linearGradient id="breath-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-iris)" />
              <stop offset="50%" stopColor="var(--color-azure)" />
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
          {shown && step ? (
            <motion.circle
              key={`${shown.cycle}-${shown.index}`}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="url(#breath-ring)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: step.ms / 1000, ease: 'linear' }}
            />
          ) : null}
        </svg>
        <div className="absolute grid justify-items-center gap-1" aria-live="polite" aria-atomic>
          <span className="text-h3 font-semibold text-fg" data-testid="breath-phase">
            {phase ? t(`breath.${phase}`) : t('breath.ready')}
          </span>
          {shown ? (
            <span className="text-display leading-none font-bold text-fg tabular-nums" aria-hidden>
              {nf.format(shown.secondsLeft)}
            </span>
          ) : null}
        </div>
      </div>

      <p className="text-caption text-fg-muted" data-testid="breath-cycles">
        {t('breath.cycles', { count: shown?.cycle ?? 0 })}
      </p>
      <button
        type="button"
        onClick={() => (running ? stop() : setRunning(true))}
        className={`rounded-pill px-8 py-2 font-semibold transition-[filter] hover:brightness-110 active:brightness-95 ${
          running ? 'border border-border text-fg' : 'bg-iris-strong text-white'
        }`}
      >
        {running ? t('breath.stop') : t('breath.start')}
      </button>
    </section>
  );
}
