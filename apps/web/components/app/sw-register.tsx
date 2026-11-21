'use client';

import { useEffect } from 'react';

export const SW_URL = '/app/sw.js';
export const SW_SCOPE = '/app/';

/** Registers the offline worker once the shell has painted (production builds only). */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const register = () =>
      navigator.serviceWorker
        .register(SW_URL, { scope: SW_SCOPE, updateViaCache: 'none' })
        .catch((error: unknown) =>
          console.error(JSON.stringify({ event: 'sw.register.failed', message: String(error) })),
        );
    if (document.readyState === 'complete') void register();
    else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}
