import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/app-shell';

export const metadata: Metadata = {
  title: 'Lamim App',
  robots: { index: false, follow: false },
  manifest: '/app/manifest.json',
  icons: {
    icon: [{ url: '/app/icons/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/app/icons/icon-180x180.png', sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: 'Lamim', statusBarStyle: 'default' },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
