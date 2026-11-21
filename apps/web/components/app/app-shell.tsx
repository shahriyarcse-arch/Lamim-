'use client';

import type { ReactNode } from 'react';
import { AppProvider } from './app-provider';
import { BottomDock } from './bottom-dock';
import { ThemeController, ThemeToggle } from './theme';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ThemeController />
      <div className="grid min-h-dvh grid-rows-[auto_1fr] bg-app">
        <header className="sticky top-0 z-(--z-dock) border-b border-border bg-app/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
            <span className="bg-celestial bg-clip-text text-h3 font-bold text-transparent">
              Lamim
            </span>
            <ThemeToggle />
          </div>
        </header>
        {/* Bottom padding keeps content clear of the fixed dock. */}
        <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-32">{children}</main>
      </div>
      <BottomDock />
    </AppProvider>
  );
}
