/**
 * Integer money — every amount is an integer count of minor units (cents/paisa).
 * No floating-point arithmetic ever touches a stored amount.
 *
 * Exchange rates are stored as `fxRateMicro` = rate × 10⁶ (an integer), expressed
 * as "1 BASE = rate QUOTE" (e.g. 1 USD = 121.53 BDT → 121_530_000).
 * `baseMinor` is the amount in the base currency (USD cents), the unit totals use.
 *
 * Conversion and percentage math run in BigInt and round half-to-even (banker's
 * rounding) so aggregated conversions carry no systematic bias.
 */

export const CURRENCIES = {
  USD: { exponent: 2, symbol: '$' },
  BDT: { exponent: 2, symbol: '৳' },
} as const;

export type Currency = keyof typeof CURRENCIES;
export const BASE_CURRENCY: Currency = 'USD';

/** Integer number of minor units (cents/paisa). */
export type Minor = number;
/** Exchange rate × 10⁶ as an integer. */
export type FxRateMicro = number;

export const FX_MICRO = 1_000_000;

export class MoneyError extends Error {
  override name = 'MoneyError';
}

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && Object.hasOwn(CURRENCIES, value);
}

export function assertMinor(value: number, label = 'amount'): asserts value is Minor {
  if (!Number.isSafeInteger(value)) {
    throw new MoneyError(`${label} must be a safe integer of minor units, got ${value}`);
  }
}

function assertRate(rate: number): asserts rate is FxRateMicro {
  if (!Number.isSafeInteger(rate) || rate <= 0) {
    throw new MoneyError(`fxRateMicro must be a positive safe integer, got ${rate}`);
  }
}

function toSafeNumber(value: bigint, label: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new MoneyError(`${label} overflows the safe integer range`);
  }
  return Number(value);
}

/** numerator / denominator rounded half-to-even. Denominator must be positive. */
function divRoundHalfEven(numerator: bigint, denominator: bigint): bigint {
  const negative = numerator < 0n;
  const abs = negative ? -numerator : numerator;
  let q = abs / denominator;
  const r = abs % denominator;
  const twice = r * 2n;
  if (twice > denominator || (twice === denominator && q % 2n === 1n)) q += 1n;
  return negative ? -q : q;
}

const DECIMAL_RE = /^([+-])?(\d+)(?:\.(\d+))?$/;

/**
 * Parse user-entered decimal text into a scaled integer exactly (no float step).
 * Rejects more fractional digits than `scale` allows rather than silently rounding.
 */
function parseScaled(text: string, scale: number, label: string): number {
  const m = DECIMAL_RE.exec(text.trim().replace(/,/g, ''));
  if (!m) throw new MoneyError(`Invalid ${label}: "${text}"`);
  const [, sign, whole = '0', frac = ''] = m;
  if (frac.length > scale) {
    throw new MoneyError(`${label} "${text}" has more than ${scale} decimal places`);
  }
  const digits = BigInt(whole + frac.padEnd(scale, '0'));
  return toSafeNumber(sign === '-' ? -digits : digits, label);
}

/** "12.34" → 1234. Throws on invalid input or sub-minor precision. */
export function parseMinor(text: string, currency: Currency = BASE_CURRENCY): Minor {
  return parseScaled(text, CURRENCIES[currency].exponent, 'amount');
}

/** "121.53" → 121_530_000. */
export function parseFxRateMicro(text: string): FxRateMicro {
  const rate = parseScaled(text, 6, 'exchange rate');
  assertRate(rate);
  return rate;
}

/**
 * Convert a legacy float amount (e.g. 19.99) to minor units. Corrects binary
 * representation error first, so 1.005 → 101, not 100.
 */
export function fromLegacyFloat(value: number, currency: Currency = BASE_CURRENCY): Minor {
  if (!Number.isFinite(value)) throw new MoneyError(`Cannot convert non-finite amount: ${value}`);
  const factor = 10 ** CURRENCIES[currency].exponent;
  const minor = Math.round(Number((value * factor).toPrecision(15)));
  assertMinor(minor);
  return minor;
}

/** Legacy float rate (e.g. 121.53) → fxRateMicro. */
export function rateToMicro(rate: number): FxRateMicro {
  if (!Number.isFinite(rate) || rate <= 0) throw new MoneyError(`Invalid exchange rate: ${rate}`);
  const micro = Math.round(Number((rate * FX_MICRO).toPrecision(15)));
  assertRate(micro);
  return micro;
}

/** Quote-currency minor units → base-currency minor units (e.g. BDT paisa → USD cents). */
export function toBaseMinor(amountMinor: Minor, fxRateMicro: FxRateMicro): Minor {
  assertMinor(amountMinor);
  assertRate(fxRateMicro);
  return toSafeNumber(
    divRoundHalfEven(BigInt(amountMinor) * BigInt(FX_MICRO), BigInt(fxRateMicro)),
    'baseMinor',
  );
}

/** Base-currency minor units → quote-currency minor units (e.g. USD cents → BDT paisa). */
export function fromBaseMinor(baseMinor: Minor, fxRateMicro: FxRateMicro): Minor {
  assertMinor(baseMinor);
  assertRate(fxRateMicro);
  return toSafeNumber(
    divRoundHalfEven(BigInt(baseMinor) * BigInt(fxRateMicro), BigInt(FX_MICRO)),
    'amount',
  );
}

export interface MoneyEntry {
  readonly amountMinor: Minor;
  readonly currency: Currency;
  /** Required when `currency` differs from the base currency. */
  readonly fxRateMicro?: FxRateMicro | null;
}

/** Resolve an entry to base minor units, as stored in `transactions.baseMinor`. */
export function resolveBaseMinor(entry: MoneyEntry): Minor {
  if (entry.currency === BASE_CURRENCY) {
    assertMinor(entry.amountMinor);
    return entry.amountMinor;
  }
  if (entry.fxRateMicro == null) {
    throw new MoneyError(`fxRateMicro is required for ${entry.currency} amounts`);
  }
  return toBaseMinor(entry.amountMinor, entry.fxRateMicro);
}

/** Exact integer sum; throws instead of losing precision. */
export function sumMinor(values: Iterable<Minor>): Minor {
  let total = 0n;
  for (const v of values) {
    assertMinor(v);
    total += BigInt(v);
  }
  return toSafeNumber(total, 'sum');
}

/** `basisPoints` / 10 000 of an amount, half-to-even (Zakat 2.5% = 250 bp). */
export function percentOfMinor(amountMinor: Minor, basisPoints: number): Minor {
  assertMinor(amountMinor);
  if (!Number.isSafeInteger(basisPoints)) throw new MoneyError(`basisPoints must be an integer`);
  return toSafeNumber(
    divRoundHalfEven(BigInt(amountMinor) * BigInt(basisPoints), 10_000n),
    'percentage',
  );
}

export const ZAKAT_RATE_BP = 250;

/** Zakat due (2.5%) when wealth meets nisab; otherwise 0. */
export function zakatDueMinor(netWealthMinor: Minor, nisabMinor: Minor): Minor {
  assertMinor(nisabMinor, 'nisab');
  if (netWealthMinor < nisabMinor || netWealthMinor <= 0) return 0;
  return percentOfMinor(netWealthMinor, ZAKAT_RATE_BP);
}

/** Exact decimal string, e.g. 123456 → "1234.56", -5 → "-0.05". */
export function minorToDecimalString(
  amountMinor: Minor,
  currency: Currency = BASE_CURRENCY,
): string {
  assertMinor(amountMinor);
  const exp = CURRENCIES[currency].exponent;
  const negative = amountMinor < 0;
  const digits = String(Math.abs(amountMinor)).padStart(exp + 1, '0');
  const whole = digits.slice(0, digits.length - exp);
  const frac = digits.slice(digits.length - exp);
  return `${negative ? '-' : ''}${whole}${exp > 0 ? `.${frac}` : ''}`;
}

/** Locale-aware display. Passes an exact decimal string to Intl (no float division). */
export function formatMinor(
  amountMinor: Minor,
  currency: Currency,
  locale = 'en-US',
  options: Intl.NumberFormatOptions = {},
): string {
  const exp = CURRENCIES[currency].exponent;
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: exp,
    maximumFractionDigits: exp,
    ...options,
  });
  // ES2023 Intl.NumberFormat accepts decimal strings exactly; the cast covers older lib typings.
  return formatter.format(minorToDecimalString(amountMinor, currency) as unknown as number);
}
