'use client';

import {
  formatMinor,
  MoneyError,
  summarizeLedger,
  type Currency,
  type LedgerSummary,
  type Minor,
} from '@lamim/core';
import {
  FinanceError,
  getFxRate,
  getMonthlyBudget,
  getZakatProfile,
  listTransactions,
  listVaults,
  type FxRate,
  type MonthlyBudget,
  type Transaction,
  type Vault,
  type ZakatProfile,
} from '@lamim/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useMemo } from 'react';
import { useApp } from '@/components/app/app-provider';
import type { MessageKey, Translate } from '@/lib/i18n';

export interface FinanceData {
  currency: Currency;
  transactions: Transaction[];
  vaults: Vault[];
  fx: FxRate | null;
  budget: MonthlyBudget | null;
  zakat: ZakatProfile | undefined;
  summary: LedgerSummary;
  month: string;
}

/** One live read for the whole Finance page; re-runs after any finance write. */
export function useFinance(month: string): FinanceData | undefined {
  const { db, profileId, settings } = useApp();
  const currency = settings.currency;
  const data = useLiveQuery(async () => {
    const [transactions, vaults, fx, budget, zakat] = await Promise.all([
      listTransactions(db, profileId),
      listVaults(db, profileId),
      getFxRate(db),
      getMonthlyBudget(db, profileId),
      getZakatProfile(db, profileId),
    ]);
    return { transactions, vaults, fx, budget, zakat };
  }, [db, profileId]);

  return useMemo(() => {
    if (!data) return undefined;
    const summary = summarizeLedger(data.transactions, currency, data.fx?.rateMicro ?? null, month);
    return { ...data, currency, summary, month };
  }, [data, currency, month]);
}

export function useMoney() {
  const { locale } = useApp();
  return useCallback(
    (minor: Minor, currency: Currency) =>
      formatMinor(minor, currency, locale, { currencyDisplay: 'narrowSymbol' }),
    [locale],
  );
}

/** User-facing message for a failed finance action. */
export function financeErrorMessage(error: unknown, t: Translate): string {
  if (error instanceof FinanceError) {
    return error.code === 'invalid'
      ? `${t('finance.err.invalid')} (${error.message})`
      : t(`finance.err.${error.code}` as MessageKey);
  }
  if (error instanceof MoneyError) return t('finance.err.amount');
  return t('finance.err.invalid');
}
