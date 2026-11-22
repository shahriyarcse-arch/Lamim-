'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { MarketingCopy, MarketingLang } from '@/lib/marketing-content';
import { MARKETING_PATHS } from '@/lib/site';

interface NavbarProps {
  lang: MarketingLang;
  c: MarketingCopy;
  paths: { home: string };
  other: MarketingLang;
}

export function Navbar({ lang, c, paths, other }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-3 inset-x-0 z-(--z-dock) px-3 sm:px-6 pointer-events-none transition-all duration-300">
      {/* Reading Progress Line */}
      <span
        aria-hidden
        data-anim="progress"
        className="bg-celestial absolute inset-x-4 sm:inset-x-8 -top-1.5 h-0.5 origin-left scale-x-0 rounded-full"
      />

      {/* Floating Capsule Shell (Inspired by sellsull.com) */}
      <nav
        aria-label={lang === 'bn' ? 'প্রধান মেনু' : 'Primary Navigation'}
        className="tone-night mx-auto w-full max-w-6xl min-h-[4rem] px-3.5 sm:px-5 py-2 flex items-center justify-between gap-3 sm:gap-4 rounded-full bg-app/80 backdrop-blur-2xl border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] pointer-events-auto transition-all"
      >
        {/* Brand Logo */}
        <Link href={paths.home} className="flex items-center gap-3 group">
          {/* Real Lamim Ribbon "L" Logo in Celestial Twilight Gradient */}
          <span className="size-9 rounded-2xl bg-white/[0.05] border border-white/10 p-1.5 shadow-[0_0_20px_rgba(0,124,211,0.25)] grid place-items-center transition-all duration-300 group-hover:scale-105 group-hover:border-white/20 group-hover:shadow-[0_0_25px_rgba(0,124,211,0.45)]">
            <svg viewBox="130 60 280 335" className="size-full" aria-hidden>
              <defs>
                <linearGradient id="nav_vG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C25E5E" />
                  <stop offset="100%" stopColor="#A45EAA" />
                </linearGradient>
                <linearGradient id="nav_fG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C05683" />
                  <stop offset="45%" stopColor="#A45EAA" />
                  <stop offset="100%" stopColor="#656EC9" />
                </linearGradient>
                <linearGradient id="nav_sG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D1B4E" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.98" />
                </linearGradient>
                <linearGradient id="nav_hG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#656EC9" />
                  <stop offset="50%" stopColor="#007CD3" />
                  <stop offset="100%" stopColor="#00A3E0" />
                </linearGradient>
                <linearGradient id="nav_spG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M140,115 C140,82 172,60 205,75 L240,92 C252,98 252,112 252,122 L252,325 L140,375Z"
                fill="url(#nav_vG)"
              />
              <path d="M175,255 L252,300 L252,385 L175,340Z" fill="url(#nav_sG)" />
              <path
                d="M140,195 C140,182 150,175 162,180 L252,130 L252,325 L140,375Z"
                fill="url(#nav_fG)"
                opacity="0.97"
              />
              <path d="M140,195 L252,130 L232,118 L140,172Z" fill="url(#nav_spG)" opacity="0.8" />
              <path
                d="M175,300 L350,300 C382,300 400,320 400,344 C400,368 382,385 350,385 L175,385Z"
                fill="url(#nav_hG)"
              />
              <path
                d="M175,300 L355,300 C367,300 376,307 376,314 L175,314Z"
                fill="url(#nav_spG)"
                opacity="0.5"
              />
            </svg>
          </span>
          <span className="font-display bg-celestial bg-clip-text pr-1 text-h3 text-transparent">
            Lamim
          </span>
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
          {(
            [
              ['#features', c.nav.features],
              ['#privacy', c.nav.privacy],
              ['#faq', c.nav.faq],
            ] as const
          ).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium text-fg-muted hover:text-fg hover:bg-white/10 transition-all duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right Actions: Language Switch & Sellsull Open App CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <Link
            href={MARKETING_PATHS[other].home}
            hrefLang={other}
            lang={other}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/[0.03] text-xs font-semibold text-fg/80 hover:text-fg hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            <svg
              className="size-3.5 opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
            </svg>
            <span>{c.nav.language}</span>
          </Link>

          {/* Sellsull Signature CTA Button with Arrow Bubble */}
          <Link
            href="/app/home"
            className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-lime py-1.5 pr-1.5 pl-4 text-xs font-bold text-ink shadow-raised transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 sm:pl-5 sm:text-sm"
          >
            <span>{c.nav.openApp}</span>
            <span className="bg-ink size-7 sm:size-8 rounded-full grid place-items-center text-lime transition-transform duration-200 group-hover:translate-x-0.5">
              <svg
                className="size-3.5 sm:size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            className="md:hidden size-10 rounded-full border border-white/10 bg-white/[0.04] grid place-items-center text-fg hover:bg-white/10 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Drop-down Island) */}
      {mobileOpen && (
        <div className="tone-night md:hidden mt-2 max-w-sm mx-auto p-4 rounded-3xl bg-app/95 backdrop-blur-2xl border border-white/12 shadow-2xl flex flex-col gap-3 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1">
            {(
              [
                ['#features', c.nav.features],
                ['#privacy', c.nav.privacy],
                ['#faq', c.nav.faq],
              ] as const
            ).map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-2xl text-body font-medium text-fg-muted hover:text-fg hover:bg-white/5 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="h-px bg-white/10 my-1" />
          <div className="flex items-center justify-between gap-2">
            <Link
              href={MARKETING_PATHS[other].home}
              hrefLang={other}
              lang={other}
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 text-xs font-semibold text-fg/80 hover:bg-white/5"
            >
              <svg
                className="size-3.5 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
              </svg>
              <span>{c.nav.language}</span>
            </Link>
            <Link
              href="/app/home"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center py-2 px-4 rounded-full bg-lime text-ink text-xs font-bold shadow-md"
            >
              {c.nav.openApp}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
