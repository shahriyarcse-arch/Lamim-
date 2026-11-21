'use client';

import { FX_MICRO, parseFxRateMicro } from '@lamim/core';
import { setFxRate } from '@lamim/db';
import { useId, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { cardClass, inputClass, primaryButton, secondaryButton } from './money-field';
import { financeErrorMessage, type FinanceData } from './use-finance';

/**
 * Manual USD→BDT rate. Live rates need a server proxy (the legacy /api/forex);
 * until then the imported legacy rate or a manual entry keeps everything offline.
 */
export function FxCard({ data }: { data: FinanceData }) {
  const { db, t, locale } = useApp();
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });
  const df = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });

  const save = () => {
    try {
      const micro = parseFxRateMicro(draft);
      setFxRate(db, micro)
        .then(() => {
          setEditing(false);
          setError(null);
        })
        .catch((e: unknown) => setError(financeErrorMessage(e, t)));
    } catch (e) {
      setError(financeErrorMessage(e, t));
    }
  };

  return (
    <section aria-labelledby="fx-heading" className={cardClass}>
      <div className="flex items-center justify-between gap-2">
        <h2 id="fx-heading" className="text-lead font-semibold text-fg">
          {t('finance.fx.title')}
        </h2>
        {!editing ? (
          <button type="button" className={secondaryButton} onClick={() => setEditing(true)}>
            {t('finance.fx.edit')}
          </button>
        ) : null}
      </div>
      {data.fx ? (
        <div className="grid gap-1">
          <p className="text-body font-semibold text-fg tabular-nums">
            {t('finance.fx.current', { rate: nf.format(data.fx.rateMicro / FX_MICRO) })}
          </p>
          <p className="text-caption text-fg-muted">
            {t('finance.fx.source', { date: df.format(data.fx.at), source: data.fx.source })}
          </p>
        </div>
      ) : (
        <p className="text-caption text-fg-muted">{t('finance.fx.missing')}</p>
      )}
      {editing ? (
        <form
          className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="grid gap-1">
            <label htmlFor={id} className="text-caption font-medium text-fg-muted">
              {t('finance.fx.label')}
            </label>
            <input
              id={id}
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <button type="submit" className={primaryButton}>
            {t('finance.fx.save')}
          </button>
        </form>
      ) : null}
      {error ? (
        <p role="alert" className="text-caption text-terracotta-text">
          {error}
        </p>
      ) : null}
    </section>
  );
}
