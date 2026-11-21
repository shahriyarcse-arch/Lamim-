'use client';

import { cashSign, convertMinor } from '@lamim/core';
import { deleteEntry } from '@lamim/db';
import { useMemo, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { categoryName } from '@/lib/finance-categories';
import { cardClass } from './money-field';
import { financeErrorMessage, useMoney, type FinanceData } from './use-finance';

const VISIBLE = 30;

export function EntryList({ data }: { data: FinanceData }) {
  const { db, profileId, t, locale } = useApp();
  const money = useMoney();
  const [error, setError] = useState<string | null>(null);
  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    [locale],
  );
  const entries = data.transactions.filter((tx) => tx.date.startsWith(data.month));

  return (
    <section aria-labelledby="entries-heading" className={cardClass}>
      <h2 id="entries-heading" className="text-lead font-semibold text-fg">
        {t('finance.recent')}
      </h2>
      {error ? (
        <p role="alert" className="text-caption text-terracotta-text">
          {error}
        </p>
      ) : null}
      {entries.length === 0 ? (
        <p className="text-caption text-fg-muted">{t('finance.recent.empty')}</p>
      ) : (
        <ul className="grid divide-y divide-border">
          {entries.slice(0, VISIBLE).map((tx) => {
            const name =
              tx.type === 'transfer'
                ? `${t('finance.vaultDeposit')} · ${tx.description}`
                : tx.type === 'withdrawal'
                  ? `${t('finance.vaultWithdrawal')} · ${tx.description}`
                  : tx.description ||
                    (tx.type === 'income'
                      ? t('finance.income')
                      : (categoryName(tx.categoryId) ?? t('finance.uncategorized')));
            const sign = cashSign(tx.type);
            const canConvert = tx.currency === data.currency || data.fx;
            const shown = canConvert
              ? money(
                  convertMinor(
                    tx.amountMinor,
                    tx.currency,
                    data.currency,
                    data.fx?.rateMicro ?? null,
                  ),
                  data.currency,
                )
              : money(tx.amountMinor, tx.currency);
            const deletable = tx.type === 'income' || tx.type === 'expense';
            return (
              <li key={tx.id} className="flex items-center justify-between gap-4 py-2">
                <div className="grid min-w-0">
                  <span className="truncate text-body text-fg">{name}</span>
                  <span className="text-caption text-fg-muted">
                    {dateFmt.format(Date.parse(`${tx.date}T12:00:00Z`))}
                    {tx.type === 'expense' && tx.description
                      ? ` · ${categoryName(tx.categoryId) ?? ''}`
                      : ''}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`text-body font-semibold tabular-nums ${sign > 0 ? 'text-cerulean-text' : 'text-fg'}`}
                  >
                    {sign > 0 ? '+' : '−'}
                    {shown}
                  </span>
                  {deletable ? (
                    <button
                      type="button"
                      aria-label={t('finance.deleteLabel', { name, amount: shown })}
                      onClick={() =>
                        deleteEntry(db, profileId, tx.id).catch((e: unknown) =>
                          setError(financeErrorMessage(e, t)),
                        )
                      }
                      className="grid size-8 place-items-center rounded-pill text-fg-muted transition-colors hover:bg-surface-subtle hover:text-terracotta-text"
                    >
                      <svg
                        aria-hidden
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M6 6l12 12M18 6 6 18" />
                      </svg>
                    </button>
                  ) : (
                    <span className="size-8" aria-hidden />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
