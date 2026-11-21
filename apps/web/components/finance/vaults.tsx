'use client';

import { convertMinor, progressPercent, type DateStr } from '@lamim/core';
import { createVault, depositToVault, withdrawFromVault, type Vault } from '@lamim/db';
import { useId, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import {
  cardClass,
  inputClass,
  MoneyField,
  parseAmount,
  primaryButton,
  secondaryButton,
} from './money-field';
import { financeErrorMessage, useMoney, type FinanceData } from './use-finance';

export function Vaults({ data, today }: { data: FinanceData; today: DateStr }) {
  const { db, profileId, t } = useApp();
  const nameId = useId();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [error, setError] = useState<string | null>(null);

  const create = () => {
    const targetMinor = parseAmount(target, data.currency);
    if (!name.trim() || targetMinor === null) return setError(t('finance.err.invalid'));
    createVault(db, { profileId, name, targetMinor, currency: data.currency })
      .then(() => {
        setName('');
        setTarget('');
        setError(null);
      })
      .catch((e: unknown) => setError(financeErrorMessage(e, t)));
  };

  return (
    <section aria-labelledby="vaults-heading" className={cardClass}>
      <h2 id="vaults-heading" className="text-lead font-semibold text-fg">
        {t('finance.vaults.title')}
      </h2>
      {data.vaults.length === 0 ? (
        <p className="text-caption text-fg-muted">{t('finance.vaults.empty')}</p>
      ) : null}
      <ul className="grid gap-4">
        {data.vaults.map((v) => (
          <VaultRow key={v.id} vault={v} data={data} today={today} />
        ))}
      </ul>
      <form
        className="grid gap-2 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
      >
        <div className="grid gap-1">
          <label htmlFor={nameId} className="text-caption font-medium text-fg-muted">
            {t('finance.vaults.name')}
          </label>
          <input
            id={nameId}
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <MoneyField
          label={t('finance.vaults.target')}
          value={target}
          onChange={setTarget}
          currency={data.currency}
          required
        />
        <button type="submit" className={primaryButton}>
          {t('finance.vaults.create')}
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

function VaultRow({ vault, data, today }: { vault: Vault; data: FinanceData; today: DateStr }) {
  const { db, profileId, t } = useApp();
  const money = useMoney();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pct = progressPercent(vault.savedMinor, vault.targetMinor);
  const rate = data.fx?.rateMicro ?? null;
  const show = (minor: number) =>
    vault.currency === data.currency || rate
      ? money(convertMinor(minor, vault.currency, data.currency, rate), data.currency)
      : money(minor, vault.currency);

  const move = async (direction: 'deposit' | 'withdraw') => {
    const amountMinor = parseAmount(amount, data.currency);
    if (amountMinor === null) return setError(t('finance.err.amount'));
    setBusy(true);
    try {
      const input = {
        profileId,
        vaultId: vault.id,
        amountMinor,
        currency: data.currency,
        fxRateMicro: rate,
        date: today,
      };
      await (direction === 'deposit' ? depositToVault(db, input) : withdrawFromVault(db, input));
      setAmount('');
      setError(null);
    } catch (e) {
      setError(financeErrorMessage(e, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="grid gap-2 rounded-lg border border-border p-4" data-testid="vault">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-body font-semibold text-fg">{vault.name}</h3>
        <span className="text-caption font-semibold text-fg tabular-nums">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={vault.name}
        className="h-3 overflow-hidden rounded-pill bg-surface-subtle"
      >
        <div
          className="bg-celestial h-full rounded-pill transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-caption text-fg-muted">
        {pct >= 100
          ? t('finance.vaults.complete')
          : t('finance.vaults.progress', {
              saved: show(vault.savedMinor),
              target: show(vault.targetMinor),
              pct,
            })}
      </p>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <MoneyField
          label={t('finance.amount')}
          value={amount}
          onChange={setAmount}
          currency={data.currency}
        />
        <button
          type="button"
          disabled={busy}
          className={primaryButton}
          onClick={() => void move('deposit')}
        >
          {t('finance.vaults.deposit')}
        </button>
        <button
          type="button"
          disabled={busy || vault.savedMinor === 0}
          className={secondaryButton}
          onClick={() => void move('withdraw')}
        >
          {t('finance.vaults.withdraw')}
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-caption text-terracotta-text">
          {error}
        </p>
      ) : null}
    </li>
  );
}
