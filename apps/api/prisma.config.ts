import { resolve } from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Secrets live in the monorepo root .env (never committed). The CLI (migrate, db pull)
// talks to Neon over the direct, non-pooled connection. PRISMA_MIGRATE_URL overrides it
// (the integration tests point it at an isolated throwaway schema).
config({ path: resolve(import.meta.dirname, '../../.env'), quiet: true });

const url = process.env.PRISMA_MIGRATE_URL ?? process.env.DIRECT_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  ...(url ? { datasource: { url } } : {}),
});
