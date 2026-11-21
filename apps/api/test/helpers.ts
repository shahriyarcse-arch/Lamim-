import { randomBytes } from 'node:crypto';
import type { RowEnvelope, SyncTable } from '@lamim/sync-protocol';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { createApp } from '../src/app';
import { type AppConfig, loadConfig } from '../src/config';

export const rid = (prefix = 'id') => `${prefix}_${randomBytes(8).toString('hex')}`;

/** A realistic client row (minus envelope fields) for every sync table. */
export function sampleData(table: SyncTable, n = 1): Record<string, unknown> {
  const date = `2026-11-${String(1 + (n % 28)).padStart(2, '0')}`;
  switch (table) {
    case 'profiles':
      return {
        name: `Profile ${n}`,
        gender: 'male',
        dob: '1995-04-12',
        createdAt: 1_700_000_000_000,
        legacyId: `p${n}`,
      };
    case 'settings':
      return {
        lang: 'bn',
        currency: 'BDT',
        lat: 23.8103,
        lng: 90.4125,
        locationName: 'Dhaka',
        method: 'Karachi',
        asr: 'hanafi',
        hijriOffset: -1,
        theme: 'system',
        extra: { legacyFlag: true },
      };
    case 'salahEntries':
      return { date, prayer: 'fajr', status: 'jamaat' };
    case 'salahDays':
      return {
        date,
        jummah: false,
        tahajjud: 'prayed',
        tahajjudRakat: 8,
        witr: 3,
        sunnah: { fajr: true },
        notes: { isha: 'late' },
        fasting: true,
      };
    case 'dhikrLogs':
      return { date, counts: { subhanallah: 33, alhamdulillah: 33 } };
    case 'gymLogs':
      return { date, data: { water: 2500, split: 'push' } };
    case 'careerLogs':
      return { date, data: { focusMinutes: 50 } };
    case 'habits':
      return {
        label: 'No sugar',
        icon: null,
        color: '#C25E5E',
        startDate: '2026-10-01T00:00:00.000Z',
        trackedSince: '2026-09-01T00:00:00.000Z',
      };
    case 'habitEvents':
      return {
        habitId: 'h1',
        date,
        type: 'relapse',
        at: '2026-11-02T10:00:00.000Z',
        reason: 'party',
        streak: 31,
      };
    case 'transactions':
      return {
        type: 'expense',
        amountMinor: 123_456 + n,
        currency: 'BDT',
        fxRateMicro: 121_530_000,
        baseMinor: 1_016,
        categoryId: 'food.groceries',
        description: `groceries ${n}`,
        date,
        vaultId: null,
      };
    case 'vaults':
      return { name: 'Hajj fund', targetMinor: 50_000_000, savedMinor: 1_250_000, currency: 'BDT' };
    case 'zakatProfiles':
      return {
        currency: 'BDT',
        nisabMinor: 7_500_000,
        cashMinor: 1,
        goldMinor: 2,
        silverMinor: 3,
        businessMinor: 4,
        stocksMinor: 5,
        liabilitiesMinor: 6,
      };
    case 'kv':
      return { key: `goal.${n}`, value: { target: 5, nested: [1, 'a', null] } };
  }
}

export function envelope(
  table: SyncTable,
  profileId: string,
  opts: Partial<Omit<RowEnvelope, 'table'>> & { n?: number } = {},
): RowEnvelope {
  const id = table === 'profiles' ? profileId : (opts.id ?? rid(table));
  return {
    table,
    id,
    profileId,
    updatedAt: opts.updatedAt ?? 1_000,
    deletedAt: opts.deletedAt ?? null,
    deviceId: opts.deviceId ?? 'devA',
    data: opts.data ?? sampleData(table, opts.n ?? 1),
  };
}

/** Config for an in-process app; DB-less callers pass a dummy URL (Prisma connects lazily). */
export function testConfig(overrides: Record<string, string> = {}): AppConfig {
  return loadConfig({
    DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://user:pass@127.0.0.1:1/none',
    JWT_SECRET: randomBytes(48).toString('base64url'),
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    CORS_ORIGINS: 'http://localhost:3000',
    RATE_LIMIT_AUTH_PER_MIN: '10000',
    RATE_LIMIT_SYNC_PER_MIN: '10000',
    RATE_LIMIT_GLOBAL_PER_MIN: '10000',
    RATE_LIMIT_EMAIL_PER_15MIN: '10000',
    ...overrides,
  });
}

export async function startApp(
  overrides: Record<string, string> = {},
): Promise<NestExpressApplication> {
  const app = await createApp(testConfig(overrides));
  await app.init();
  return app;
}
