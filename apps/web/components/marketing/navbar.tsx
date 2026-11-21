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
        className="mx-auto w-full max-w-6xl min-h-[4rem] px-3.5 sm:px-5 py-2 flex items-center justify-between gap-3 sm:gap-4 rounded-full bg-app/80 backdrop-blur-2xl border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] pointer-events-auto transition-all"
      >
        {/* Brand Logo & Social Proof Badge */}
        <div className="flex items-center gap-3">
          <Link href={paths.home} className="flex items-center gap-2.5 group">
            {/* Luminous Logo Emblem */}
            <span className="size-9 rounded-full bg-gradient-to-tr from-terracotta via-violet to-azure p-[1px] shadow-[0_0_16px_rgba(0,124,211,0.35)] transition-transform duration-300 group-hover:scale-105">
              <span className="size-full rounded-full bg-app flex items-center justify-center text-white">
                <svg
                  className="size-4.5 text-azure"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 1 12 2z" />
                </svg>
              </span>
            </span>
            <span className="bg-celestial bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Lamim
            </span>
          </Link>

          {/* Sellsull-style Proof Badge */}
          <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-fg/75 backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative size-2 rounded-full bg-emerald-400" />
            </span>
            <span>{lang === 'bn' ? '১০০% অফলাইন ও প্রাইভেট' : '100% Offline & Private'}</span>
          </div>
        </div>

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
            className="group inline-flex items-center justify-center gap-2.5 pl-4 sm:pl-5 pr-1.5 py-1.5 rounded-full bg-gradient-to-r from-azure via-iris to-violet text-white text-xs sm:text-sm font-bold shadow-[0_0_24px_rgba(0,124,211,0.35)] hover:shadow-[0_0_32px_rgba(0,124,211,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span>{c.nav.openApp}</span>
            <span className="size-7 sm:size-8 rounded-full bg-white/20 grid place-items-center text-white transition-transform duration-200 group-hover:translate-x-0.5">
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
        <div className="md:hidden mt-2 max-w-sm mx-auto p-4 rounded-3xl bg-app/95 backdrop-blur-2xl border border-white/12 shadow-2xl flex flex-col gap-3 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
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
              className="flex-1 text-center py-2 px-4 rounded-full bg-gradient-to-r from-azure to-violet text-white text-xs font-bold shadow-md"
            >
              {c.nav.openApp}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
