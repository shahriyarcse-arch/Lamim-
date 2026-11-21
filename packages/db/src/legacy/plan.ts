/**
 * Pure legacy → v1 mapping. Takes raw legacy snapshots and produces every row to
 * write, plus quarantine entries and a reconciliation report. No I/O here, so the
 * whole mapping is unit-testable and the writer can commit it in one transaction.
 *
 * Zero-loss rules:
 * - Every legacy key/value is archived verbatim (both sources if both exist).
 * - Records that fail validation go to quarantine with the reason and raw JSON.
 * - Unknown properties on known records are kept in `extra`.
 */
import {
  fromLegacyFloat,
  isCurrency,
  isDateStr,
  LEGACY_PRAYER_SETTINGS,
  normalizeStatus,
  PRAYER_NAMES,
  rateToMicro,
  type DateStr,
} from '@lamim/core';
import { z } from 'zod';
import {
  GLOBAL_PROFILE_ID,
  type DayDocument,
  type DhikrLog,
  type Extra,
  type Habit,
  type HabitEvent,
  type KvEntry,
  type LegacyArchiveEntry,
  type MetaEntry,
  type Profile,
  type QuarantineEntry,
  type SalahDay,
  type SalahEntry,
  type Settings,
  type Transaction,
  type Vault,
  type ZakatProfile,
} from '../schema';
import type { LegacySnapshot, LegacySourceName } from './source';

export const LEGACY_IMPORT_VERSION = 'legacy-vanilla-v2';

export interface ImportRows {
  profiles: Profile[];
  settings: Settings[];
  salahEntries: SalahEntry[];
  salahDays: SalahDay[];
  dhikrLogs: DhikrLog[];
  gymLogs: DayDocument[];
  careerLogs: DayDocument[];
  habits: Habit[];
  habitEvents: HabitEvent[];
  transactions: Transaction[];
  vaults: Vault[];
  zakatProfiles: ZakatProfile[];
  kv: KvEntry[];
}

export interface FinanceReconciliation {
  profileId: string;
  /** Legacy float balance (income − expenses) over the imported items, converted once. */
  legacyBalanceMinor: number;
  /** Sum of the per-item integer conversions. */
  importedBalanceMinor: number;
  /** Rounding drift introduced by per-item conversion (normally within a few cents). */
  diffMinor: number;
}

export interface ImportReport {
  counts: Record<keyof ImportRows, number>;
  quarantined: number;
  archived: number;
  /** Keys kept only in the archive (UI flags, service-worker state, unknown keys). */
  archivedOnlyKeys: string[];
  activeProfileId: string | null;
  finance: FinanceReconciliation[];
}

export interface ImportPlan {
  rows: ImportRows;
  quarantine: QuarantineEntry[];
  archive: LegacyArchiveEntry[];
  meta: MetaEntry[];
  report: ImportReport;
}

export interface PlanOptions {
  now: number;
  newId: () => string;
}

// ---- Zod schemas (validate shape; tolerate unknown properties) -----------------

const finiteNumber = z.union([z.number(), z.string().trim().min(1)]).transform((v, ctx) => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) {
    ctx.addIssue({ code: 'custom', message: 'not a finite number' });
    return z.NEVER;
  }
  return n;
});

const legacyId = z.union([z.string().min(1), z.number()]).transform(String);

const UserSchema = z.looseObject({
  id: legacyId,
  name: z.string().trim().min(1),
  gender: z.string().nullish(),
  dob: z.string().nullish(),
  createdAt: z.string().nullish(),
});

const VaultEntrySchema = z.looseObject({
  id: legacyId.optional(),
  name: z.string().nullish(),
  userData: z.unknown().optional(),
});

const SettingsSchema = z.looseObject({});

const HabitSchema = z.looseObject({
  id: legacyId.optional(),
  label: z.string().nullish(),
  name: z.string().nullish(),
  icon: z.string().nullish(),
  color: z.string().nullish(),
  startDate: z.string().nullish(),
  start_date: z.string().nullish(),
  created_at: z.string().nullish(),
  history: z.array(z.unknown()).nullish(),
});

const HabitHistorySchema = z.looseObject({
  date: z.string().refine(isDateStr, 'invalid date'),
  clean: z.boolean(),
  fullDate: z.string().nullish(),
  reason: z.string().nullish(),
  streak: z.number().int().nullish(),
});

const MoneyItemSchema = z.looseObject({
  id: legacyId.optional(),
  description: z.string().nullish(),
  amount: finiteNumber.refine((n) => n >= 0, 'negative amount'),
  category: z.string().nullish(),
  date: z
    .string()
    .transform((s) => s.slice(0, 10))
    .refine(isDateStr, 'invalid date'),
  vaultId: legacyId.nullish(),
});

const VaultSchema = z.looseObject({
  id: legacyId.optional(),
  name: z.string().nullish(),
  target: finiteNumber.refine((n) => n >= 0, 'negative target'),
  saved: finiteNumber.refine((n) => n >= 0, 'negative saved').optional(),
});

const FinanceSchema = z.looseObject({
  income: z.array(z.unknown()).nullish(),
  expenses: z.array(z.unknown()).nullish(),
  savings: z.array(z.unknown()).nullish(),
});

const PlainObject = z.record(z.string(), z.unknown());

// ---- Helpers -------------------------------------------------------------------

const GLOBAL_KEYS = new Set([
  'lamim_user',
  'lamim_profiles_vault',
  'lamim_lang',
  'lamim_dhikr_presets',
  'lamim_fx_rate',
]);
const SCOPED_KEY = /^usr_(.+?)_(lamim_.+|user_manual_seen)$/;
/** Date-shaped suffix; impossible dates (2026-02-30) are quarantined, non-dates (intro_done) archived. */
const DATED_KEY = /^lamim_(salah|dhikr|gym|career)_(\d{4}-\d{2}-\d{2})$/;
const KV_KEYS: Record<string, string> = {
  lamim_goals: 'goals',
  lamim_gym_body_metrics: 'gym.bodyMetrics',
  lamim_gym_prs: 'gym.prs',
  lamim_career_achievements: 'career.achievements',
  lamim_career_timer: 'career.timer',
  lamim_dhikr_presets: 'dhikr.presets',
};

function omit(obj: Record<string, unknown>, keys: readonly string[]): Extra | undefined {
  const rest: Extra = {};
  for (const [k, v] of Object.entries(obj)) if (!keys.includes(k)) rest[k] = v;
  return Object.keys(rest).length ? rest : undefined;
}

/** Conditionally attach optional props (exactOptionalPropertyTypes-safe). */
function withOptional<T extends object>(base: T, optional: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(optional)) if (v !== undefined) out[k] = v;
  return out as T;
}

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};
/** Legacy stored relapse reasons HTML-escaped; React escapes on render, so store plain text. */
export function unescapeLegacyHtml(s: string): string {
  return s.replace(/&(?:amp|lt|gt|quot|#39);/g, (m) => HTML_ENTITIES[m] ?? m);
}

function parseIso(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

function issues(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
}

// ---- Planner -------------------------------------------------------------------

interface Located {
  /** The original legacy key (used in quarantine and reports). */
  key: string;
  raw: string;
  source: LegacySourceName;
}

export function planLegacyImport(snapshots: readonly LegacySnapshot[], opts: PlanOptions): ImportPlan {
  const { now, newId } = opts;
  const quarantine: QuarantineEntry[] = [];
  const archive: LegacyArchiveEntry[] = [];
  const archivedOnlyKeys: string[] = [];
  const rows: ImportRows = {
    profiles: [],
    settings: [],
    salahEntries: [],
    salahDays: [],
    dhikrLogs: [],
    gymLogs: [],
    careerLogs: [],
    habits: [],
    habitEvents: [],
    transactions: [],
    vaults: [],
    zakatProfiles: [],
    kv: [],
  };
  const finance: FinanceReconciliation[] = [];

  const reject = (legacyKey: string, raw: unknown, reason: string, path: string | null = null) => {
    quarantine.push({
      legacyKey,
      path,
      reason,
      raw: typeof raw === 'string' ? raw : JSON.stringify(raw) ?? String(raw),
      at: now,
    });
  };

  // 1. Archive everything; merge sources with IndexedDB taking precedence.
  const merged = new Map<string, Located>();
  const ordered = [...snapshots].sort((a, b) => (a.source === 'indexeddb' ? 1 : 0) - (b.source === 'indexeddb' ? 1 : 0));
  for (const snap of ordered) {
    for (const [key, raw] of snap.entries) {
      archive.push({ key: `${snap.source}:${key}`, source: snap.source, legacyKey: key, raw, archivedAt: now });
      merged.set(key, { key, raw, source: snap.source }); // indexeddb processed last → wins
    }
  }

  const json = (key: string): { ok: true; value: unknown } | { ok: false } => {
    const hit = merged.get(key);
    if (!hit) return { ok: false };
    try {
      return { ok: true, value: JSON.parse(hit.raw) };
    } catch {
      reject(key, hit.raw, 'invalid JSON');
      return { ok: false };
    }
  };

  // 2. Profiles: vault snapshots, overridden by the active user record.
  const users = new Map<string, z.infer<typeof UserSchema>>();
  const vault = json('lamim_profiles_vault');
  if (vault.ok) {
    if (Array.isArray(vault.value)) {
      vault.value.forEach((entry, i) => {
        // Vault snapshot: { id, name, gender, lastActive, userData: <full user> }
        const v = VaultEntrySchema.safeParse(entry);
        const userData =
          v.success && v.data.userData && typeof v.data.userData === 'object'
            ? (v.data.userData as Record<string, unknown>)
            : null;
        const candidate = userData
          ? { ...userData, id: userData.id ?? v.data?.id, name: userData.name ?? v.data?.name }
          : entry;
        const u = UserSchema.safeParse(candidate);
        if (u.success) users.set(u.data.id, u.data);
        else reject('lamim_profiles_vault', entry, issues(u.error), `[${i}]`);
      });
    } else {
      reject('lamim_profiles_vault', vault.value, 'expected an array');
    }
  }
  let activeLegacyId: string | null = null;
  const active = json('lamim_user');
  if (active.ok && active.value !== null) {
    const u = UserSchema.safeParse(active.value);
    if (u.success) {
      users.set(u.data.id, { ...users.get(u.data.id), ...u.data });
      activeLegacyId = u.data.id;
    } else {
      reject('lamim_user', active.value, issues(u.error));
    }
  }

  const profileIds = new Map<string, string>(); // legacy id → new id
  for (const [lid, u] of users) {
    const id = newId();
    profileIds.set(lid, id);
    const dob = u.dob && isDateStr(u.dob) ? u.dob : null;
    rows.profiles.push(
      withOptional<Profile>(
        {
          id,
          legacyId: lid,
          name: u.name.trim(),
          gender: u.gender ?? null,
          dob,
          createdAt: parseIso(u.createdAt) ?? now,
          updatedAt: now,
          deletedAt: null,
        },
        {
          extra: omit(
            { ...u, ...(u.dob && !dob ? { invalidDob: u.dob } : {}) },
            ['id', 'name', 'gender', 'dob', 'createdAt'],
          ),
        },
      ),
    );
  }

  // 3. Assign every remaining key to a profile (or global).
  type Bucket = Map<string, Located>; // module key (lamim_*) → value
  const buckets = new Map<string, Bucket>();
  const bucket = (pid: string) => {
    let b = buckets.get(pid);
    if (!b) buckets.set(pid, (b = new Map()));
    return b;
  };
  const unscoped = new Map<string, Located>();

  for (const [key, loc] of merged) {
    if (GLOBAL_KEYS.has(key)) continue;
    const m = SCOPED_KEY.exec(key);
    if (m) {
      const pid = profileIds.get(m[1]!);
      if (!pid) {
        reject(key, loc.raw, `unknown legacy profile "${m[1]}"`);
        continue;
      }
      bucket(pid).set(m[2]!, loc);
    } else {
      unscoped.set(key, loc);
    }
  }

  // Pre-multi-profile data and the unscoped settings mirror (legacy _rescopeOrphans / getSettings).
  const activeId = activeLegacyId ? (profileIds.get(activeLegacyId) ?? null) : null;
  const fallbackSettings = unscoped.get('lamim_settings');
  unscoped.delete('lamim_settings');
  for (const [key, loc] of unscoped) {
    if (activeId) {
      const b = bucket(activeId);
      if (!b.has(key)) b.set(key, loc);
    } else {
      reject(key, loc.raw, 'unscoped data with no active profile');
    }
  }

  const parseLoc = (loc: Located): { ok: true; value: unknown } | { ok: false } => {
    try {
      return { ok: true, value: JSON.parse(loc.raw) };
    } catch {
      reject(loc.key, loc.raw, 'invalid JSON');
      return { ok: false };
    }
  };

  const langRaw = merged.get('lamim_lang')?.raw;
  const globalLang = langRaw ? langRaw.replace(/^"|"$/g, '') : null;

  const synced = (profileId: string) => ({ id: newId(), profileId, updatedAt: now, deletedAt: null });

  // 4. Per-profile modules.
  for (const profileId of profileIds.values()) {
    const b = buckets.get(profileId) ?? new Map<string, Located>();

    // Settings (always created; pinned to legacy prayer method).
    const settingsLoc = b.get('lamim_settings') ?? fallbackSettings;
    let s: Record<string, unknown> = {};
    if (settingsLoc) {
      const parsed = parseLoc(settingsLoc);
      const v = parsed.ok ? SettingsSchema.safeParse(parsed.value) : null;
      if (v?.success) s = v.data;
      else if (parsed.ok) reject(settingsLoc.key, parsed.value, 'expected an object');
    }
    const lat = typeof s.lat === 'number' && Math.abs(s.lat) <= 90 ? s.lat : null;
    const lng = typeof s.lng === 'number' && Math.abs(s.lng) <= 180 ? s.lng : null;
    const lang = s.language === 'bn' || s.lang === 'bn' || (!s.language && globalLang === 'bn') ? 'bn' : 'en';
    const hijri = typeof s.hijriOffset === 'number' && Number.isInteger(s.hijriOffset) && Math.abs(s.hijriOffset) <= 3 ? s.hijriOffset : 0;
    rows.settings.push(
      withOptional<Settings>(
        {
          ...synced(profileId),
          lang,
          currency: isCurrency(s.currency) ? s.currency : 'USD',
          lat,
          lng,
          locationName: typeof s.locationName === 'string' ? s.locationName : null,
          method: LEGACY_PRAYER_SETTINGS.method,
          asr: LEGACY_PRAYER_SETTINGS.asr,
          hijriOffset: hijri,
          theme: s.theme === 'dark' ? 'dark' : 'light',
        },
        { extra: omit(s, ['language', 'lang', 'currency', 'lat', 'lng', 'locationName', 'hijriOffset', 'theme']) },
      ),
    );

    for (const [key, loc] of b) {
      if (key === 'lamim_settings') continue;
      const fullKey = loc.key;

      const kvKey = KV_KEYS[key];
      if (kvKey) {
        const p = parseLoc(loc);
        if (p.ok) rows.kv.push({ ...synced(profileId), key: kvKey, value: p.value });
        continue;
      }

      const dated = DATED_KEY.exec(key);
      if (dated) {
        const [, kind, date] = dated as unknown as [string, string, string];
        if (!isDateStr(date)) {
          reject(fullKey, loc.raw, `invalid date in key: "${date}"`);
          continue;
        }
        const p = parseLoc(loc);
        if (!p.ok) continue;
        const obj = PlainObject.safeParse(p.value);
        if (!obj.success) {
          reject(fullKey, p.value, 'expected an object');
          continue;
        }
        mapDated(kind, date as DateStr, obj.data, profileId, fullKey);
        continue;
      }

      if (key === 'lamim_habits') {
        const p = parseLoc(loc);
        if (p.ok) mapHabits(p.value, profileId, fullKey);
        continue;
      }

      if (key === 'lamim_finance') {
        const p = parseLoc(loc);
        if (p.ok) mapFinance(p.value, profileId, fullKey);
        continue;
      }

      archivedOnlyKeys.push(fullKey);
    }
  }

  // Global custom dhikr presets.
  const presets = json('lamim_dhikr_presets');
  if (presets.ok) {
    rows.kv.push({ ...synced(GLOBAL_PROFILE_ID), key: KV_KEYS.lamim_dhikr_presets!, value: presets.value });
  }

  // Last cached USD→BDT rate (legacy localStorage), so BDT users have a rate offline.
  const fx = json('lamim_fx_rate');
  if (fx.ok) {
    const v = z
      .looseObject({ rate: z.number().positive().max(100_000), ts: z.number().optional(), source: z.string().optional() })
      .safeParse(fx.value);
    if (v.success) {
      rows.kv.push({
        ...synced(GLOBAL_PROFILE_ID),
        key: 'fx.USD_BDT',
        value: { rateMicro: rateToMicro(v.data.rate), at: v.data.ts ?? now, source: v.data.source ?? 'legacy' },
      });
    } else {
      reject('lamim_fx_rate', fx.value, issues(v.error));
    }
  }

  // ---- Module mappers (closures over rows/quarantine) ---------------------------

  function mapDated(kind: string, date: DateStr, v: Record<string, unknown>, profileId: string, key: string) {
    if (kind === 'salah') {
      const invalid: Extra = {};
      for (const prayer of PRAYER_NAMES) {
        const raw = v[prayer];
        if (raw === null || raw === undefined || raw === '') continue;
        const status = normalizeStatus(raw);
        if (status) rows.salahEntries.push({ ...synced(profileId), date, prayer, status });
        else invalid[prayer] = raw;
      }
      const rakat = typeof v.tahajjud_rakat === 'number' && Number.isInteger(v.tahajjud_rakat) ? v.tahajjud_rakat : 0;
      const witr = typeof v.witr === 'number' || typeof v.witr === 'boolean' || typeof v.witr === 'string' ? v.witr : 0;
      const extra = omit(v, [...PRAYER_NAMES, 'jummah', 'tahajjud', 'tahajjud_rakat', 'witr', 'sunnah', 'notes']);
      const mergedExtra = Object.keys(invalid).length ? { ...extra, invalidStatuses: invalid } : extra;
      rows.salahDays.push(
        withOptional<SalahDay>(
          {
            ...synced(profileId),
            date,
            jummah: v.jummah === true,
            tahajjud: typeof v.tahajjud === 'boolean' || typeof v.tahajjud === 'string' ? v.tahajjud : false,
            tahajjudRakat: rakat,
            witr,
            sunnah: PlainObject.safeParse(v.sunnah).data ?? {},
            notes: PlainObject.safeParse(v.notes).data ?? {},
          },
          { extra: mergedExtra },
        ),
      );
      return;
    }

    if (kind === 'dhikr') {
      const counts: Record<string, number> = {};
      const extra: Extra = {};
      for (const [presetId, raw] of Object.entries(v)) {
        const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN;
        if (Number.isFinite(n) && n >= 0) counts[presetId] = Math.trunc(n);
        else extra[presetId] = raw;
      }
      rows.dhikrLogs.push(
        withOptional<DhikrLog>(
          { ...synced(profileId), date, counts },
          { extra: Object.keys(extra).length ? extra : undefined },
        ),
      );
      return;
    }

    const doc: DayDocument = { ...synced(profileId), date, data: v };
    if (kind === 'gym') rows.gymLogs.push(doc);
    else if (kind === 'career') rows.careerLogs.push(doc);
    else reject(key, v, `unknown dated module "${kind}"`);
  }

  function mapHabits(value: unknown, profileId: string, key: string) {
    if (!Array.isArray(value)) {
      reject(key, value, 'expected an array');
      return;
    }
    value.forEach((item, i) => {
      const h = HabitSchema.safeParse(item);
      if (!h.success) {
        reject(key, item, issues(h.error), `[${i}]`);
        return;
      }
      const d = h.data;
      const startIso = [d.startDate, d.start_date, d.created_at].map(parseIso).find((t) => t !== null);
      const habitId = newId();
      // Legacy moved startDate on every relapse; tracking began at the earliest known point.
      const historyTimes = (d.history ?? []).flatMap((h) => {
        const r = HabitHistorySchema.safeParse(h);
        if (!r.success) return [];
        const t = parseIso(r.data.fullDate) ?? parseIso(`${r.data.date}T00:00:00Z`);
        return t === null ? [] : [t];
      });
      const trackedSince = Math.min(startIso ?? now, ...historyTimes);
      rows.habits.push(
        withOptional<Habit>(
          {
            ...synced(profileId),
            id: habitId,
            label: (d.label ?? d.name ?? '').trim() || 'Habit',
            icon: d.icon ?? null,
            color: d.color ?? null,
            startDate: new Date(startIso ?? now).toISOString(),
            trackedSince: new Date(trackedSince).toISOString(),
          },
          {
            legacyId: d.id,
            extra: omit(
              { ...d, ...(startIso === undefined ? { startDateMissing: true } : {}) },
              ['id', 'label', 'name', 'icon', 'color', 'startDate', 'start_date', 'created_at', 'history'],
            ),
          },
        ),
      );
      (d.history ?? []).forEach((entry, j) => {
        const e = HabitHistorySchema.safeParse(entry);
        if (!e.success) {
          reject(key, entry, issues(e.error), `[${i}].history[${j}]`);
          return;
        }
        rows.habitEvents.push(
          withOptional<HabitEvent>(
            {
              ...synced(profileId),
              habitId,
              date: e.data.date,
              type: e.data.clean ? 'clean' : 'relapse',
              at: parseIso(e.data.fullDate) !== null ? e.data.fullDate! : null,
              reason: e.data.reason ? unescapeLegacyHtml(e.data.reason) : null,
              streak: e.data.streak ?? null,
            },
            { extra: omit(e.data, ['date', 'clean', 'fullDate', 'reason', 'streak']) },
          ),
        );
      });
    });
  }

  function mapFinance(value: unknown, profileId: string, key: string) {
    const f = FinanceSchema.safeParse(value);
    if (!f.success) {
      reject(key, value, issues(f.error));
      return;
    }
    const data = f.data;

    // Legacy stored every amount in USD (BDT input was converted at entry time and
    // the rate was not kept), so imports are USD with baseMinor = amountMinor.
    const vaultIds = new Map<string, string>();
    (data.savings ?? []).forEach((item, i) => {
      const v = VaultSchema.safeParse(item);
      if (!v.success) {
        reject(key, item, issues(v.error), `savings[${i}]`);
        return;
      }
      const id = newId();
      if (v.data.id) vaultIds.set(v.data.id, id);
      rows.vaults.push(
        withOptional<Vault>(
          {
            ...synced(profileId),
            id,
            name: v.data.name?.trim() || 'Savings',
            targetMinor: fromLegacyFloat(v.data.target),
            savedMinor: fromLegacyFloat(v.data.saved ?? 0),
            currency: 'USD',
          },
          { legacyId: v.data.id, extra: omit(v.data, ['id', 'name', 'target', 'saved']) },
        ),
      );
    });

    let legacyBalance = 0;
    let importedBalance = 0;
    const addTx = (list: unknown[] | null | undefined, field: 'income' | 'expenses') => {
      (list ?? []).forEach((item, i) => {
        const t = MoneyItemSchema.safeParse(item);
        if (!t.success) {
          reject(key, item, issues(t.error), `${field}[${i}]`);
          return;
        }
        const d = t.data;
        const amountMinor = fromLegacyFloat(d.amount);
        const type = field === 'income' ? 'income' : d.category === 'transfer' ? 'transfer' : 'expense';
        const sign = field === 'income' ? 1 : -1;
        legacyBalance += sign * d.amount;
        importedBalance += sign * amountMinor;
        const mappedVault = d.vaultId ? (vaultIds.get(d.vaultId) ?? null) : null;
        rows.transactions.push(
          withOptional<Transaction>(
            {
              ...synced(profileId),
              type,
              amountMinor,
              currency: 'USD',
              fxRateMicro: null,
              baseMinor: amountMinor,
              categoryId: field === 'income' ? null : (d.category ?? null),
              description: d.description ?? '',
              date: d.date as DateStr,
              vaultId: mappedVault,
            },
            {
              legacyId: d.id,
              extra: omit(
                { ...d, ...(d.vaultId && !mappedVault ? { orphanVaultId: d.vaultId } : {}) },
                ['id', 'description', 'amount', 'category', 'date', 'vaultId'],
              ),
            },
          ),
        );
      });
    };
    addTx(data.income, 'income');
    addTx(data.expenses, 'expenses');

    const money = (field: string, fallback: number): number => {
      const raw = data[field];
      if (raw === undefined || raw === null || raw === '') return fallback;
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (Number.isFinite(n) && n >= 0) return fromLegacyFloat(n);
      reject(key, raw, `invalid ${field}`, field);
      return fallback;
    };
    rows.zakatProfiles.push(
      withOptional<ZakatProfile>(
        {
          ...synced(profileId),
          currency: 'USD',
          nisabMinor: money('nisab', 600_00),
          cashMinor: money('cash', 0),
          goldMinor: money('gold', 0),
          silverMinor: money('silver', 0),
          businessMinor: money('business', 0),
          stocksMinor: money('stocks', 0),
        },
        {
          extra: omit(data, ['income', 'expenses', 'savings', 'nisab', 'cash', 'gold', 'silver', 'business', 'stocks']),
        },
      ),
    );

    const legacyBalanceMinor = fromLegacyFloat(legacyBalance);
    finance.push({
      profileId,
      legacyBalanceMinor,
      importedBalanceMinor: importedBalance,
      diffMinor: importedBalance - legacyBalanceMinor,
    });
  }

  // ---- Report & meta -------------------------------------------------------------

  const counts = Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.length])) as ImportReport['counts'];
  const report: ImportReport = {
    counts,
    quarantined: quarantine.length,
    archived: archive.length,
    archivedOnlyKeys: archivedOnlyKeys.sort(),
    activeProfileId: activeId,
    finance,
  };
  const meta: MetaEntry[] = [
    {
      key: 'migratedFrom',
      value: {
        version: LEGACY_IMPORT_VERSION,
        at: now,
        sources: snapshots.map((s) => ({ source: s.source, keys: s.entries.size })),
        report,
      },
    },
  ];
  if (activeId) meta.push({ key: 'activeProfileId', value: activeId });

  return { rows, quarantine, archive, meta, report };
}
