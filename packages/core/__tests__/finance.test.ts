import { describe, expect, it } from 'vitest';
import {
  cashSign,
  convertMinor,
  netZakatableMinor,
  progressPercent,
  summarizeLedger,
  type LedgerEntry,
} from '../src/finance';
import { MoneyError, zakatDueMinor } from '../src/money';

const RATE = 121_530_000; // 1 USD = 121.53 BDT
const e = (
  type: LedgerEntry['type'],
  amountMinor: number,
  currency: 'USD' | 'BDT',
  date: string,
  categoryId?: string,
): LedgerEntry => ({
  type,
  amountMinor,
  currency,
  date,
  categoryId: categoryId ?? null,
});

describe('convertMinor', () => {
  it('same currency is exact and needs no rate', () => {
    expect(convertMinor(12_345, 'BDT', 'BDT', null)).toBe(12_345);
  });
  it('USD ↔ BDT through the rate', () => {
    expect(convertMinor(100_00, 'USD', 'BDT', RATE)).toBe(12_153_00);
    expect(convertMinor(12_153_00, 'BDT', 'USD', RATE)).toBe(100_00);
  });
  it('requires a rate across currencies', () => {
    expect(() => convertMinor(1, 'USD', 'BDT', null)).toThrow(MoneyError);
  });
});

describe('cashSign', () => {
  it('income and withdrawals add; expenses and deposits subtract', () => {
    expect([
      cashSign('income'),
      cashSign('withdrawal'),
      cashSign('expense'),
      cashSign('transfer'),
    ]).toEqual([1, 1, -1, -1]);
  });
});

describe('summarizeLedger', () => {
  const entries = [
    e('income', 50_000_00, 'BDT', '2026-11-01'),
    e('expense', 1_250_50, 'BDT', '2026-11-03', 'bazar'),
    e('expense', 750_25, 'BDT', '2026-11-04', 'bazar'),
    e('expense', 2_000_00, 'BDT', '2026-11-05', 'rent'),
    e('transfer', 5_000_00, 'BDT', '2026-11-06'), // vault deposit
    e('withdrawal', 1_000_00, 'BDT', '2026-11-07'),
    e('expense', 999_99, 'BDT', '2026-10-31', 'bazar'), // previous month
  ];

  it('balance includes everything; month totals exclude transfers and other months', () => {
    const s = summarizeLedger(entries, 'BDT', null, '2026-11');
    expect(s.balanceMinor).toBe(
      50_000_00 - 1_250_50 - 750_25 - 2_000_00 - 5_000_00 + 1_000_00 - 999_99,
    );
    expect(s.monthIncomeMinor).toBe(50_000_00);
    expect(s.monthExpenseMinor).toBe(1_250_50 + 750_25 + 2_000_00);
    expect(s.byCategory).toEqual([
      { categoryId: 'bazar', amountMinor: 2_000_75 }, // largest first
      { categoryId: 'rent', amountMinor: 2_000_00 },
    ]);
    expect(s.needsRate).toBe(false);
  });

  it('sums same-currency entries exactly (no float drift over 10 000 entries)', () => {
    const many = Array.from({ length: 10_000 }, () => e('expense', 10, 'BDT', '2026-11-01', 'x')); // ৳0.10 each
    expect(summarizeLedger(many, 'BDT', null, '2026-11').monthExpenseMinor).toBe(100_000);
  });

  it('converts legacy USD entries into the display currency with the rate', () => {
    const s = summarizeLedger(
      [e('income', 100_00, 'USD', '2026-11-01'), e('expense', 1_000_00, 'BDT', '2026-11-02', 'x')],
      'BDT',
      RATE,
      '2026-11',
    );
    expect(s.monthIncomeMinor).toBe(12_153_00);
    expect(s.balanceMinor).toBe(12_153_00 - 1_000_00);
  });

  it('flags and skips entries it cannot convert without a rate', () => {
    const s = summarizeLedger(
      [e('income', 100_00, 'USD', '2026-11-01'), e('income', 500_00, 'BDT', '2026-11-01')],
      'BDT',
      null,
      '2026-11',
    );
    expect(s).toMatchObject({ needsRate: true, balanceMinor: 500_00, monthIncomeMinor: 500_00 });
  });

  it('uncategorized expenses group under "other"', () => {
    expect(
      summarizeLedger([e('expense', 5, 'USD', '2026-11-01')], 'USD', null, '2026-11').byCategory,
    ).toEqual([{ categoryId: 'other', amountMinor: 5 }]);
  });

  it('empty ledger', () => {
    expect(summarizeLedger([], 'USD', null, '2026-11')).toEqual({
      balanceMinor: 0,
      monthIncomeMinor: 0,
      monthExpenseMinor: 0,
      byCategory: [],
      needsRate: false,
    });
  });
});

describe('progressPercent', () => {
  it.each([
    [0, 100, 0],
    [50, 100, 50],
    [1, 3, 33],
    [150, 100, 100],
    [-5, 100, 0],
    [5, 0, 100],
    [0, 0, 0],
  ])('%i / %i → %i%%', (part, whole, pct) => {
    expect(progressPercent(part, whole)).toBe(pct);
  });
});

describe('zakat net assets', () => {
  it('assets minus liabilities, then 2.5% above nisab', () => {
    const net = netZakatableMinor({
      cashMinor: 500_000_00,
      goldMinor: 300_000_00,
      silverMinor: 20_000_00,
      businessMinor: 0,
      stocksMinor: 80_000_00,
      liabilitiesMinor: 100_000_00,
    });
    expect(net).toBe(800_000_00);
    expect(zakatDueMinor(net, 70_000_00)).toBe(20_000_00);
    expect(zakatDueMinor(net, 900_000_00)).toBe(0);
  });
});
