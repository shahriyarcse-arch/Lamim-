/// <reference lib="webworker" />
/**
 * Lamim service worker (Serwist), served at /app/sw.js with scope /app/.
 * Same URL as the legacy worker, so installed PWAs upgrade in place.
 *
 * - Precache: every build asset (JS/CSS chunks, self-hosted next/font files incl.
 *   Bengali + Arabic subsets), public files (manifest, icons) and the /app shell pages.
 * - Runtime: @serwist/next defaults (RSC payloads, images, static resources).
 * - Fallback: uncached /app navigations render the offline page.
 */
import { defaultCache } from '@serwist/next/worker';
import { Serwist, type PrecacheEntry, type SerwistGlobalConfig } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/** Caches written by the vanilla app's worker (lamim-app-v2.x). */
const LEGACY_CACHE_PREFIX = 'lamim-app-';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: '/app/~offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith(LEGACY_CACHE_PREFIX)).map((k) => caches.delete(k)),
        ),
      ),
  );
});

serwist.addEventListeners();
