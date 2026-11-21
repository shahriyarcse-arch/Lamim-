'use client';

import { convertMinor, progressPercent } from '@lamim/core';
import { setMonthlyBudget } from '@lamim/db';
import { useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { categoryName } from '@/lib/finance-categories';
import { cardClass, MoneyField, parseAmount, primaryButton, secondaryButton } from './money-field';
import { financeErrorMessage, useMoney, type FinanceData } from './use-finance';

export function SummaryCard({ data }: { data: FinanceData }) {
  const { db, profileId, t } = useApp();
  const money = useMoney();
  const { summary, currency, budget, fx } = data;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Budget is stored in the currency it was set in; show it in the display currency.
  const budgetMinor =
    budget && (budget.currency === currency || fx)
      ? convertMinor(budget.amountMinor, budget.currency, currency, fx?.rateMicro ?? null)
      : null;
  const spentPct = budgetMinor ? progressPercent(summary.monthExpenseMinor, budgetMinor) : 0;
  const over = budgetMinor !== null && summary.monthExpenseMinor > budgetMinor;
  const flowMax = Math.max(summary.monthIncomeMinor, summary.monthExpenseMinor, 1);

  const saveBudget = () => {
    const amount = parseAmount(draft, currency);
    if (amount === null) return setError(t('finance.err.amount'));
    setMonthlyBudget(db, profileId, { amountMinor: amount, currency })
      .then(() => {
        setEditing(false);
        setError(null);
      })
      .catch((e: unknown) => setError(financeErrorMessage(e, t)));
  };

  return (
    <section aria-labelledby="balance-heading" className="bg-dawn rounded-xl p-px shadow-raised">
      <div className="grid gap-6 rounded-xl bg-surface p-4 sm:p-6">
        <div className="grid gap-1">
          <h2
            id="balance-heading"
            className="text-caption font-semibold tracking-wide text-fg-muted uppercase"
          >
            {t('finance.balance')}
          </h2>
          <p
            data-testid="balance"
            className={`text-h1 font-bold tabular-nums ${summary.balanceMinor < 0 ? 'text-terracotta-text' : 'text-fg'}`}
          >
            {money(summary.balanceMinor, currency)}
          </p>
          {summary.balanceMinor < 0 ? (
            <p className="text-caption text-fg-muted">{t('finance.balanceNegative')}</p>
          ) : null}
          {summary.needsRate ? (
            <p className="text-caption text-terracotta-text">{t('finance.err.rate_required')}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <h3 className="text-caption font-semibold text-fg">{t('finance.month')}</h3>
          {(
            [
              ['finance.income', summary.monthIncomeMinor, 'bg-cerulean-strong'],
              ['finance.expense', summary.monthExpenseMinor, 'bg-terracotta-strong'],
            ] as const
          ).map(([label, value, color]) => (
            <div key={label} className="grid grid-cols-[5rem_1fr_auto] items-center gap-2">
              <span className="text-caption text-fg-muted">{t(label)}</span>
              <span className="h-2 overflow-hidden rounded-pill bg-surface-subtle">
                <span
                  className={`block h-full rounded-pill ${color} transition-[width] duration-300`}
                  style={{ width: `${progressPercent(value, flowMax)}%` }}
                />
              </span>
              <span className="text-caption font-semibold text-fg tabular-nums">
                {money(value, currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-caption font-semibold text-fg">{t('finance.budget')}</h3>
            {!editing ? (
              <button type="button" className={secondaryButton} onClick={() => setEditing(true)}>
                {t('finance.budget.set')}
              </button>
            ) : null}
          </div>
          {editing ? (
            <form
              className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                saveBudget();
              }}
            >
              <MoneyField
                label={t('finance.budget')}
                value={draft}
                onChange={setDraft}
                currency={currency}
                required
              />
              <button type="submit" className={primaryButton}>
                {t('finance.budget.save')}
              </button>
            </form>
          ) : budgetMinor !== null ? (
            <>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={spentPct}
                aria-label={t('finance.budget')}
                className="h-3 overflow-hidden rounded-pill bg-surface-subtle"
              >
                <div
                  className={`h-full rounded-pill transition-[width] duration-300 ${over ? 'bg-terracotta-strong' : 'bg-celestial'}`}
                  style={{ width: `${spentPct}%` }}
                />
              </div>
              <p className={`text-caption ${over ? 'text-terracotta-text' : 'text-fg-muted'}`}>
                {over
                  ? t('finance.budget.over', {
                      amount: money(summary.monthExpenseMinor - budgetMinor, currency),
                    })
                  : t('finance.budget.status', {
                      spent: money(summary.monthExpenseMinor, currency),
                      budget: money(budgetMinor, currency),
                    })}
              </p>
            </>
          ) : (
            <p className="text-caption text-fg-muted">{t('finance.budget.none')}</p>
          )}
          {error ? (
            <p role="alert" className="text-caption text-terracotta-text">
              {error}
            </p>
          ) : null}
        </div>

        {summary.byCategory.length ? (
          <div className="grid gap-2">
            <h3 className="text-caption font-semibold text-fg">{t('finance.topCategories')}</h3>
            <ul className="grid gap-1">
              {summary.byCategory.slice(0, 4).map((c) => (
                <li key={c.categoryId} className="flex justify-between gap-2 text-caption">
                  <span className="text-fg-muted">
                    {categoryName(c.categoryId) ?? t('finance.uncategorized')}
                  </span>
                  <span className="font-semibold text-fg tabular-nums">
                    {money(c.amountMinor, currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
