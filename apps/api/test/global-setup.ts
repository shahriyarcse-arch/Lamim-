/**
 * Integration-test database: a throwaway Postgres schema (lamim_test_<random>) inside the
 * Neon database, migrated with `prisma migrate deploy` and dropped afterwards, so the real
 * `public` tables are never touched. Without DATABASE_URL/DIRECT_URL the DB suites skip.
 */
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import type { TestProject } from 'vitest/node';
import { PrismaClient } from '../src/generated/prisma/client';

declare module 'vitest' {
  export interface ProvidedContext {
    dbSchema: string;
  }
}

const apiDir = resolve(import.meta.dirname, '..');
const redact = (s: string) => s.replace(/postgres(ql)?:\/\/\S+/g, '[redacted-url]');

export default async function setup(project: TestProject) {
  config({ path: resolve(apiDir, '../../.env'), quiet: true });
  const direct = process.env.DIRECT_URL;
  if (!process.env.DATABASE_URL || !direct) {
    project.provide('dbSchema', '');
    return;
  }

  const schema = `lamim_test_${randomBytes(6).toString('hex')}`;
  const url = new URL(direct);
  url.searchParams.set('schema', schema);
  try {
    execSync('npx prisma migrate deploy', {
      cwd: apiDir,
      env: { ...process.env, PRISMA_MIGRATE_URL: url.toString() },
      stdio: 'pipe',
    });
  } catch (err) {
    const e = err as { stdout?: Buffer; stderr?: Buffer };
    throw new Error(`migrate deploy failed: ${redact(`${e.stdout ?? ''}${e.stderr ?? ''}`)}`);
  }
  project.provide('dbSchema', schema);

  return async () => {
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: direct }) });
    try {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    } finally {
      await prisma.$disconnect();
    }
  };
}
