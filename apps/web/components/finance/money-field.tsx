'use client';

import { parseMinor, type Currency, type Minor } from '@lamim/core';
import { useId } from 'react';
import { useApp } from '@/components/app/app-provider';

/** Parse a typed amount exactly (no float step). Returns null when empty or invalid. */
export function parseAmount(text: string, currency: Currency): Minor | null {
  if (!text.trim()) return null;
  try {
    const v = parseMinor(text, currency);
    return v > 0 ? v : null;
  } catch {
    return null;
  }
}

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  currency: Currency;
  hint?: string;
  required?: boolean;
  /** Allow 0 (zakat inputs). */
  allowZero?: boolean;
}

export function MoneyField({ label, value, onChange, currency, hint, required, allowZero }: Props) {
  const { t } = useApp();
  const id = useId();
  const symbol = currency === 'BDT' ? '৳' : '$';
  let invalid = false;
  if (value.trim()) {
    try {
      const v = parseMinor(value, currency);
      invalid = v < 0 || (!allowZero && v === 0);
    } catch {
      invalid = true;
    }
  }

  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-caption font-medium text-fg-muted">
        {label}
      </label>
      <div className="flex items-center rounded-md border border-border bg-surface focus-within:outline-2 focus-within:outline-focus">
        <span aria-hidden className="pl-4 text-body text-fg-muted">
          {symbol}
        </span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-err` : hint ? `${id}-hint` : undefined}
          placeholder="0.00"
          className="w-full bg-transparent px-2 py-2 text-body text-fg tabular-nums outline-none"
        />
      </div>
      {invalid ? (
        <p id={`${id}-err`} className="text-caption text-terracotta-text">
          {t('finance.err.amount')}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-caption text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  'w-full rounded-md border border-border bg-surface px-4 py-2 text-body text-fg focus:outline-2 focus:outline-focus';
export const primaryButton =
  'rounded-pill bg-cerulean-strong px-6 py-2 text-caption font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95 disabled:opacity-50';
export const secondaryButton =
  'rounded-pill border border-border px-4 py-2 text-caption font-semibold text-fg transition-colors hover:bg-surface-subtle disabled:opacity-50';
export const cardClass =
  'grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6';
