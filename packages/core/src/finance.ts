/**
 * Ledger maths in integer minor units. Totals are computed in one display
 * currency: entries already in that currency are summed exactly; others are
 * converted with the current USD→BDT rate (only legacy/mixed data needs this).
 */
import {
  BASE_CURRENCY,
  fromBaseMinor,
  MoneyError,
  sumMinor,
  toBaseMinor,
  type Currency,
  type FxRateMicro,
  type Minor,
} from './money';

export type LedgerEntryType = 'income' | 'expense' | 'transfer' | 'withdrawal';

export interface LedgerEntry {
  readonly type: LedgerEntryType;
  readonly amountMinor: Minor;
  readonly currency: Currency;
  readonly date: string; // YYYY-MM-DD
  readonly categoryId?: string | null;
}

/** Convert between currencies; `fxRateMicro` is 1 USD = rate BDT. */
export function convertMinor(
  amountMinor: Minor,
  from: Currency,
  to: Currency,
  fxRateMicro: FxRateMicro | null,
): Minor {
  if (from === to) return amountMinor;
  if (fxRateMicro == null)
    throw new MoneyError(`Exchange rate required to convert ${from} → ${to}`);
  const base = from === BASE_CURRENCY ? amountMinor : toBaseMinor(amountMinor, fxRateMicro);
  return to === BASE_CURRENCY ? base : fromBaseMinor(base, fxRateMicro);
}

/** Effect of an entry on available cash: income and vault withdrawals add; expenses and vault deposits subtract. */
export function cashSign(type: LedgerEntryType): 1 | -1 {
  return type === 'income' || type === 'withdrawal' ? 1 : -1;
}

export interface LedgerSummary {
  /** Available cash across all time. */
  balanceMinor: Minor;
  monthIncomeMinor: Minor;
  /** Spending only: vault transfers are excluded (they are savings, not costs). */
  monthExpenseMinor: Minor;
  /** Month spending per category, largest first. */
  byCategory: { categoryId: string; amountMinor: Minor }[];
  /** True when some entries could not be converted because no rate is set. */
  needsRate: boolean;
}

export function summarizeLedger(
  entries: Iterable<LedgerEntry>,
  display: Currency,
  fxRateMicro: FxRateMicro | null,
  month: string, // YYYY-MM
): LedgerSummary {
  const balance: Minor[] = [];
  const income: Minor[] = [];
  const expense: Minor[] = [];
  const categories = new Map<string, Minor[]>();
  let needsRate = false;

  for (const e of entries) {
    if (e.currency !== display && fxRateMicro == null) {
      needsRate = true;
      continue;
    }
    const amount = convertMinor(e.amountMinor, e.currency, display, fxRateMicro);
    balance.push(cashSign(e.type) * amount);
    if (!e.date.startsWith(month)) continue;
    if (e.type === 'income') income.push(amount);
    if (e.type === 'expense') {
      expense.push(amount);
      const key = e.categoryId ?? 'other';
      const list = categories.get(key) ?? [];
      list.push(amount);
      categories.set(key, list);
    }
  }

  return {
    balanceMinor: sumMinor(balance),
    monthIncomeMinor: sumMinor(income),
    monthExpenseMinor: sumMinor(expense),
    byCategory: [...categories]
      .map(([categoryId, list]) => ({ categoryId, amountMinor: sumMinor(list) }))
      .sort((a, b) => b.amountMinor - a.amountMinor),
    needsRate,
  };
}

/** Whole-percent progress, clamped to 0–100 (for bars). */
export function progressPercent(partMinor: Minor, wholeMinor: Minor): number {
  if (wholeMinor <= 0) return partMinor > 0 ? 100 : 0;
  return Math.min(100, Math.max(0, Math.floor((partMinor * 100) / wholeMinor)));
}

export interface ZakatAssets {
  cashMinor: Minor;
  goldMinor: Minor;
  silverMinor: Minor;
  businessMinor: Minor;
  stocksMinor: Minor;
  liabilitiesMinor: Minor;
}

export function netZakatableMinor(a: ZakatAssets): Minor {
  return sumMinor([
    a.cashMinor,
    a.goldMinor,
    a.silverMinor,
    a.businessMinor,
    a.stocksMinor,
    -a.liabilitiesMinor,
  ]);
}

/** Nisab thresholds by metal weight (grams). */
export const NISAB_GOLD_GRAMS = 85;
export const NISAB_SILVER_GRAMS = 595;
