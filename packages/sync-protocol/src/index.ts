/**
 * @lamim/sync-protocol — the single wire contract between the offline client
 * (Dexie) and the cloud API (NestJS). Both sides validate with these schemas and
 * resolve conflicts with the same `lwwWins` rule, so they can never disagree.
 */
import { z } from 'zod';

// ---- Tables -------------------------------------------------------------------

/** Client tables that sync. Local-only stores (syncQueue, meta, quarantine, legacyArchive) never leave the device. */
export const SYNC_TABLES = [
  'profiles',
  'settings',
  'salahEntries',
  'salahDays',
  'dhikrLogs',
  'gymLogs',
  'careerLogs',
  'habits',
  'habitEvents',
  'transactions',
  'vaults',
  'zakatProfiles',
  'kv',
] as const;
export type SyncTable = (typeof SYNC_TABLES)[number];

/** Rows with profileId "global" (e.g. dhikr presets, FX rate) belong to the user, not a profile. */
export const GLOBAL_PROFILE_ID = 'global';

// ---- Row envelope ---------------------------------------------------------------

const Uuidish = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'invalid id');
const EpochMs = z.number().int().nonnegative().max(8_640_000_000_000_000);

export const RowEnvelopeSchema = z.object({
  table: z.enum(SYNC_TABLES),
  id: Uuidish,
  /** Owning profile; for `profiles` rows this equals `id`. */
  profileId: Uuidish,
  updatedAt: EpochMs,
  deletedAt: EpochMs.nullable(),
  /** Device that produced this version (LWW tie-break). */
  deviceId: Uuidish,
  /** The full row as stored by the client, minus the envelope fields. Max ~64 KB. */
  data: z.record(z.string(), z.unknown()),
});
export type RowEnvelope = z.infer<typeof RowEnvelopeSchema>;

export const MAX_ROW_BYTES = 64 * 1024;
export const MAX_PUSH_ROWS = 500;
export const MAX_PULL_ROWS = 500;

// ---- Last-write-wins --------------------------------------------------------------

export interface Versioned {
  updatedAt: number;
  deviceId: string;
}

/**
 * True when `incoming` should replace `existing`. Later `updatedAt` wins; on an
 * exact tie the lexicographically larger `deviceId` wins, so every replica picks
 * the same winner regardless of arrival order. Equal versions are not re-applied.
 */
export function lwwWins(incoming: Versioned, existing: Versioned | null | undefined): boolean {
  if (!existing) return true;
  if (incoming.updatedAt !== existing.updatedAt) return incoming.updatedAt > existing.updatedAt;
  return incoming.deviceId > existing.deviceId;
}

// ---- Sync endpoints -----------------------------------------------------------------

export const PushRequestSchema = z.object({
  deviceId: Uuidish,
  changes: z.array(RowEnvelopeSchema).max(MAX_PUSH_ROWS),
});
export type PushRequest = z.infer<typeof PushRequestSchema>;

export const PushResponseSchema = z.object({
  /** Ids accepted (written, or already newer on the server — either way the client may drop them from its queue). */
  accepted: z.array(z.object({ table: z.enum(SYNC_TABLES), id: z.string() })),
  rejected: z.array(z.object({ table: z.enum(SYNC_TABLES), id: z.string(), reason: z.string() })),
  serverTime: EpochMs,
});
export type PushResponse = z.infer<typeof PushResponseSchema>;

export const PullQuerySchema = z.object({
  /** Opaque server revision cursor; "0" pulls everything. */
  cursor: z
    .string()
    .regex(/^\d{1,19}$/)
    .default('0'),
  limit: z.coerce.number().int().min(1).max(MAX_PULL_ROWS).default(MAX_PULL_ROWS),
});

export const PullResponseSchema = z.object({
  rows: z.array(RowEnvelopeSchema),
  cursor: z.string().regex(/^\d{1,19}$/),
  hasMore: z.boolean(),
});
export type PullResponse = z.infer<typeof PullResponseSchema>;

// ---- Auth ---------------------------------------------------------------------------

export const EmailSchema = z.string().trim().toLowerCase().email().max(254);
/** NIST 800-63B style: length over composition rules. */
export const PasswordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128);

export const RegisterRequestSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  deviceId: Uuidish,
});
export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1).max(128),
  deviceId: Uuidish,
});
export const RefreshRequestSchema = z.object({ refreshToken: z.string().min(32).max(256) });

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  /** Seconds until the access token expires. */
  expiresIn: z.number().int().positive(),
  refreshToken: z.string(),
  user: z.object({ id: z.string(), email: z.string() }),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
