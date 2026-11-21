import type { Metadata, Viewport } from 'next';
import { Amiri_Quran, Noto_Sans_Bengali, Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

// Self-hosted at build time by next/font: no runtime request to Google, works offline.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-bengali',
  display: 'swap',
  preload: false, // fetched only when Bengali text renders
});

const amiriQuran = Amiri_Quran({
  subsets: ['arabic'],
  weight: '400',
  variable: '--font-amiri-quran',
  display: 'swap',
  preload: false, // fetched only when Quranic text renders
});

export const metadata: Metadata = {
  title: 'Lamim',
  description: 'Precision Islamic Life Operating System',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#070b14' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${notoBengali.variable} ${amiriQuran.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
