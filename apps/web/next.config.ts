import { createHash, randomUUID } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

/** One revision per build: precached shell pages refresh whenever a new worker ships. */
const shellRevision = randomUUID();

/**
 * Public files to precache (manifest, icons), content-hashed. Built here because Serwist's
 * own public-dir scan is skipped whenever additionalPrecacheEntries is set.
 */
function publicPrecacheEntries(): { url: string; revision: string }[] {
  const publicDir = path.join(process.cwd(), 'public');
  const generated = /(^|\/)(sw\.js(\.map)?|swe-worker-[^/]*)$/;
  return readdirSync(publicDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(publicDir, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'),
    )
    .filter((rel) => !generated.test(rel))
    .map((rel) => ({
      url: `/${rel}`,
      revision: createHash('sha256')
        .update(readFileSync(path.join(publicDir, rel)))
        .digest('hex')
        .slice(0, 16),
    }));
}

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  // public/app/sw.js → served at /app/sw.js, whose default max scope is /app/ (legacy URL).
  swDest: 'public/app/sw.js',
  swUrl: '/app/sw.js',
  scope: '/app/',
  // Registered from the /app shell only (components/app/sw-register.tsx), never from marketing.
  register: false,
  // Workers in dev cause stale-asset confusion; verify offline with `next build && next start`.
  disable: process.env.NODE_ENV === 'development',
  additionalPrecacheEntries: [
    ...publicPrecacheEntries(),
    ...['/app/home', '/app/salah', '/app/dhikr', '/app/~offline'].map((url) => ({
      url,
      revision: shellRevision,
    })),
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Internal workspace packages ship TypeScript source; Next compiles them.
  transpilePackages: ['@lamim/core', '@lamim/db'],
  // '/app' (no slash) is outside the worker scope '/app/', so every in-app route lives below it.
  async redirects() {
    return [{ source: '/app', destination: '/app/home', permanent: false }];
  },
  async headers() {
    return [
      {
        source: '/app/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/app/' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
