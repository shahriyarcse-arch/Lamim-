const CACHE_NAME = 'lamim-v238';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/manual.css',
  './js/manual.js'
];

// Install: Cache core shell + best-effort precache of every local CSS/JS
// referenced by index.html, so the app is fully usable offline immediately
// after install (no need for a prior online visit). Promise.allSettled keeps a
// single missing asset from aborting the whole install.
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(CORE_ASSETS.map((u) => cache.add(u)));
    try {
      const html = await (await fetch('./index.html', { cache: 'no-cache' })).text();
      const urls = [...html.matchAll(/(?:href|src)="([^"]+\.(?:css|js|png|svg|ico|webp|json)[^"]*)"/g)]
        .map((m) => m[1])
        .filter((u) => !/^https?:/i.test(u) && !u.startsWith('//'));
      await Promise.allSettled(
        urls.map((u) => cache.add(new URL(u, self.location.href).href))
      );
    } catch (_) { /* offline install — shell-only fallback is fine */ }
  })());
  self.skipWaiting();
});

// Activate: Cleanup ALL old caches & claim clients immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)));
    }).then(() => {
      // Notify ALL open tabs that a new version is active
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME }));
      });
    })
  );
  self.clients.claim();
});

// Fetch: Smart Strategy
// - Navigation (HTML): Network-First (always get latest)
// - Assets (JS/CSS/etc): Stale-While-Revalidate (fast + auto-update)
self.addEventListener('fetch', (e) => {
  // Only handle HTTP/HTTPS requests (ignores chrome-extension://, data:, etc.)
  if (!e.request.url.startsWith('http')) return;

  // Skip external database, dynamic API, and Google API calls to prevent stale data
  const skipUrls = [
    '/api/',
    'scanner.tradingview.com',
    'api.bigdatacloud.net',
    'ipwho.is',
    'ipinfo.io',
    'get.geojs.io',
    'freeipapi.com',
    'api.ipapi.is',
    'googleapis.com'
  ];
  if (skipUrls.some(url => e.request.url.includes(url))) return;

  // NAVIGATION REQUESTS (HTML pages) → Network-First
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request, { ignoreSearch: true }).then((cached) => cached || caches.match('./index.html', { ignoreSearch: true }) || caches.match('index.html'))) // Fallback to cache or index.html if offline
    );
    return;
  }

  // LOCAL ASSETS (JS, CSS, images, verses.json) → NETWORK-FIRST with cache fallback
  // Every load revalidates against the server (HTTP cache + ETag keeps it cheap),
  // so new deploys are picked up on the very next launch on ANY device.
  // Offline still works — the cached copy is served when the network is unavailable.
  const isLocalAsset = e.request.url.startsWith(self.location.origin);
  if (isLocalAsset) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || new Response('Offline – resource unavailable', { status: 503, statusText: 'Service Unavailable' })))
    );
    return;
  }

  // EXTERNAL STATIC ASSETS (fonts, CDN icons, etc.) → Stale-While-Revalidate
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return res;
      }).catch(() => new Response('Offline', { status: 503, statusText: 'Service Unavailable' }));

      return cached || networkFetch;
    })
  );
});

// Notification Click Handler: Opens/focuses PWA app on Salah section on notification tap
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./index.html?section=salah');
    })
  );
});
