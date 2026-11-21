'use client';

import { useEffect } from 'react';

// Route-level error boundary. Rendered outside the app context, so copy is static English
// plus Bengali; data lives in IndexedDB and is unaffected by a render error.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({ event: 'app.render.failed', message: error.message, digest: error.digest }),
    );
  }, [error]);

  return (
    <div role="alert" className="grid min-h-[60dvh] place-items-center px-4">
      <div className="grid max-w-sm gap-4 rounded-lg border border-border bg-surface p-6 text-center shadow-card">
        <h1 className="text-h3 font-semibold text-fg">
          Something went wrong · কিছু একটা সমস্যা হয়েছে
        </h1>
        <p className="text-body text-fg-muted">Your data is safe on this device.</p>
        <button
          type="button"
          onClick={reset}
          className="justify-self-center rounded-pill bg-cerulean-strong px-6 py-2 font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95"
        >
          Try again · আবার চেষ্টা করুন
        </button>
      </div>
    </div>
  );
}
