import { describe, expect, it } from 'vitest';
import {
  formatMinor,
  fromBaseMinor,
  fromLegacyFloat,
  isCurrency,
  minorToDecimalString,
  MoneyError,
  parseFxRateMicro,
  parseMinor,
  percentOfMinor,
  rateToMicro,
  resolveBaseMinor,
  sumMinor,
  toBaseMinor,
  zakatDueMinor,
} from '../src/money';

describe('parseMinor (exact decimal text → integer)', () => {
  it.each([
    ['0', 0],
    ['0.1', 10],
    ['0.10', 10],
    ['12.34', 1234],
    ['1,234.50', 123_450],
    ['-5.05', -505],
    ['+7', 700],
    [' 3.5 ', 350],
    ['90071992547409.91', 9_007_199_254_740_991],
  ])('%j → %i', (text, minor) => {
    expect(parseMinor(text)).toBe(minor);
  });

  it.each(['', 'abc', '1.2.3', '1e3', '.5', '5.', 'NaN', '--1'])('rejects %j', (text) => {
    expect(() => parseMinor(text)).toThrow(MoneyError);
  });

  it('rejects sub-minor precision instead of silently rounding', () => {
    expect(() => parseMinor('1.005')).toThrow(/decimal places/);
  });

  it('rejects amounts beyond the safe integer range', () => {
    expect(() => parseMinor('90071992547409.92')).toThrow(/overflows/);
  });
});

describe('float elimination', () => {
  it('0.1 + 0.2 is exact in minor units', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(sumMinor([parseMinor('0.1'), parseMinor('0.2')])).toBe(parseMinor('0.3'));
  });

  it('summing 10 000 × 0.01 is exactly 100.00', () => {
    expect(sumMinor(Array.from({ length: 10_000 }, () => 1))).toBe(10_000);
  });
});

describe('fromLegacyFloat (migration of stored float amounts)', () => {
  it.each([
    [0, 0],
    [19.99, 1999],
    [1.005, 101], // naive Math.round(1.005 * 100) gives 100
    [1.255, 126],
    [0.1 + 0.2, 30],
    [-4.35, -435],
    [123456.78, 12_345_678],
  ])('%s → %i', (value, minor) => {
    expect(fromLegacyFloat(value)).toBe(minor);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])('rejects %s', (v) => {
    expect(() => fromLegacyFloat(v)).toThrow(MoneyError);
  });
});

describe('exchange rates', () => {
  it('parses and converts rates to micro units', () => {
    expect(parseFxRateMicro('121.53')).toBe(121_530_000);
    expect(parseFxRateMicro('0.008228')).toBe(8_228);
    expect(rateToMicro(121.53)).toBe(121_530_000);
    expect(rateToMicro(110.0000004)).toBe(110_000_000);
  });

  it.each(['0', '-1', '1.0000001', 'x'])('rejects rate %j', (text) => {
    expect(() => parseFxRateMicro(text)).toThrow(MoneyError);
  });

  it.each([0, -3, Number.NaN])('rejects float rate %s', (rate) => {
    expect(() => rateToMicro(rate)).toThrow(MoneyError);
  });
});

describe('toBaseMinor / fromBaseMinor', () => {
  const RATE = 121_530_000; // 1 USD = 121.53 BDT

  it('BDT paisa → USD cents', () => {
    expect(toBaseMinor(121_53_00, RATE)).toBe(100_00); // ৳12,153.00 → $100.00
    expect(toBaseMinor(500_00, RATE)).toBe(411); // ৳500 → $4.1142… → $4.11
  });

  it('USD cents → BDT paisa', () => {
    expect(fromBaseMinor(100_00, RATE)).toBe(12_153_00);
    expect(fromBaseMinor(1, RATE)).toBe(122); // $0.01 → ৳1.2153 → ৳1.22
  });

  it('rounds half to even', () => {
    // rate 2.0: 1 paisa → 0.5 cent → 0 (even); 3 paisa → 1.5 → 2 (even)
    expect(toBaseMinor(1, 2_000_000)).toBe(0);
    expect(toBaseMinor(3, 2_000_000)).toBe(2);
    expect(toBaseMinor(5, 2_000_000)).toBe(2);
    expect(toBaseMinor(-3, 2_000_000)).toBe(-2);
    expect(toBaseMinor(-1, 2_000_000)).toBe(0);
  });

  it('refunds/negatives are symmetric', () => {
    expect(toBaseMinor(-500_00, RATE)).toBe(-toBaseMinor(500_00, RATE));
  });

  it('stays exact for large amounts (BigInt path)', () => {
    expect(toBaseMinor(9_000_000_000_000_00, 1_000_000)).toBe(9_000_000_000_000_00);
  });

  it('rejects non-integer amounts and invalid rates', () => {
    expect(() => toBaseMinor(1.5, RATE)).toThrow(MoneyError);
    expect(() => toBaseMinor(100, 0)).toThrow(MoneyError);
    expect(() => fromBaseMinor(100, 1.5)).toThrow(MoneyError);
  });

  it('detects overflow', () => {
    expect(() => fromBaseMinor(Number.MAX_SAFE_INTEGER, 2_000_000)).toThrow(/overflows/);
  });
});

describe('resolveBaseMinor', () => {
  it('base currency passes through', () => {
    expect(resolveBaseMinor({ amountMinor: 1234, currency: 'USD' })).toBe(1234);
  });

  it('foreign currency converts with its stored rate', () => {
    expect(
      resolveBaseMinor({ amountMinor: 12_153_00, currency: 'BDT', fxRateMicro: 121_530_000 }),
    ).toBe(100_00);
  });

  it('foreign currency without a rate is rejected', () => {
    expect(() => resolveBaseMinor({ amountMinor: 100, currency: 'BDT' })).toThrow(
      /fxRateMicro is required/,
    );
    expect(() =>
      resolveBaseMinor({ amountMinor: 100, currency: 'BDT', fxRateMicro: null }),
    ).toThrow(MoneyError);
  });
});

describe('sumMinor', () => {
  it('sums integers, including negatives', () => {
    expect(sumMinor([100, -30, 5])).toBe(75);
    expect(sumMinor([])).toBe(0);
  });

  it('rejects floats and overflow', () => {
    expect(() => sumMinor([1, 0.5])).toThrow(MoneyError);
    expect(() => sumMinor([Number.MAX_SAFE_INTEGER, 1])).toThrow(/overflows/);
  });
});

describe('percentOfMinor / zakat', () => {
  it('2.5% with half-even rounding', () => {
    expect(percentOfMinor(100_00, 250)).toBe(250);
    expect(percentOfMinor(1_00, 250)).toBe(2); // 2.5 → 2
    expect(percentOfMinor(3_00, 250)).toBe(8); // 7.5 → 8
  });

  it('zakat is due only at or above nisab', () => {
    expect(zakatDueMinor(599_99, 600_00)).toBe(0);
    expect(zakatDueMinor(600_00, 600_00)).toBe(15_00);
    expect(zakatDueMinor(-10_00, 0)).toBe(0);
    expect(zakatDueMinor(1_000_000_00, 600_00)).toBe(25_000_00);
  });

  it('rejects fractional basis points', () => {
    expect(() => percentOfMinor(100, 2.5)).toThrow(MoneyError);
  });
});

describe('display', () => {
  it('minorToDecimalString is exact', () => {
    expect(minorToDecimalString(0)).toBe('0.00');
    expect(minorToDecimalString(5)).toBe('0.05');
    expect(minorToDecimalString(-5)).toBe('-0.05');
    expect(minorToDecimalString(123_456)).toBe('1234.56');
    expect(minorToDecimalString(Number.MAX_SAFE_INTEGER)).toBe('90071992547409.91');
  });

  it('formatMinor uses Intl currency formatting without float loss', () => {
    expect(formatMinor(123_456, 'USD')).toBe('$1,234.56');
    expect(formatMinor(-5, 'USD')).toBe('-$0.05');
    expect(formatMinor(Number.MAX_SAFE_INTEGER, 'USD')).toBe('$90,071,992,547,409.91');
    expect(formatMinor(1_234_567_89, 'BDT', 'en-IN')).toContain('12,34,567.89');
  });

  it('isCurrency', () => {
    expect(isCurrency('USD')).toBe(true);
    expect(isCurrency('BDT')).toBe(true);
    expect(isCurrency('EUR')).toBe(false);
    expect(isCurrency('toString')).toBe(false);
  });
});
