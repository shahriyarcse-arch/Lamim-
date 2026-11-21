import { z } from 'zod';

/** DI token for the validated runtime configuration. */
export const APP_CONFIG = Symbol('APP_CONFIG');

const Int = (def: number, min = 0) => z.coerce.number().int().min(min).default(def);

/** Placeholder fragments that must never be used as a signing key. */
const KNOWN_PLACEHOLDERS = [
  'replace-with',
  'changeme',
  'change-me',
  'your-secret',
  'placeholder',
  'example',
  'secret',
];

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: Int(3001, 1),
  /** Pooled Neon connection string used at runtime. */
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((v) => /^postgres(ql)?:\/\//.test(v), 'must be a postgres:// URL'),
  /** Postgres schema holding the tables (tests use an isolated throwaway schema). */
  DB_SCHEMA: z
    .string()
    .regex(/^[a-z_][a-z0-9_]{0,62}$/)
    .default('public'),
  /** HS256 signing key: >= 43 base64url chars (>= 256 bits) of real randomness. */
  JWT_SECRET: z
    .string()
    .regex(/^[A-Za-z0-9_-]{43,512}$/, 'must be at least 43 base64url characters (32 random bytes)')
    .refine(
      (v) => !KNOWN_PLACEHOLDERS.some((p) => v.toLowerCase().includes(p)),
      'is a placeholder value',
    )
    .refine((v) => new Set(v).size >= 16, 'looks low-entropy (fewer than 16 distinct characters)'),
  /** Comma-separated allow-list of browser origins, e.g. "https://lamim.tech,http://localhost:3000". */
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((v) =>
      v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .pipe(
      z.array(z.string().regex(/^https?:\/\/[^/\s]+$/, 'each origin must be scheme://host[:port]')),
    ),
  /**
   * Number of reverse-proxy hops to trust for the client IP (0 = use the socket address).
   * Required explicitly in production: a wrong value either lets clients spoof X-Forwarded-For
   * or makes every request share the proxy's IP (and its rate-limit bucket).
   */
  TRUST_PROXY: Int(0),
  LOG_LEVEL: z.enum(['silent', 'error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_AUTH_PER_MIN: Int(10, 1),
  RATE_LIMIT_SYNC_PER_MIN: Int(60, 1),
  RATE_LIMIT_GLOBAL_PER_MIN: Int(300, 1),
  /** Login/register attempts per normalised email per 15 minutes (on top of the per-IP limit). */
  RATE_LIMIT_EMAIL_PER_15MIN: Int(5, 1),
  /** Concurrent in-flight /sync requests per user (one runs, the rest queue; beyond → 429). */
  SYNC_MAX_IN_FLIGHT_PER_USER: Int(2, 1),
  /** Per-user storage quota for synced rows. */
  SYNC_QUOTA_ROWS: Int(250_000, 1),
  SYNC_QUOTA_BYTES: Int(100 * 1024 * 1024, 1),
});

export type AppConfig = z.infer<typeof EnvSchema>;

export class ConfigError extends Error {
  override name = 'ConfigError';
}

/** Validate the environment. Throws a ConfigError naming the bad keys (never their values). */
export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const parsed = EnvSchema.safeParse(env);
  const problems = parsed.success
    ? []
    : parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
  if (
    env.NODE_ENV === 'production' &&
    (env.TRUST_PROXY === undefined || env.TRUST_PROXY.trim() === '')
  ) {
    problems.push('TRUST_PROXY: must be set explicitly in production (proxy hop count, 0 if none)');
  }
  if (problems.length > 0 || !parsed.success) {
    throw new ConfigError(`Invalid configuration — ${problems.join('; ')}`);
  }
  return parsed.data;
}
