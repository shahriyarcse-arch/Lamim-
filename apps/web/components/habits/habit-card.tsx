'use client';

import { habitRank, habitStats, type DateStr } from '@lamim/core';
import { deleteHabit, logRelapse, undoRelapse, type HabitWithEvents } from '@lamim/db';
import { memo, useId, useMemo, useRef, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { HABIT_RANK_NAMES } from '@/lib/habit-presets';
import { useNow } from './use-now';

interface Props {
  item: HabitWithEvents;
  /** Minute-resolution clock for collapsed cards. */
  minuteNow: number;
  today: DateStr;
}

export const HabitCard = memo(function HabitCard({ item, minuteNow, today }: Props) {
  const { db, profileId, t, lang, locale } = useApp();
  const panelId = useId();
  const reasonId = useId();
  const [open, setOpen] = useState(false);
  const secondNow = useNow(1000, open); // per-second ticks only while expanded
  const now = open ? secondNow : minuteNow;
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const df = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
    [locale],
  );

  const { habit, events } = item;
  const legacyLongest =
    typeof habit.extra?.longestStreak === 'number' ? habit.extra.longestStreak : 0;
  const stats = habitStats(habit.startDate, events, now, legacyLongest);
  const rank = habitRank(stats.current.totalMs);
  const rankName = (i: number) => {
    const r = HABIT_RANK_NAMES[i];
    return r ? (lang === 'bn' ? r.nameBn : r.name) : '';
  };
  const c = stats.current;

  const [relapsing, setRelapsing] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ text: string; undoId?: string; error?: boolean } | null>(
    null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fail = (e: unknown) => {
    console.error(JSON.stringify({ event: 'habits.save.failed', message: String(e) }));
    setMessage({ text: t('habits.saveFailed'), error: true });
  };

  const relapse = () => {
    logRelapse(db, { profileId, habitId: habit.id, date: today, reason })
      .then((event) => {
        setRelapsing(false);
        setReason('');
        setMessage({ text: t('habits.relapseLogged'), undoId: event.id });
      })
      .catch(fail);
  };

  const remove = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      clearTimeout(deleteTimer.current);
      deleteTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    deleteHabit(db, profileId, habit.id).catch(fail);
  };

  const recent = events
    .filter((e) => e.type === 'relapse')
    .slice(-5)
    .reverse();

  return (
    <li
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-card"
      data-testid="habit"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-surface-subtle sm:p-6"
      >
        <span className="grid min-w-0 gap-1">
          <span className="truncate text-lead font-semibold text-fg">{habit.label}</span>
          <span className="text-caption text-fg-muted">
            {t('habits.rank', { rank: rankName(rank.index) })}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span
            className="text-h3 font-bold text-fg tabular-nums"
            aria-label={t('habits.timerLabel', {
              name: habit.label,
              days: c.days,
              hours: c.hours,
              minutes: c.minutes,
            })}
            data-testid="habit-timer"
          >
            {t('habits.timer', { days: c.days, hours: c.hours, minutes: c.minutes })}
          </span>
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-fg-muted transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open ? (
        <div id={panelId} className="grid gap-4 border-t border-border p-4 sm:p-6">
          <dl className="grid grid-cols-4 gap-2 text-center" aria-live="off">
            {(
              [
                ['habits.days', c.days],
                ['habits.hours', c.hours],
                ['habits.minutes', c.minutes],
                ['habits.seconds', c.seconds],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="grid gap-1 rounded-lg bg-surface-subtle p-2">
                <dd
                  className="text-h2 font-bold text-fg tabular-nums"
                  data-testid={`habit-${label.split('.')[1]}`}
                >
                  {nf.format(value)}
                </dd>
                <dt className="text-micro text-fg-muted">{t(label)}</dt>
              </div>
            ))}
          </dl>

          <div className="grid gap-1">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(rank.progress * 100)}
              aria-label={t('habits.rank', { rank: rankName(rank.index) })}
              className="h-2 overflow-hidden rounded-pill bg-surface-subtle"
            >
              <div
                className="bg-celestial h-full rounded-pill transition-[width] duration-300"
                style={{ width: `${rank.progress * 100}%` }}
              />
            </div>
            <p className="text-caption text-fg-muted">
              {rank.nextDays === null
                ? t('habits.topRank')
                : t('habits.nextRank', {
                    days: Math.max(1, Math.ceil(rank.nextDays - c.totalMs / 86_400_000)),
                    rank: rankName(rank.index + 1),
                  })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <p className="grid rounded-lg border border-border p-2">
              <span className="text-micro text-fg-muted">{t('habits.longest')}</span>
              <span className="text-body font-semibold text-fg tabular-nums">
                {nf.format(stats.longestDays)} {t('habits.days')}
              </span>
            </p>
            <p className="grid rounded-lg border border-border p-2">
              <span className="text-micro text-fg-muted">{t('habits.relapses')}</span>
              <span
                className="text-body font-semibold text-fg tabular-nums"
                data-testid="habit-relapses"
              >
                {nf.format(stats.relapses)}
              </span>
            </p>
          </div>

          {relapsing ? (
            <form
              className="grid gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                relapse();
              }}
            >
              <label htmlFor={reasonId} className="text-caption font-medium text-fg-muted">
                {t('habits.relapseReason')}
              </label>
              <input
                id={reasonId}
                value={reason}
                maxLength={200}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-body text-fg focus:outline-2 focus:outline-focus"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-pill bg-terracotta-strong px-4 py-2 text-caption font-semibold text-white transition-[filter] hover:brightness-110"
                >
                  {t('habits.relapseConfirm')}
                </button>
                <button
                  type="button"
                  onClick={() => setRelapsing(false)}
                  className="rounded-pill border border-border px-4 py-2 text-caption font-semibold text-fg hover:bg-surface-subtle"
                >
                  {t('habits.relapseCancel')}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setRelapsing(true);
                  setMessage(null);
                }}
                className="rounded-pill border border-terracotta px-4 py-2 text-caption font-semibold text-terracotta-text transition-colors hover:bg-terracotta/10"
              >
                {t('habits.relapse')}
              </button>
              <button
                type="button"
                onClick={remove}
                className={`rounded-pill px-4 py-2 text-caption font-semibold transition-colors ${
                  confirmDelete
                    ? 'bg-terracotta-strong text-white'
                    : 'border border-border text-fg-muted hover:bg-surface-subtle'
                }`}
              >
                {confirmDelete ? t('habits.deleteConfirm') : t('habits.delete')}
              </button>
            </div>
          )}

          {message ? (
            <p
              role={message.error ? 'alert' : 'status'}
              className={`flex flex-wrap items-center gap-2 text-caption ${message.error ? 'text-terracotta-text' : 'text-fg-muted'}`}
            >
              {message.text}
              {message.undoId ? (
                <button
                  type="button"
                  onClick={() =>
                    undoRelapse(db, profileId, message.undoId!)
                      .then(() => setMessage(null))
                      .catch(fail)
                  }
                  className="font-semibold text-cerulean-text underline underline-offset-2"
                >
                  {t('habits.undo')}
                </button>
              ) : null}
            </p>
          ) : null}

          {recent.length ? (
            <div className="grid gap-1">
              <h3 className="text-caption font-semibold text-fg">{t('habits.history')}</h3>
              <ul className="grid gap-1">
                {recent.map((e) => (
                  <li key={e.id} className="text-caption text-fg-muted">
                    {t('habits.historyItem', {
                      date: df.format(Date.parse(e.at ?? `${e.date}T12:00:00Z`)),
                      days: e.streak ?? 0,
                    })}
                    {e.reason ? ` · ${e.reason}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
});
