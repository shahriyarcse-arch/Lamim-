/**
 * Finance repository — integer minor units only.
 *
 * New entries are recorded in the currency the user typed (`amountMinor`,
 * `currency`), with `fxRateMicro` and `baseMinor` (USD cents) for cross-currency
 * totals and sync. Vault deposits/withdrawals are ledger rows plus a vault balance
 * update in ONE transaction, with balance checks evaluated inside it so two tabs
 * cannot overdraw.
 */
import {
  BASE_CURRENCY,
  convertMinor,
  isCurrency,
  isDateStr,
  resolveBaseMinor,
  summarizeLedger,
  type Currency,
  type DateStr,
  type FxRateMicro,
  type Minor,
} from '@lamim/core';
import { z } from 'zod';
import {
  GLOBAL_PROFILE_ID,
  type KvEntry,
  type LamimDB,
  type Transaction,
  type Vault,
  type ZakatProfile,
} from '../schema';
import { uuidv7 } from '../uuid';
import { enqueueSync, nextUpdatedAt } from './common';

export class FinanceError extends Error {
  override name = 'FinanceError';
  constructor(
    message: string,
    /** Stable code for UI messages. */
    readonly code:
      | 'invalid'
      | 'insufficient_cash'
      | 'exceeds_target'
      | 'insufficient_vault'
      | 'rate_required'
      | 'not_found' = 'invalid',
  ) {
    super(message);
  }
}

/** ৳/$ 10 billion — far above any personal ledger entry, well inside safe integers. */
const MAX_AMOUNT_MINOR = 1_000_000_000_000;
const CATEGORY_ID = /^[a-z0-9_-]{1,40}$/i;

function assertAmount(amountMinor: number, label = 'amount'): void {
  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0 || amountMinor > MAX_AMOUNT_MINOR) {
    throw new FinanceError(`${label} must be a positive integer of minor units`);
  }
}

function assertCurrency(c: unknown): asserts c is Currency {
  if (!isCurrency(c)) throw new FinanceError(`Unsupported currency: ${String(c)}`);
}

// ---- Exchange rate (global, USD→BDT) -----------------------------------------------

export interface FxRate {
  rateMicro: FxRateMicro;
  at: number;
  source: string;
}

const FxSchema = z.object({
  rateMicro: z.number().int().positive(),
  at: z.number(),
  source: z.string(),
});

const FX_KEY = 'fx.USD_BDT';

export async function getFxRate(db: LamimDB): Promise<FxRate | null> {
  const row = await db.kv.where('[profileId+key]').equals([GLOBAL_PROFILE_ID, FX_KEY]).first();
  const parsed = row && row.deletedAt === null ? FxSchema.safeParse(row.value) : null;
  return parsed?.success ? parsed.data : null;
}

async function putKv(
  db: LamimDB,
  profileId: string,
  key: string,
  value: unknown,
  now: number,
): Promise<void> {
  const existing = await db.kv.where('[profileId+key]').equals([profileId, key]).first();
  if (existing) {
    await db.kv.update(existing.id, {
      value,
      deletedAt: null,
      updatedAt: nextUpdatedAt(existing.updatedAt, now),
    });
    await enqueueSync(db, 'kv', existing.id, 'put', now);
  } else {
    const row: KvEntry = {
      id: uuidv7(now),
      profileId,
      key,
      value,
      updatedAt: now,
      deletedAt: null,
    };
    await db.kv.add(row);
    await enqueueSync(db, 'kv', row.id, 'put', now);
  }
}

/** Manual rate (e.g. 1 USD = 121.53 BDT → 121_530_000). Bounded to plausible values. */
export async function setFxRate(
  db: LamimDB,
  rateMicro: FxRateMicro,
  now = Date.now(),
): Promise<void> {
  if (!Number.isSafeInteger(rateMicro) || rateMicro < 1_000_000 || rateMicro > 1_000_000_000) {
    throw new FinanceError('Exchange rate must be between 1 and 1000');
  }
  await db.transaction('rw', db.kv, db.syncQueue, () =>
    putKv(db, GLOBAL_PROFILE_ID, FX_KEY, { rateMicro, at: now, source: 'manual' }, now),
  );
}

// ---- Ledger ---------------------------------------------------------------------------

async function liveTransactions(db: LamimDB, profileId: string): Promise<Transaction[]> {
  return (
    await db.transactions
      .where('[profileId+date]')
      .between([profileId, ''], [profileId, '￿'])
      .toArray()
  ).filter((t) => t.deletedAt === null);
}

export async function listTransactions(db: LamimDB, profileId: string): Promise<Transaction[]> {
  return (await liveTransactions(db, profileId)).sort(
    (a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt,
  );
}

/** Available cash in `currency`; throws `rate_required` if mixed data cannot be converted. */
async function availableCash(
  db: LamimDB,
  profileId: string,
  currency: Currency,
  fxRateMicro: FxRateMicro | null,
): Promise<Minor> {
  const s = summarizeLedger(await liveTransactions(db, profileId), currency, fxRateMicro, '');
  if (s.needsRate) throw new FinanceError('Set an exchange rate first', 'rate_required');
  return s.balanceMinor;
}

function buildTx(
  input: {
    profileId: string;
    type: Transaction['type'];
    amountMinor: Minor;
    currency: Currency;
    fxRateMicro: FxRateMicro | null;
    date: DateStr;
    categoryId?: string | null;
    description?: string;
    vaultId?: string | null;
  },
  now: number,
): Transaction {
  // Single-currency users never need a rate: baseMinor stays null until one is known.
  const fxRateMicro = input.currency === BASE_CURRENCY ? null : input.fxRateMicro;
  return {
    id: uuidv7(now),
    profileId: input.profileId,
    type: input.type,
    amountMinor: input.amountMinor,
    currency: input.currency,
    fxRateMicro,
    baseMinor:
      input.currency === BASE_CURRENCY || fxRateMicro !== null
        ? resolveBaseMinor({
            amountMinor: input.amountMinor,
            currency: input.currency,
            fxRateMicro,
          })
        : null,
    categoryId: input.categoryId ?? null,
    description: (input.description ?? '').trim().slice(0, 120),
    date: input.date,
    vaultId: input.vaultId ?? null,
    updatedAt: now,
    deletedAt: null,
  };
}

export interface AddEntryInput {
  profileId: string;
  type: 'income' | 'expense';
  amountMinor: Minor;
  currency: Currency;
  fxRateMicro: FxRateMicro | null;
  date: DateStr;
  categoryId?: string | null;
  description?: string;
  now?: number;
}

/** Income or expense. Expenses may take the balance negative (credit, spending before logging income). */
export async function addEntry(db: LamimDB, input: AddEntryInput): Promise<Transaction> {
  if (!input.profileId) throw new FinanceError('profileId is required');
  if (input.type !== 'income' && input.type !== 'expense')
    throw new FinanceError('Invalid entry type');
  assertAmount(input.amountMinor);
  assertCurrency(input.currency);
  if (!isDateStr(input.date)) throw new FinanceError(`Invalid date: ${input.date}`);
  if (input.type === 'expense' && input.categoryId != null && !CATEGORY_ID.test(input.categoryId)) {
    throw new FinanceError('Invalid category');
  }
  const now = input.now ?? Date.now();
  const tx = buildTx(
    { ...input, categoryId: input.type === 'expense' ? (input.categoryId ?? null) : null },
    now,
  );
  await db.transaction('rw', db.transactions, db.syncQueue, async () => {
    await db.transactions.add(tx);
    await enqueueSync(db, 'transactions', tx.id, 'put', now);
  });
  return tx;
}

/** Tombstones an income/expense. Vault movements are reversed by the opposite vault action instead. */
export async function deleteEntry(
  db: LamimDB,
  profileId: string,
  id: string,
  now = Date.now(),
): Promise<void> {
  await db.transaction('rw', db.transactions, db.syncQueue, async () => {
    const tx = await db.transactions.get(id);
    if (!tx || tx.profileId !== profileId || tx.deletedAt !== null)
      throw new FinanceError('Entry not found', 'not_found');
    if (tx.type === 'transfer' || tx.type === 'withdrawal') {
      throw new FinanceError('Vault movements are reversed with a deposit or withdrawal');
    }
    const updatedAt = nextUpdatedAt(tx.updatedAt, now);
    await db.transactions.update(id, { deletedAt: updatedAt, updatedAt });
    await enqueueSync(db, 'transactions', id, 'delete', now);
  });
}

// ---- Vaults -----------------------------------------------------------------------------

export async function listVaults(db: LamimDB, profileId: string): Promise<Vault[]> {
  return (await db.vaults.where('profileId').equals(profileId).toArray())
    .filter((v) => v.deletedAt === null)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function createVault(
  db: LamimDB,
  input: { profileId: string; name: string; targetMinor: Minor; currency: Currency; now?: number },
): Promise<Vault> {
  const name = input.name.trim();
  if (!input.profileId) throw new FinanceError('profileId is required');
  if (!name || name.length > 60) throw new FinanceError('Vault name must be 1–60 characters');
  assertAmount(input.targetMinor, 'target');
  assertCurrency(input.currency);
  const now = input.now ?? Date.now();
  const vault: Vault = {
    id: uuidv7(now),
    profileId: input.profileId,
    name,
    targetMinor: input.targetMinor,
    savedMinor: 0,
    currency: input.currency,
    updatedAt: now,
    deletedAt: null,
  };
  await db.transaction('rw', db.vaults, db.syncQueue, async () => {
    await db.vaults.add(vault);
    await enqueueSync(db, 'vaults', vault.id, 'put', now);
  });
  return vault;
}

export interface VaultMoveInput {
  profileId: string;
  vaultId: string;
  /** Amount in `currency` (the user's display currency). */
  amountMinor: Minor;
  currency: Currency;
  fxRateMicro: FxRateMicro | null;
  date: DateStr;
  now?: number;
}

function convertOrThrow(
  amount: Minor,
  from: Currency,
  to: Currency,
  rate: FxRateMicro | null,
): Minor {
  if (from !== to && rate == null)
    throw new FinanceError('Set an exchange rate first', 'rate_required');
  return convertMinor(amount, from, to, rate);
}

async function moveVault(
  db: LamimDB,
  input: VaultMoveInput,
  direction: 'deposit' | 'withdraw',
): Promise<void> {
  assertAmount(input.amountMinor);
  assertCurrency(input.currency);
  if (!isDateStr(input.date)) throw new FinanceError(`Invalid date: ${input.date}`);
  const now = input.now ?? Date.now();

  await db.transaction('rw', db.vaults, db.transactions, db.syncQueue, async () => {
    const vault = await db.vaults.get(input.vaultId);
    if (!vault || vault.profileId !== input.profileId || vault.deletedAt !== null) {
      throw new FinanceError('Vault not found', 'not_found');
    }
    const inVaultCurrency = convertOrThrow(
      input.amountMinor,
      input.currency,
      vault.currency,
      input.fxRateMicro,
    );
    if (inVaultCurrency <= 0) throw new FinanceError('Amount is too small to convert');

    if (direction === 'deposit') {
      const cash = await availableCash(db, input.profileId, input.currency, input.fxRateMicro);
      if (input.amountMinor > cash)
        throw new FinanceError('Not enough available cash', 'insufficient_cash');
      if (inVaultCurrency > vault.targetMinor - vault.savedMinor) {
        throw new FinanceError('Deposit would exceed the vault target', 'exceeds_target');
      }
    } else if (inVaultCurrency > vault.savedMinor) {
      throw new FinanceError('Not enough saved in this vault', 'insufficient_vault');
    }

    const savedMinor =
      vault.savedMinor + (direction === 'deposit' ? inVaultCurrency : -inVaultCurrency);
    await db.vaults.update(vault.id, {
      savedMinor,
      updatedAt: nextUpdatedAt(vault.updatedAt, now),
    });
    await enqueueSync(db, 'vaults', vault.id, 'put', now);

    const tx = buildTx(
      {
        profileId: input.profileId,
        type: direction === 'deposit' ? 'transfer' : 'withdrawal',
        amountMinor: input.amountMinor,
        currency: input.currency,
        fxRateMicro: input.fxRateMicro,
        date: input.date,
        description: vault.name,
        vaultId: vault.id,
      },
      now,
    );
    await db.transactions.add(tx);
    await enqueueSync(db, 'transactions', tx.id, 'put', now);
  });
}

export const depositToVault = (db: LamimDB, input: VaultMoveInput) =>
  moveVault(db, input, 'deposit');
export const withdrawFromVault = (db: LamimDB, input: VaultMoveInput) =>
  moveVault(db, input, 'withdraw');

// ---- Budget -----------------------------------------------------------------------------

export interface MonthlyBudget {
  amountMinor: Minor;
  currency: Currency;
}

const BudgetSchema = z.object({
  amountMinor: z.number().int().positive(),
  currency: z.string().refine(isCurrency),
});

export async function getMonthlyBudget(
  db: LamimDB,
  profileId: string,
): Promise<MonthlyBudget | null> {
  const row = await db.kv
    .where('[profileId+key]')
    .equals([profileId, 'finance.monthlyBudget'])
    .first();
  const parsed = row && row.deletedAt === null ? BudgetSchema.safeParse(row.value) : null;
  return parsed?.success
    ? { amountMinor: parsed.data.amountMinor, currency: parsed.data.currency as Currency }
    : null;
}

export async function setMonthlyBudget(
  db: LamimDB,
  profileId: string,
  budget: MonthlyBudget,
  now = Date.now(),
): Promise<void> {
  assertAmount(budget.amountMinor, 'budget');
  assertCurrency(budget.currency);
  await db.transaction('rw', db.kv, db.syncQueue, () =>
    putKv(db, profileId, 'finance.monthlyBudget', budget, now),
  );
}

// ---- Zakat --------------------------------------------------------------------------------

export type ZakatFields = Pick<
  ZakatProfile,
  | 'currency'
  | 'nisabMinor'
  | 'cashMinor'
  | 'goldMinor'
  | 'silverMinor'
  | 'businessMinor'
  | 'stocksMinor'
> & { liabilitiesMinor: Minor };

export async function getZakatProfile(
  db: LamimDB,
  profileId: string,
): Promise<ZakatProfile | undefined> {
  const row = await db.zakatProfiles.where('profileId').equals(profileId).first();
  return row && row.deletedAt === null ? row : undefined;
}

export async function saveZakatProfile(
  db: LamimDB,
  profileId: string,
  fields: ZakatFields,
  now = Date.now(),
): Promise<void> {
  assertCurrency(fields.currency);
  for (const key of [
    'nisabMinor',
    'cashMinor',
    'goldMinor',
    'silverMinor',
    'businessMinor',
    'stocksMinor',
    'liabilitiesMinor',
  ] as const) {
    const v = fields[key];
    if (!Number.isSafeInteger(v) || v < 0 || v > MAX_AMOUNT_MINOR)
      throw new FinanceError(`Invalid ${key}`);
  }
  await db.transaction('rw', db.zakatProfiles, db.syncQueue, async () => {
    const existing = await getZakatProfile(db, profileId);
    if (existing) {
      await db.zakatProfiles.update(existing.id, {
        ...fields,
        updatedAt: nextUpdatedAt(existing.updatedAt, now),
      });
      await enqueueSync(db, 'zakatProfiles', existing.id, 'put', now);
    } else {
      const row: ZakatProfile = {
        id: uuidv7(now),
        profileId,
        ...fields,
        updatedAt: now,
        deletedAt: null,
      };
      await db.zakatProfiles.add(row);
      await enqueueSync(db, 'zakatProfiles', row.id, 'put', now);
    }
  });
}
