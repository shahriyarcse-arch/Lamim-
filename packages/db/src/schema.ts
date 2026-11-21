/**
 * Lamim local database — Dexie v4 over IndexedDB (database "lamim").
 *
 * Every synced row carries `id` (UUID v7), `profileId`, `updatedAt` (UTC ms) and
 * `deletedAt` (tombstone, null when live) so the Phase 2 sync engine can apply
 * last-write-wins. Per-day logs are unique on [profileId+date]; Salah is one row
 * per prayer so two devices editing different prayers of the same day never collide.
 *
 * `extra` fields preserve any legacy properties the typed model does not (yet)
 * understand, so nothing is dropped during migration.
 */
import { Dexie, type EntityTable, type Table } from 'dexie';
import type {
  CalculationMethod,
  AsrSchool,
  Currency,
  DateStr,
  PrayerName,
  SalahStatus,
} from '@lamim/core';

export const DB_NAME = 'lamim';
/** Profile id used for data shared by all profiles (e.g. custom dhikr presets). */
export const GLOBAL_PROFILE_ID = 'global';

export type Extra = Record<string, unknown>;

export interface SyncedRow {
  id: string;
  profileId: string;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Profile {
  id: string;
  legacyId?: string;
  name: string;
  gender: string | null;
  dob: DateStr | null;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  extra?: Extra;
}

export interface Settings extends SyncedRow {
  lang: 'en' | 'bn';
  currency: Currency;
  lat: number | null;
  lng: number | null;
  locationName: string | null;
  method: CalculationMethod;
  asr: AsrSchool;
  hijriOffset: number;
  theme: 'light' | 'dark' | 'system';
  extra?: Extra;
}

export interface SalahEntry extends SyncedRow {
  date: DateStr;
  prayer: PrayerName;
  status: SalahStatus;
}

export interface SalahDay extends SyncedRow {
  date: DateStr;
  jummah: boolean;
  /** true / false / 'prayed' as stored by legacy; see core SHS. */
  tahajjud: boolean | string;
  /** Rakat count; -1 = explicitly missed, 0 = unset. */
  tahajjudRakat: number;
  witr: number | boolean | string;
  sunnah: Record<string, unknown>;
  notes: Record<string, unknown>;
  /** Voluntary fast observed this day (new in v3; absent on imported rows). */
  fasting?: boolean;
  extra?: Extra;
}

export interface DhikrLog extends SyncedRow {
  date: DateStr;
  counts: Record<string, number>;
  extra?: Extra;
}

/** Gym and career day logs keep the legacy document until those modules are typed (Phase 1 steps 6+). */
export interface DayDocument extends SyncedRow {
  date: DateStr;
  data: Extra;
}

export interface Habit extends SyncedRow {
  legacyId?: string;
  label: string;
  icon: string | null;
  color: string | null;
  /** ISO datetime the current streak started. */
  startDate: string;
  extra?: Extra;
}

export interface HabitEvent extends SyncedRow {
  habitId: string;
  date: DateStr;
  type: 'relapse' | 'clean';
  /** ISO datetime of the event, when known. */
  at: string | null;
  reason: string | null;
  /** Streak length at the time of a relapse. */
  streak: number | null;
  extra?: Extra;
}

/** transfer = cash → vault deposit; withdrawal = vault → cash. */
export type TransactionType = 'income' | 'expense' | 'transfer' | 'withdrawal';

export interface Transaction extends SyncedRow {
  legacyId?: string;
  type: TransactionType;
  /** Integer minor units in `currency`. */
  amountMinor: number;
  currency: Currency;
  /** Rate × 10⁶ (1 USD = rate BDT); null when `currency` is the base currency. */
  fxRateMicro: number | null;
  /** Integer USD cents; null for non-USD entries recorded before any rate was known (backfilled by sync). */
  baseMinor: number | null;
  categoryId: string | null;
  description: string;
  date: DateStr;
  vaultId: string | null;
  extra?: Extra;
}

export interface Vault extends SyncedRow {
  legacyId?: string;
  name: string;
  targetMinor: number;
  savedMinor: number;
  currency: Currency;
  extra?: Extra;
}

export interface ZakatProfile extends SyncedRow {
  currency: Currency;
  nisabMinor: number;
  cashMinor: number;
  goldMinor: number;
  silverMinor: number;
  businessMinor: number;
  stocksMinor: number;
  /** Debts due now, deducted before nisab (new in v3; absent on imported rows). */
  liabilitiesMinor?: number;
  extra?: Extra;
}

/** Small per-profile documents: goals, body metrics, PRs, achievements, timer, UI flags, presets. */
export interface KvEntry extends SyncedRow {
  key: string;
  value: unknown;
}

export interface SyncQueueItem {
  seq?: number;
  table: string;
  rowId: string;
  op: 'put' | 'delete';
  createdAt: number;
  attempts: number;
}

export interface MetaEntry {
  key: string;
  value: unknown;
}

export interface QuarantineEntry {
  seq?: number;
  legacyKey: string;
  /** JSON path inside the legacy value, e.g. "expenses[3]". */
  path: string | null;
  reason: string;
  raw: string;
  at: number;
}

/** Every legacy key/value, verbatim, from each source it was found in. */
export interface LegacyArchiveEntry {
  /** `${source}:${legacyKey}` */
  key: string;
  source: 'indexeddb' | 'localStorage';
  legacyKey: string;
  raw: string;
  archivedAt: number;
}

export const SCHEMA_V1 = {
  profiles: 'id, &legacyId, updatedAt',
  settings: 'id, &profileId',
  salahEntries: 'id, &[profileId+date+prayer], [profileId+date], updatedAt',
  salahDays: 'id, &[profileId+date], updatedAt',
  dhikrLogs: 'id, &[profileId+date], updatedAt',
  gymLogs: 'id, &[profileId+date], updatedAt',
  careerLogs: 'id, &[profileId+date], updatedAt',
  habits: 'id, profileId, [profileId+updatedAt]',
  habitEvents: 'id, habitId, [profileId+date], updatedAt',
  transactions: 'id, [profileId+date], [profileId+type], categoryId, vaultId, updatedAt',
  vaults: 'id, profileId, updatedAt',
  zakatProfiles: 'id, &profileId',
  kv: 'id, &[profileId+key], updatedAt',
  syncQueue: '++seq, [table+rowId]',
  meta: 'key',
  quarantine: '++seq, legacyKey, reason',
  legacyArchive: 'key, legacyKey',
} as const;

/** Inject an IndexedDB implementation (tests, workers); both must come from the same implementation. */
export interface DexieDeps {
  indexedDB: IDBFactory;
  IDBKeyRange: typeof IDBKeyRange;
}

export class LamimDB extends Dexie {
  profiles!: EntityTable<Profile, 'id'>;
  settings!: EntityTable<Settings, 'id'>;
  salahEntries!: EntityTable<SalahEntry, 'id'>;
  salahDays!: EntityTable<SalahDay, 'id'>;
  dhikrLogs!: EntityTable<DhikrLog, 'id'>;
  gymLogs!: EntityTable<DayDocument, 'id'>;
  careerLogs!: EntityTable<DayDocument, 'id'>;
  habits!: EntityTable<Habit, 'id'>;
  habitEvents!: EntityTable<HabitEvent, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  vaults!: EntityTable<Vault, 'id'>;
  zakatProfiles!: EntityTable<ZakatProfile, 'id'>;
  kv!: EntityTable<KvEntry, 'id'>;
  syncQueue!: EntityTable<SyncQueueItem, 'seq'>;
  meta!: EntityTable<MetaEntry, 'key'>;
  quarantine!: EntityTable<QuarantineEntry, 'seq'>;
  legacyArchive!: Table<LegacyArchiveEntry, string>;

  constructor(name: string = DB_NAME, deps?: DexieDeps) {
    super(name, deps ? { indexedDB: deps.indexedDB, IDBKeyRange: deps.IDBKeyRange } : undefined);
    this.version(1).stores(SCHEMA_V1);
  }
}
