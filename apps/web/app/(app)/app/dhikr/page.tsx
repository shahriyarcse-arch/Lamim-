'use client';

import { dhikrMilestone } from '@lamim/core';
import { getCustomDhikrPresets, getDhikrCounts, incrementDhikr, resetDhikr } from '@lamim/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { ProgressRing } from '@/components/dhikr/progress-ring';
import { useMinuteClock } from '@/components/salah/use-clock';
import { BUILT_IN_PRESETS, type DhikrPreset } from '@/lib/dhikr-presets';

const SELECTED_KEY = 'lamim:dhikr:preset';

function vibrate(pattern: number | number[]) {
  try {
    // Browsers reject vibration before a real user gesture; skip instead of logging errors.
    if ('vibrate' in navigator && (navigator.userActivation?.hasBeenActive ?? true)) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* unsupported (iOS Safari) — the visual press feedback still plays */
  }
}

export default function DhikrPage() {
  const { db, profileId, t, lang, locale } = useApp();
  const { wakingDate: today } = useMinuteClock();
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const custom = useLiveQuery(() => getCustomDhikrPresets(db), [db]);
  const presets = useMemo<DhikrPreset[]>(
    () => [
      ...BUILT_IN_PRESETS,
      ...(custom ?? []).map((c) => ({
        id: c.id,
        arabic: c.arabic ?? '',
        latin: c.latin,
        bn: c.latin,
        meaning: c.meaning ?? '',
        meaningBn: c.meaning ?? '',
        target: c.target,
        custom: true,
      })),
    ],
    [custom],
  );

  const [selectedId, setSelectedId] = useState<string>(BUILT_IN_PRESETS[0]!.id);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SELECTED_KEY);
      if (saved) setSelectedId(saved);
    } catch {
      /* per-viewer convenience only */
    }
  }, []);
  const preset = presets.find((p) => p.id === selectedId) ?? presets[0]!;

  const counts = useLiveQuery(() => getDhikrCounts(db, profileId, today), [db, profileId, today]);
  const count = counts?.[preset.id] ?? 0;
  const total = Object.values(counts ?? {}).reduce((a, b) => a + b, 0);
  const milestone = dhikrMilestone(count, preset.target);

  const [pulseKey, setPulseKey] = useState(0);
  const [announce, setAnnounce] = useState('');
  const [error, setError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const select = (id: string) => {
    setSelectedId(id);
    setConfirmReset(false);
    try {
      localStorage.setItem(SELECTED_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const tap = useCallback(() => {
    vibrate(15);
    setError(false);
    incrementDhikr(db, { profileId, date: today, presetId: preset.id })
      .then((next) => {
        if (dhikrMilestone(next, preset.target).reached) {
          vibrate([30, 60, 30]);
          setPulseKey((k) => k + 1);
          setAnnounce(t('dhikr.milestoneReached', { count: next }));
        }
      })
      .catch((err: unknown) => {
        console.error(JSON.stringify({ event: 'dhikr.save.failed', message: String(err) }));
        setError(true);
      });
  }, [db, profileId, today, preset.id, preset.target, t]);

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setConfirmReset(false);
    resetDhikr(db, { profileId, date: today, presetId: preset.id }).catch(() => setError(true));
  };

  const name = lang === 'bn' ? preset.bn : preset.latin;

  return (
    <div className="grid gap-4">
      <h1 className="text-h1 font-bold text-fg">{t('dhikr.title')}</h1>

      <div
        role="radiogroup"
        aria-label={t('dhikr.presets')}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2"
      >
        {presets.map((p) => {
          const active = p.id === preset.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => select(p.id)}
              className={`shrink-0 rounded-pill border px-4 py-2 text-caption font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'border-transparent bg-violet-strong text-white'
                  : 'border-border bg-surface text-fg-muted hover:bg-surface-subtle hover:text-fg'
              }`}
            >
              {lang === 'bn' ? p.bn : p.latin}
              {counts?.[p.id] ? (
                <span className="ml-1 opacity-80 tabular-nums">{nf.format(counts[p.id]!)}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* The whole card is the tap target: big, thumb-friendly, keyboard-operable (Space/Enter). */}
      <button
        type="button"
        onClick={tap}
        aria-label={t('dhikr.tapLabel', { name, count })}
        className="grid min-h-[60dvh] touch-manipulation place-items-center gap-4 rounded-xl border border-border bg-surface p-6 shadow-card transition-transform select-none active:scale-[0.99]"
      >
        <span className="grid justify-items-center gap-2">
          {preset.arabic ? (
            <span lang="ar" dir="rtl" className="font-quran text-quran text-fg">
              {preset.arabic}
            </span>
          ) : null}
          <span className="text-lead font-semibold text-fg">{name}</span>
          <span className="text-caption text-fg-muted">
            {lang === 'bn' ? preset.meaningBn : preset.meaning}
          </span>
        </span>
        <span className="relative grid place-items-center">
          <ProgressRing progress={milestone.progress} pulseKey={pulseKey} />
          <span className="absolute grid justify-items-center">
            <span className="text-display leading-none font-bold text-fg tabular-nums">
              {nf.format(count)}
            </span>
            <span className="text-caption text-fg-muted tabular-nums">
              {t('dhikr.milestone', { count, to: milestone.to })}
            </span>
          </span>
        </span>
        <span className="text-caption text-fg-muted">{t('dhikr.tapHint')}</span>
      </button>

      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-terracotta bg-terracotta/10 px-4 py-2 text-caption text-fg"
        >
          {t('dhikr.saveFailed')}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-caption text-fg-muted">{t('dhikr.totalToday', { count: total })}</p>
        <button
          type="button"
          onClick={reset}
          disabled={count === 0}
          className={`rounded-pill border px-4 py-2 text-caption font-semibold transition-colors disabled:opacity-50 ${
            confirmReset
              ? 'border-transparent bg-terracotta-strong text-white'
              : 'border-border text-fg hover:bg-surface-subtle'
          }`}
        >
          {confirmReset ? t('dhikr.resetConfirm') : t('dhikr.reset')}
        </button>
      </div>
    </div>
  );
}
