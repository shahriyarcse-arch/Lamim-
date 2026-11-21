'use client';

import {
  convertMinor,
  minorToDecimalString,
  netZakatableMinor,
  parseMinor,
  zakatDueMinor,
  type Currency,
  type Minor,
} from '@lamim/core';
import { saveZakatProfile, type ZakatProfile } from '@lamim/db';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import type { MessageKey } from '@/lib/i18n';
import { cardClass, MoneyField, primaryButton } from './money-field';
import { financeErrorMessage, useMoney, type FinanceData } from './use-finance';

const FIELDS = [
  ['cash', 'cashMinor', 'finance.zakat.cash'],
  ['gold', 'goldMinor', 'finance.zakat.gold'],
  ['silver', 'silverMinor', 'finance.zakat.silver'],
  ['business', 'businessMinor', 'finance.zakat.business'],
  ['stocks', 'stocksMinor', 'finance.zakat.stocks'],
  ['liabilities', 'liabilitiesMinor', 'finance.zakat.liabilities'],
  ['nisab', 'nisabMinor', 'finance.zakat.nisab'],
] as const;

type Key = (typeof FIELDS)[number][0];
type Draft = Record<Key, string>;

/** Default nisab when nothing is stored: the legacy app's $600, in the display currency. */
const LEGACY_NISAB_USD_MINOR = 600_00;

function toDraft(z: ZakatProfile | undefined, currency: Currency, rate: number | null): Draft {
  const conv = (minor: Minor | undefined, from: Currency) =>
    minor === undefined || minor === 0
      ? ''
      : from === currency || rate
        ? minorToDecimalString(convertMinor(minor, from, currency, rate), currency)
        : '';
  const from = z?.currency ?? currency;
  return {
    cash: conv(z?.cashMinor, from),
    gold: conv(z?.goldMinor, from),
    silver: conv(z?.silverMinor, from),
    business: conv(z?.businessMinor, from),
    stocks: conv(z?.stocksMinor, from),
    liabilities: conv(z?.liabilitiesMinor, from),
    nisab: z ? conv(z.nisabMinor, from) : conv(LEGACY_NISAB_USD_MINOR, 'USD'),
  };
}

/** Empty → 0; otherwise exact parse. null marks an invalid field. */
function parseOrZero(text: string, currency: Currency): Minor | null {
  if (!text.trim()) return 0;
  try {
    const v = parseMinor(text, currency);
    return v >= 0 ? v : null;
  } catch {
    return null;
  }
}

export function ZakatCard({ data }: { data: FinanceData }) {
  const { db, profileId, t } = useApp();
  const money = useMoney();
  const rate = data.fx?.rateMicro ?? null;
  const [draft, setDraft] = useState<Draft>(() => toDraft(data.zakat, data.currency, rate));
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  // Re-seed when the display currency changes.
  useEffect(() => {
    setDraft(toDraft(data.zakat, data.currency, rate));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on currency switch
  }, [data.currency]);

  const values = useMemo(() => {
    const out = {} as Record<Key, Minor | null>;
    for (const [key] of FIELDS) out[key] = parseOrZero(draft[key], data.currency);
    // Nisab must be entered: treating a blank threshold as 0 would make any wealth zakatable.
    if (!draft.nisab.trim() || out.nisab === 0) out.nisab = null;
    return out;
  }, [draft, data.currency]);
  const valid = Object.values(values).every((v) => v !== null);

  const net = valid
    ? netZakatableMinor({
        cashMinor: values.cash!,
        goldMinor: values.gold!,
        silverMinor: values.silver!,
        businessMinor: values.business!,
        stocksMinor: values.stocks!,
        liabilitiesMinor: values.liabilities!,
      })
    : 0;
  const due = valid ? zakatDueMinor(net, values.nisab!) : 0;

  const save = () => {
    if (!valid) return setStatus({ kind: 'error', text: t('finance.err.amount') });
    saveZakatProfile(db, profileId, {
      currency: data.currency,
      nisabMinor: values.nisab!,
      cashMinor: values.cash!,
      goldMinor: values.gold!,
      silverMinor: values.silver!,
      businessMinor: values.business!,
      stocksMinor: values.stocks!,
      liabilitiesMinor: values.liabilities!,
    })
      .then(() => setStatus({ kind: 'ok', text: t('finance.zakat.saved') }))
      .catch((e: unknown) => setStatus({ kind: 'error', text: financeErrorMessage(e, t) }));
  };

  return (
    <section aria-labelledby="zakat-heading" className={cardClass}>
      <h2 id="zakat-heading" className="text-lead font-semibold text-fg">
        {t('finance.zakat.title')}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map(([key, , label]) => (
          <MoneyField
            key={key}
            label={t(label as MessageKey)}
            value={draft[key]}
            onChange={(v) => setDraft((d) => ({ ...d, [key]: v }))}
            currency={data.currency}
            allowZero
            {...(key === 'nisab' ? { hint: t('finance.zakat.nisabHint') } : {})}
          />
        ))}
      </div>
      <div className="grid gap-2 rounded-lg bg-surface-subtle p-4" aria-live="polite">
        <p className="flex justify-between gap-2 text-body">
          <span className="text-fg-muted">{t('finance.zakat.net')}</span>
          <span data-testid="zakat-net" className="font-semibold text-fg tabular-nums">
            {money(net, data.currency)}
          </span>
        </p>
        <p className="flex justify-between gap-2 text-lead">
          <span className="font-semibold text-fg">{t('finance.zakat.due')}</span>
          <span data-testid="zakat-due" className="font-bold text-violet-text tabular-nums">
            {money(due, data.currency)}
          </span>
        </p>
        {values.nisab === null ? (
          <p className="text-caption text-terracotta-text">{t('finance.zakat.nisabRequired')}</p>
        ) : valid && due === 0 ? (
          <p className="text-caption text-fg-muted">{t('finance.zakat.below')}</p>
        ) : null}
      </div>
      <p className="text-caption text-fg-muted">{t('finance.zakat.note')}</p>
      <div className="flex items-center gap-4">
        <button type="button" onClick={save} className={primaryButton}>
          {t('finance.zakat.save')}
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
    </section>
  );
}
