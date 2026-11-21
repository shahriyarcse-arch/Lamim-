/**
 * Per-table wire ↔ database mapping for every SYNC table.
 *
 * `data` schemas validate the envelope's `data` (the client row minus id / profileId /
 * updatedAt / deletedAt) strictly: unknown keys, wrong types, non-integer money and
 * oversized strings are rejected — the client keeps unmodelled fields under `extra`.
 * `toColumns` / `fromColumns` are exact inverses so a pull returns the row the client pushed.
 */
import { CALCULATION_METHODS, CURRENCIES, PRAYER_NAMES, SALAH_STATUSES } from '@lamim/core';
import { SYNC_TABLES, type SyncTable } from '@lamim/sync-protocol';
import { z } from 'zod';
import { Prisma } from '../generated/prisma/client';

type Row = Record<string, unknown>;

const DateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');
const IsoTime = z.string().min(1).max(40);
const Key = z.string().max(200);
const Extra = z.record(Key, z.unknown());
const Int32 = z.int().min(-2_147_483_648).max(2_147_483_647);
/** Integer minor units (cents / paisa). z.int() also enforces the JS safe-integer range. */
const Minor = z.int();
const EpochMs = z.int().nonnegative();
const LocalId = z.string().min(1).max(64);
const enumOf = <T extends string>(values: readonly T[]) => z.enum(values as [T, ...T[]]);
const Currency = enumOf(Object.keys(CURRENCIES) as (keyof typeof CURRENCIES)[]);

/** Cap on a single kv document's JSON size (the whole row is separately capped at MAX_ROW_BYTES). */
export const MAX_KV_VALUE_BYTES = 32 * 1024;

export interface TableDef {
  table: SyncTable;
  /** Prisma model delegate name. */
  model: string;
  data: z.ZodType<Row>;
  /** Columns that, with (user_id, profile_id), form a unique natural key. undefined = none. */
  naturalKey?: readonly string[];
  toColumns(data: Row): Row;
  fromColumns(row: Row): Row;
}

// ---- helpers ------------------------------------------------------------------------

const big = (v: unknown): bigint => BigInt(v as number);
const bigOrNull = (v: unknown): bigint | null =>
  v === null || v === undefined ? null : BigInt(v as number);
const num = (v: unknown): number => Number(v as bigint);
const numOrNull = (v: unknown): number | null =>
  v === null || v === undefined ? null : Number(v as bigint);
/** Required JSON column: a JSON `null` value must be sent as Prisma.JsonNull. */
const json = (v: unknown): unknown => (v === null ? Prisma.JsonNull : v);

/** Copy `key` only when present (keeps optional client fields optional on the way back). */
function opt(target: Row, key: string, value: unknown): void {
  if (value !== undefined && value !== null) target[key] = value;
}

function withExtra(cols: Row, data: Row): Row {
  if (data.extra !== undefined) cols.extra = data.extra;
  return cols;
}

function extraOut(out: Row, row: Row): Row {
  opt(out, 'extra', row.extra);
  return out;
}

function dayDocument(table: SyncTable, model: string): TableDef {
  return {
    table,
    model,
    naturalKey: ['date'],
    data: z.strictObject({ date: DateStr, data: Extra }),
    toColumns: (d) => ({ date: d.date, data: d.data }),
    fromColumns: (r) => ({ date: r.date, data: r.data }),
  };
}

// ---- table definitions ------------------------------------------------------------------

const DEFS: TableDef[] = [
  {
    table: 'profiles',
    model: 'syncProfile',
    data: z.strictObject({
      legacyId: z.string().max(128).optional(),
      name: z.string().max(200),
      gender: z.string().max(32).nullable(),
      dob: DateStr.nullable(),
      createdAt: EpochMs,
      extra: Extra.optional(),
    }),
    toColumns: (d) =>
      withExtra(
        {
          legacyId: d.legacyId ?? null,
          name: d.name,
          gender: d.gender,
          dob: d.dob,
          clientCreatedAt: big(d.createdAt),
        },
        d,
      ),
    fromColumns: (r) => {
      const out: Row = {
        name: r.name,
        gender: r.gender,
        dob: r.dob,
        createdAt: num(r.clientCreatedAt),
      };
      opt(out, 'legacyId', r.legacyId);
      return extraOut(out, r);
    },
  },
  {
    table: 'settings',
    model: 'syncSettings',
    naturalKey: [],
    data: z.strictObject({
      lang: z.enum(['en', 'bn']),
      currency: Currency,
      lat: z.number().min(-90).max(90).nullable(),
      lng: z.number().min(-180).max(180).nullable(),
      locationName: z.string().max(200).nullable(),
      method: enumOf(Object.keys(CALCULATION_METHODS) as (keyof typeof CALCULATION_METHODS)[]),
      asr: z.enum(['hanafi', 'standard']),
      hijriOffset: z.int().min(-30).max(30),
      theme: z.enum(['light', 'dark', 'system']),
      extra: Extra.optional(),
    }),
    toColumns: (d) =>
      withExtra(
        {
          lang: d.lang,
          currency: d.currency,
          lat: d.lat,
          lng: d.lng,
          locationName: d.locationName,
          method: d.method,
          asr: d.asr,
          hijriOffset: d.hijriOffset,
          theme: d.theme,
        },
        d,
      ),
    fromColumns: (r) =>
      extraOut(
        {
          lang: r.lang,
          currency: r.currency,
          lat: r.lat,
          lng: r.lng,
          locationName: r.locationName,
          method: r.method,
          asr: r.asr,
          hijriOffset: r.hijriOffset,
          theme: r.theme,
        },
        r,
      ),
  },
  {
    table: 'salahEntries',
    model: 'syncSalahEntry',
    naturalKey: ['date', 'prayer'],
    data: z.strictObject({
      date: DateStr,
      prayer: enumOf(PRAYER_NAMES),
      status: enumOf(SALAH_STATUSES),
    }),
    toColumns: (d) => ({ date: d.date, prayer: d.prayer, status: d.status }),
    fromColumns: (r) => ({ date: r.date, prayer: r.prayer, status: r.status }),
  },
  {
    table: 'salahDays',
    model: 'syncSalahDay',
    naturalKey: ['date'],
    data: z.strictObject({
      date: DateStr,
      jummah: z.boolean(),
      tahajjud: z.union([z.boolean(), z.string().max(32)]),
      tahajjudRakat: z.int().min(-1).max(100),
      witr: z.union([z.number().finite(), z.boolean(), z.string().max(32)]),
      sunnah: Extra,
      notes: Extra,
      fasting: z.boolean().optional(),
      extra: Extra.optional(),
    }),
    toColumns: (d) =>
      withExtra(
        {
          date: d.date,
          jummah: d.jummah,
          tahajjud: d.tahajjud,
          tahajjudRakat: d.tahajjudRakat,
          witr: d.witr,
          sunnah: d.sunnah,
          notes: d.notes,
          fasting: d.fasting ?? null,
        },
        d,
      ),
    fromColumns: (r) => {
      const out: Row = {
        date: r.date,
        jummah: r.jummah,
        tahajjud: r.tahajjud,
        tahajjudRakat: r.tahajjudRakat,
        witr: r.witr,
        sunnah: r.sunnah,
        notes: r.notes,
      };
      opt(out, 'fasting', r.fasting);
      return extraOut(out, r);
    },
  },
  {
    table: 'dhikrLogs',
    model: 'syncDhikrLog',
    naturalKey: ['date'],
    data: z.strictObject({
      date: DateStr,
      counts: z.record(Key, z.number().finite().nonnegative()),
      extra: Extra.optional(),
    }),
    toColumns: (d) => withExtra({ date: d.date, counts: d.counts }, d),
    fromColumns: (r) => extraOut({ date: r.date, counts: r.counts }, r),
  },
  dayDocument('gymLogs', 'syncGymLog'),
  dayDocument('careerLogs', 'syncCareerLog'),
  {
    table: 'habits',
    model: 'syncHabit',
    data: z.strictObject({
      legacyId: z.string().max(128).optional(),
      label: z.string().max(200),
      icon: z.string().max(64).nullable(),
      color: z.string().max(64).nullable(),
      startDate: IsoTime,
      trackedSince: IsoTime.optional(),
      extra: Extra.optional(),
    }),
    toColumns: (d) =>
      withExtra(
        {
          legacyId: d.legacyId ?? null,
          label: d.label,
          icon: d.icon,
          color: d.color,
          startDate: d.startDate,
          trackedSince: d.trackedSince ?? null,
        },
        d,
      ),
    fromColumns: (r) => {
      const out: Row = { label: r.label, icon: r.icon, color: r.color, startDate: r.startDate };
      opt(out, 'legacyId', r.legacyId);
      opt(out, 'trackedSince', r.trackedSince);
      return extraOut(out, r);
    },
  },
  {
    table: 'habitEvents',
    model: 'syncHabitEvent',
    data: z.strictObject({
      habitId: LocalId,
      date: DateStr,
      type: z.enum(['relapse', 'clean']),
      at: IsoTime.nullable(),
      reason: z.string().max(1000).nullable(),
      streak: Int32.nullable(),
      extra: Extra.optional(),
    }),
    toColumns: (d) =>
      withExtra(
        {
          habitId: d.habitId,
          date: d.date,
          type: d.type,
          at: d.at,
          reason: d.reason,
          streak: d.streak,
        },
        d,
      ),
    fromColumns: (r) =>
      extraOut(
        {
          habitId: r.habitId,
          date: r.date,
          type: r.type,
          at: r.at,
          reason: r.reason,
          streak: r.streak,
        },
        r,
      ),
  },
  {
    table: 'transactions',
    model: 'syncTransaction',
    data: z.strictObject({
      legacyId: z.string().max(128).optional(),
      type: z.enum(['income', 'expense', 'transfer', 'withdrawal']),
      amountMinor: Minor,
      currency: Currency,
      fxRateMicro: Minor.positive().nullable(),
      baseMinor: Minor.nullable(),
      categoryId: z.string().max(128).nullable(),
      description: z.string().max(1000),
      date: DateStr,
      vaultId: LocalId.nullable(),
      extra: Extra.optional(),
    }),
    toColumns: (d) =>
      withExtra(
        {
          legacyId: d.legacyId ?? null,
          type: d.type,
          amountMinor: big(d.amountMinor),
          currency: d.currency,
          fxRateMicro: bigOrNull(d.fxRateMicro),
          baseMinor: bigOrNull(d.baseMinor),
          categoryId: d.categoryId,
          description: d.description,
          date: d.date,
          vaultId: d.vaultId,
        },
        d,
      ),
    fromColumns: (r) => {
      const out: Row = {
        type: r.type,
        amountMinor: num(r.amountMinor),
        currency: r.currency,
        fxRateMicro: numOrNull(r.fxRateMicro),
        baseMinor: numOrNull(r.baseMinor),
        categoryId: r.categoryId,
        description: r.description,
        date: r.date,
        vaultId: r.vaultId,
      };
      opt(out, 'legacyId', r.legacyId);
      return extraOut(out, r);
    },
  },
  {
    table: 'vaults',
    model: 'syncVault',
    data: z.strictObject({
      legacyId: z.string().max(128).optional(),
      name: z.string().max(200),
      targetMinor: Minor,
      savedMinor: Minor,
      currency: Currency,
      extra: Extra.optional(),
    }),
    toColumns: (d) =>
      withExtra(
        {
          legacyId: d.legacyId ?? null,
          name: d.name,
          targetMinor: big(d.targetMinor),
          savedMinor: big(d.savedMinor),
          currency: d.currency,
        },
        d,
      ),
    fromColumns: (r) => {
      const out: Row = {
        name: r.name,
        targetMinor: num(r.targetMinor),
        savedMinor: num(r.savedMinor),
        currency: r.currency,
      };
      opt(out, 'legacyId', r.legacyId);
      return extraOut(out, r);
    },
  },
  {
    table: 'zakatProfiles',
    model: 'syncZakatProfile',
    naturalKey: [],
    data: z.strictObject({
      currency: Currency,
      nisabMinor: Minor,
      cashMinor: Minor,
      goldMinor: Minor,
      silverMinor: Minor,
      businessMinor: Minor,
      stocksMinor: Minor,
      liabilitiesMinor: Minor.optional(),
      extra: Extra.optional(),
    }),
    toColumns: (d) =>
      withExtra(
        {
          currency: d.currency,
          nisabMinor: big(d.nisabMinor),
          cashMinor: big(d.cashMinor),
          goldMinor: big(d.goldMinor),
          silverMinor: big(d.silverMinor),
          businessMinor: big(d.businessMinor),
          stocksMinor: big(d.stocksMinor),
          liabilitiesMinor: bigOrNull(d.liabilitiesMinor),
        },
        d,
      ),
    fromColumns: (r) => {
      const out: Row = {
        currency: r.currency,
        nisabMinor: num(r.nisabMinor),
        cashMinor: num(r.cashMinor),
        goldMinor: num(r.goldMinor),
        silverMinor: num(r.silverMinor),
        businessMinor: num(r.businessMinor),
        stocksMinor: num(r.stocksMinor),
      };
      if (r.liabilitiesMinor !== null && r.liabilitiesMinor !== undefined)
        out.liabilitiesMinor = num(r.liabilitiesMinor);
      return extraOut(out, r);
    },
  },
  {
    table: 'kv',
    model: 'syncKv',
    naturalKey: ['key'],
    data: z
      .strictObject({ key: z.string().min(1).max(200), value: z.unknown() })
      .refine((d) => Object.hasOwn(d, 'value') && d.value !== undefined, {
        message: 'value is required',
        path: ['value'],
      })
      .refine(
        (d) => Buffer.byteLength(JSON.stringify(d.value ?? null), 'utf8') <= MAX_KV_VALUE_BYTES,
        {
          message: `value exceeds ${MAX_KV_VALUE_BYTES} bytes`,
          path: ['value'],
        },
      ),
    toColumns: (d) => ({ key: d.key, value: json(d.value) }),
    fromColumns: (r) => ({ key: r.key, value: r.value }),
  },
];

export const TABLES: Readonly<Record<SyncTable, TableDef>> = Object.fromEntries(
  DEFS.map((d) => [d.table, d]),
) as Record<SyncTable, TableDef>;

// Compile-time + boot-time guarantee that every contract table is mapped exactly once.
if (DEFS.length !== SYNC_TABLES.length || SYNC_TABLES.some((t) => !TABLES[t])) {
  throw new Error('sync/tables.ts is out of sync with SYNC_TABLES');
}

/** Envelope fields the client may (redundantly) repeat inside `data`. */
const ENVELOPE_KEYS = ['id', 'profileId', 'updatedAt', 'deletedAt'] as const;

export type DataValidation = { ok: true; columns: Row } | { ok: false; reason: string };

/**
 * Validate an envelope's `data` for its table and map it to typed DB columns. Envelope
 * fields repeated inside `data` must agree with the envelope; they are then dropped.
 */
export function validateRowData(
  table: SyncTable,
  envelope: { id: string; profileId: string; updatedAt: number; deletedAt: number | null },
  data: Row,
): DataValidation {
  const def = TABLES[table];
  const rest: Row = { ...data };
  for (const key of ENVELOPE_KEYS) {
    if (!Object.hasOwn(rest, key)) continue;
    // profiles rows carry no profileId of their own; anything else must match the envelope.
    if (rest[key] !== envelope[key])
      return { ok: false, reason: `invalid: data.${key} disagrees with envelope` };
    delete rest[key];
  }
  const parsed = def.data.safeParse(rest);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      reason: `invalid: ${first ? `${first.path.join('.') || 'data'} ${first.message}` : 'data'}`,
    };
  }
  return { ok: true, columns: def.toColumns(parsed.data) };
}

/** Stable natural-key string for conflict detection, or null for tables without one. */
export function naturalKeyOf(table: SyncTable, profileId: string, columns: Row): string | null {
  const fields = TABLES[table].naturalKey;
  if (!fields) return null;
  return JSON.stringify([profileId, ...fields.map((f) => columns[f])]);
}
