'use client';

import { createHabit } from '@lamim/db';
import { useId, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { HABIT_PRESETS } from '@/lib/habit-presets';

const input =
  'w-full rounded-md border border-border bg-surface px-4 py-2 text-body text-fg focus:outline-2 focus:outline-focus';

export function AddHabit() {
  const { db, profileId, t, lang } = useApp();
  const ids = { name: useId(), since: useId(), list: useId() };
  const [name, setName] = useState('');
  const [since, setSince] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const startIso = since ? new Date(since).toISOString() : undefined;
    createHabit(db, { profileId, label: name, ...(startIso ? { startIso } : {}) })
      .then(() => {
        setName('');
        setSince('');
        setError(null);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : t('habits.saveFailed')));
  };

  const maxLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);

  return (
    <section
      aria-labelledby="add-habit-heading"
      className="grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <h2 id="add-habit-heading" className="text-lead font-semibold text-fg">
        {t('habits.add.title')}
      </h2>
      <form
        className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="grid gap-1">
          <label htmlFor={ids.name} className="text-caption font-medium text-fg-muted">
            {t('habits.add.name')}
          </label>
          <input
            id={ids.name}
            list={ids.list}
            value={name}
            maxLength={60}
            required
            onChange={(e) => setName(e.target.value)}
            className={input}
          />
          <datalist id={ids.list} aria-label={t('habits.add.suggestions')}>
            {HABIT_PRESETS.map((p) => (
              <option key={p.id} value={lang === 'bn' ? p.labelBn : p.label} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-1">
          <label htmlFor={ids.since} className="text-caption font-medium text-fg-muted">
            {t('habits.add.since')}
          </label>
          <input
            id={ids.since}
            type="datetime-local"
            value={since}
            max={maxLocal}
            onChange={(e) => setSince(e.target.value)}
            className={input}
          />
        </div>
        <button
          type="submit"
          className="rounded-pill bg-cerulean-strong px-6 py-2 text-caption font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95"
        >
          {t('habits.add.submit')}
        </button>
      </form>
      {error ? (
        <p role="alert" className="text-caption text-terracotta-text">
          {error}
        </p>
      ) : null}
    </section>
  );
}
