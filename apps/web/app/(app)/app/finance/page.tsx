'use client';

import { CURRENCIES, type Currency } from '@lamim/core';
import { updateSettings } from '@lamim/db';
import { useApp } from '@/components/app/app-provider';
import { EntryForm } from '@/components/finance/entry-form';
import { EntryList } from '@/components/finance/entry-list';
import { FxCard } from '@/components/finance/fx-card';
import { SummaryCard } from '@/components/finance/summary-card';
import { useFinance } from '@/components/finance/use-finance';
import { Vaults } from '@/components/finance/vaults';
import { ZakatCard } from '@/components/finance/zakat-card';
import { useMinuteClock } from '@/components/salah/use-clock';

export default function FinancePage() {
  const { db, profileId, settings, t } = useApp();
  const { wakingDate: today } = useMinuteClock();
  const data = useFinance(today.slice(0, 7));

  const setCurrency = (currency: Currency) => {
    updateSettings(db, profileId, { currency }).catch((e: unknown) =>
      console.error(JSON.stringify({ event: 'settings.currency.failed', message: String(e) })),
    );
  };

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h1 font-bold text-fg">{t('finance.title')}</h1>
        <div
          role="radiogroup"
          aria-label={t('finance.currency')}
          className="flex gap-1 rounded-pill bg-surface-subtle p-1"
        >
          {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={settings.currency === c}
              onClick={() => setCurrency(c)}
              className={`rounded-pill px-4 py-1 text-caption font-semibold transition-colors ${
                settings.currency === c
                  ? 'bg-violet-strong text-white'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              {CURRENCIES[c].symbol} {c}
            </button>
          ))}
        </div>
      </header>

      {!data ? (
        <div aria-busy className="min-h-64 animate-pulse rounded-xl bg-surface-subtle" />
      ) : (
        <>
          <SummaryCard data={data} />
          <div className="grid gap-6 lg:grid-cols-2">
            <EntryForm data={data} today={today} />
            <EntryList data={data} />
          </div>
          <Vaults data={data} today={today} />
          <ZakatCard data={data} />
          {data.currency === 'BDT' || data.summary.needsRate || data.fx ? (
            <FxCard data={data} />
          ) : null}
        </>
      )}
    </div>
  );
}
