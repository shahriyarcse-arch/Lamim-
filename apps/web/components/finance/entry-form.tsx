'use client';

import type { DateStr } from '@lamim/core';
import { addEntry } from '@lamim/db';
import { useId, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { CATEGORY_SECTIONS, FINANCE_CATEGORIES } from '@/lib/finance-categories';
import type { MessageKey } from '@/lib/i18n';
import { cardClass, inputClass, MoneyField, parseAmount, primaryButton } from './money-field';
import { financeErrorMessage, type FinanceData } from './use-finance';

export function EntryForm({ data, today }: { data: FinanceData; today: DateStr }) {
  const { db, profileId, t } = useApp();
  const ids = { category: useId(), note: useId(), date: useId() };
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('bazar');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<DateStr>(today);
  const [status, setStatus] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const amountMinor = parseAmount(amount, data.currency);
    if (amountMinor === null) return setStatus({ kind: 'error', text: t('finance.err.amount') });
    setBusy(true);
    try {
      await addEntry(db, {
        profileId,
        type,
        amountMinor,
        currency: data.currency,
        fxRateMicro: data.fx?.rateMicro ?? null,
        date,
        categoryId: type === 'expense' ? categoryId : null,
        description: note,
      });
      setAmount('');
      setNote('');
      setStatus({ kind: 'ok', text: t('finance.add.saved') });
    } catch (e) {
      setStatus({ kind: 'error', text: financeErrorMessage(e, t) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="add-entry-heading" className={cardClass}>
      <h2 id="add-entry-heading" className="text-lead font-semibold text-fg">
        {t('finance.add.title')}
      </h2>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div
          role="radiogroup"
          aria-label={t('finance.add.type')}
          className="grid grid-cols-2 gap-1 rounded-pill bg-surface-subtle p-1"
        >
          {(['expense', 'income'] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={type === k}
              onClick={() => setType(k)}
              className={`rounded-pill px-4 py-2 text-caption font-semibold transition-colors ${
                type === k
                  ? k === 'expense'
                    ? 'bg-terracotta-strong text-white'
                    : 'bg-cerulean-strong text-white'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {t(k === 'expense' ? 'finance.expense' : 'finance.income')}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField
            label={t('finance.amount')}
            value={amount}
            onChange={setAmount}
            currency={data.currency}
            required
          />
          {type === 'expense' ? (
            <div className="grid gap-1">
              <label htmlFor={ids.category} className="text-caption font-medium text-fg-muted">
                {t('finance.category')}
              </label>
              <select
                id={ids.category}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
              >
                {CATEGORY_SECTIONS.map((section) => (
                  <optgroup key={section} label={t(`finance.section.${section}` as MessageKey)}>
                    {FINANCE_CATEGORIES.filter((c) => c.section === section).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          ) : null}
          <div className="grid gap-1">
            <label htmlFor={ids.note} className="text-caption font-medium text-fg-muted">
              {t('finance.description')}
            </label>
            <input
              id={ids.note}
              value={note}
              maxLength={120}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor={ids.date} className="text-caption font-medium text-fg-muted">
              {t('finance.date')}
            </label>
            <input
              id={ids.date}
              type="date"
              value={date}
              max={today}
              required
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className={primaryButton}>
            {t('finance.add.submit')}
          </button>
          {status ? (
            <p
              role={status.kind === 'error' ? 'alert' : 'status'}
              className={`text-caption ${status.kind === 'error' ? 'text-terracotta-text' : 'text-fg-muted'}`}
            >
              {status.text}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
