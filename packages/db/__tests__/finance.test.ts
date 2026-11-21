import { describe, expect, it } from 'vitest';
import {
  addEntry,
  createVault,
  deleteEntry,
  depositToVault,
  FinanceError,
  getFxRate,
  getMonthlyBudget,
  getZakatProfile,
  listTransactions,
  listVaults,
  saveZakatProfile,
  setFxRate,
  setMonthlyBudget,
  withdrawFromVault,
} from '../src/repos/finance';
import { freshEnv } from './fixtures';

const P = 'p1';
const D = '2026-11-21';
const RATE = 121_530_000;

async function withIncome(amountMinor = 50_000_00, currency: 'BDT' | 'USD' = 'BDT') {
  const env = freshEnv();
  await addEntry(env.db, {
    profileId: P,
    type: 'income',
    amountMinor,
    currency,
    fxRateMicro: RATE,
    date: D,
    description: 'Salary',
  });
  return env;
}

const codeOf = async (p: Promise<unknown>) => {
  try {
    await p;
    return 'ok';
  } catch (e) {
    return e instanceof FinanceError ? e.code : String(e);
  }
};

describe('ledger entries', () => {
  it('stores the typed currency exactly with rate and USD base', async () => {
    const { db } = await withIncome();
    const tx = await addEntry(db, {
      profileId: P,
      type: 'expense',
      amountMinor: 1_250_50,
      currency: 'BDT',
      fxRateMicro: RATE,
      date: D,
      categoryId: 'bazar',
      description: '  Fish  ',
    });
    expect(tx).toMatchObject({
      amountMinor: 1_250_50,
      currency: 'BDT',
      fxRateMicro: RATE,
      baseMinor: 1029,
      description: 'Fish',
    });
    expect((await listTransactions(db, P)).map((t) => t.type)).toEqual(['expense', 'income']);
  });

  it('USD entries need no rate and store baseMinor = amountMinor', async () => {
    const { db } = freshEnv();
    const tx = await addEntry(db, {
      profileId: P,
      type: 'income',
      amountMinor: 999,
      currency: 'USD',
      fxRateMicro: null,
      date: D,
    });
    expect(tx).toMatchObject({ fxRateMicro: null, baseMinor: 999 });
  });

  it('BDT-only users need no rate: baseMinor stays null and BDT vaults work', async () => {
    const { db } = freshEnv();
    const tx = await addEntry(db, {
      profileId: P,
      type: 'income',
      amountMinor: 1_000_00,
      currency: 'BDT',
      fxRateMicro: null,
      date: D,
    });
    expect(tx).toMatchObject({ fxRateMicro: null, baseMinor: null, amountMinor: 1_000_00 });
    const v = await createVault(db, {
      profileId: P,
      name: 'Eid',
      targetMinor: 500_00,
      currency: 'BDT',
    });
    await depositToVault(db, {
      profileId: P,
      vaultId: v.id,
      amountMinor: 200_00,
      currency: 'BDT',
      fxRateMicro: null,
      date: D,
    });
    expect((await listVaults(db, P))[0]!.savedMinor).toBe(200_00);
  });

  it('mixed currencies without a rate are rejected for balance checks', async () => {
    const { db } = freshEnv();
    await addEntry(db, {
      profileId: P,
      type: 'income',
      amountMinor: 100_00,
      currency: 'USD',
      fxRateMicro: null,
      date: D,
    });
    const v = await createVault(db, {
      profileId: P,
      name: 'x',
      targetMinor: 500_00,
      currency: 'BDT',
    });
    expect(
      await codeOf(
        depositToVault(db, {
          profileId: P,
          vaultId: v.id,
          amountMinor: 1_00,
          currency: 'BDT',
          fxRateMicro: null,
          date: D,
        }),
      ),
    ).toBe('rate_required');
  });

  it.each([
    [{ amountMinor: 0 }, /positive integer/],
    [{ amountMinor: 1.5 }, /positive integer/],
    [{ amountMinor: -5 }, /positive integer/],
    [{ amountMinor: 1_000_000_000_001 }, /positive integer/],
    [{ currency: 'EUR' }, /Unsupported currency/],
    [{ date: '2026-02-30' }, /Invalid date/],
    [{ categoryId: 'bad id!' }, /Invalid category/],
  ])('rejects %o', async (override, message) => {
    const { db } = freshEnv();
    const input = {
      profileId: P,
      type: 'expense' as const,
      amountMinor: 100,
      currency: 'USD' as const,
      fxRateMicro: null,
      date: D,
      ...override,
    };
    await expect(addEntry(db, input as never)).rejects.toThrow(message);
    expect(await db.transactions.count()).toBe(0);
  });

  it('deleting tombstones the entry; vault movements cannot be deleted', async () => {
    const { db } = await withIncome();
    const [income] = await listTransactions(db, P);
    await deleteEntry(db, P, income!.id);
    expect(await listTransactions(db, P)).toEqual([]);
    expect((await db.transactions.get(income!.id))?.deletedAt).not.toBeNull();
    expect(await codeOf(deleteEntry(db, P, income!.id))).toBe('not_found');
    expect(await codeOf(deleteEntry(db, 'someone-else', 'x'))).toBe('not_found');
  });
});

describe('vaults', () => {
  it('deposit moves cash into the vault atomically', async () => {
    const { db } = await withIncome(10_000_00);
    const v = await createVault(db, {
      profileId: P,
      name: 'Hajj',
      targetMinor: 500_000_00,
      currency: 'BDT',
    });
    await depositToVault(db, {
      profileId: P,
      vaultId: v.id,
      amountMinor: 4_000_00,
      currency: 'BDT',
      fxRateMicro: RATE,
      date: D,
    });
    const [vault] = await listVaults(db, P);
    expect(vault!.savedMinor).toBe(4_000_00);
    const transfer = (await listTransactions(db, P)).find((t) => t.type === 'transfer');
    expect(transfer).toMatchObject({ amountMinor: 4_000_00, vaultId: v.id, description: 'Hajj' });
  });

  it('rejects deposits beyond available cash or the remaining target, writing nothing', async () => {
    const { db } = await withIncome(1_000_00);
    const v = await createVault(db, {
      profileId: P,
      name: 'Laptop',
      targetMinor: 800_00,
      currency: 'BDT',
    });
    const move = (amountMinor: number) => ({
      profileId: P,
      vaultId: v.id,
      amountMinor,
      currency: 'BDT' as const,
      fxRateMicro: RATE,
      date: D,
    });
    expect(await codeOf(depositToVault(db, move(1_000_01)))).toBe('insufficient_cash');
    expect(await codeOf(depositToVault(db, move(800_01)))).toBe('exceeds_target');
    expect(await codeOf(depositToVault(db, move(800_00)))).toBe('ok');
    expect(await codeOf(depositToVault(db, move(1)))).toBe('exceeds_target');
    expect((await listVaults(db, P))[0]!.savedMinor).toBe(800_00);
    expect(await db.transactions.count()).toBe(2);
  });

  it('concurrent deposits cannot overdraw cash', async () => {
    const { db } = await withIncome(1_000_00);
    const v = await createVault(db, {
      profileId: P,
      name: 'A',
      targetMinor: 10_000_00,
      currency: 'BDT',
    });
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        codeOf(
          depositToVault(db, {
            profileId: P,
            vaultId: v.id,
            amountMinor: 300_00,
            currency: 'BDT',
            fxRateMicro: RATE,
            date: D,
          }),
        ),
      ),
    );
    expect(results.filter((r) => r === 'ok')).toHaveLength(3);
    expect((await listVaults(db, P))[0]!.savedMinor).toBe(900_00);
  });

  it('withdrawals return cash and cannot exceed the vault balance', async () => {
    const { db } = await withIncome(1_000_00);
    const v = await createVault(db, {
      profileId: P,
      name: 'A',
      targetMinor: 1_000_00,
      currency: 'BDT',
    });
    const move = (amountMinor: number) => ({
      profileId: P,
      vaultId: v.id,
      amountMinor,
      currency: 'BDT' as const,
      fxRateMicro: RATE,
      date: D,
    });
    await depositToVault(db, move(600_00));
    expect(await codeOf(withdrawFromVault(db, move(600_01)))).toBe('insufficient_vault');
    await withdrawFromVault(db, move(250_00));
    expect((await listVaults(db, P))[0]!.savedMinor).toBe(350_00);
    // cash: 1000 - 600 + 250 = 650 → a 650.01 deposit must fail
    expect(await codeOf(depositToVault(db, move(650_01)))).toBe('insufficient_cash');
  });

  it('converts between display currency and a legacy USD vault', async () => {
    const { db } = await withIncome(100_000_00);
    const v = await createVault(db, {
      profileId: P,
      name: 'Imported',
      targetMinor: 1_000_00,
      currency: 'USD',
    });
    await depositToVault(db, {
      profileId: P,
      vaultId: v.id,
      amountMinor: 12_153_00,
      currency: 'BDT',
      fxRateMicro: RATE,
      date: D,
    });
    expect((await listVaults(db, P))[0]!.savedMinor).toBe(100_00);
    expect(
      await codeOf(
        depositToVault(db, {
          profileId: P,
          vaultId: v.id,
          amountMinor: 1_00,
          currency: 'BDT',
          fxRateMicro: null,
          date: D,
        }),
      ),
    ).toBe('rate_required');
  });

  it('validates vault creation and ownership', async () => {
    const { db } = freshEnv();
    await expect(
      createVault(db, { profileId: P, name: ' ', targetMinor: 1, currency: 'USD' }),
    ).rejects.toThrow(/name/);
    await expect(
      createVault(db, { profileId: P, name: 'x', targetMinor: 0, currency: 'USD' }),
    ).rejects.toThrow(/target/);
    const v = await createVault(db, { profileId: P, name: 'x', targetMinor: 10, currency: 'USD' });
    expect(
      await codeOf(
        withdrawFromVault(db, {
          profileId: 'other',
          vaultId: v.id,
          amountMinor: 1,
          currency: 'USD',
          fxRateMicro: null,
          date: D,
        }),
      ),
    ).toBe('not_found');
  });
});

describe('exchange rate, budget and zakat', () => {
  it('stores a bounded manual rate', async () => {
    const { db } = freshEnv();
    expect(await getFxRate(db)).toBeNull();
    await setFxRate(db, RATE, 5);
    expect(await getFxRate(db)).toEqual({ rateMicro: RATE, at: 5, source: 'manual' });
    await setFxRate(db, 122_000_000, 6);
    expect((await getFxRate(db))?.rateMicro).toBe(122_000_000);
    expect(await db.kv.count()).toBe(1);
    await expect(setFxRate(db, 0)).rejects.toThrow(FinanceError);
    await expect(setFxRate(db, 2_000_000_000)).rejects.toThrow(FinanceError);
  });

  it('monthly budget round-trips per profile', async () => {
    const { db } = freshEnv();
    expect(await getMonthlyBudget(db, P)).toBeNull();
    await setMonthlyBudget(db, P, { amountMinor: 30_000_00, currency: 'BDT' });
    expect(await getMonthlyBudget(db, P)).toEqual({ amountMinor: 30_000_00, currency: 'BDT' });
    expect(await getMonthlyBudget(db, 'other')).toBeNull();
    await expect(setMonthlyBudget(db, P, { amountMinor: 0, currency: 'BDT' })).rejects.toThrow(
      FinanceError,
    );
  });

  it('zakat profile upserts and validates', async () => {
    const { db } = freshEnv();
    const fields = {
      currency: 'BDT' as const,
      nisabMinor: 70_000_00,
      cashMinor: 1,
      goldMinor: 2,
      silverMinor: 3,
      businessMinor: 4,
      stocksMinor: 5,
      liabilitiesMinor: 6,
    };
    await saveZakatProfile(db, P, fields);
    await saveZakatProfile(db, P, { ...fields, cashMinor: 100 });
    expect(await getZakatProfile(db, P)).toMatchObject({ cashMinor: 100, liabilitiesMinor: 6 });
    expect(await db.zakatProfiles.count()).toBe(1);
    await expect(saveZakatProfile(db, P, { ...fields, goldMinor: -1 })).rejects.toThrow(
      /goldMinor/,
    );
    await expect(saveZakatProfile(db, P, { ...fields, cashMinor: 0.5 })).rejects.toThrow(
      /cashMinor/,
    );
  });
});
