self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Only delete caches NOT owned by the app shell (lamim-*) so the PWA's
    // offline cache (lamim-v162 and friends) is never wiped by this cleanup.
    const stale = keys.filter((key) => !key.startsWith('lamim-'));
    await Promise.all(stale.map((key) => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: 'LAMIM_ROOT_CLEANED' }));
    await self.registration.unregister();
  })());
});
