import { Anek_Bangla, Geist, Instrument_Serif } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { DAILY_AYAT } from '@/lib/daily-ayah';
import {
  LANDING_AYAH_REF,
  MARKETING_COPY,
  type MarketingCopy,
  type MarketingLang,
} from '@/lib/marketing-content';
import { MARKETING_PATHS } from '@/lib/site';
import { LandingMotion } from './landing-motion';
import { Navbar } from './navbar';
import { Device, SCREENS, ScreenDefs, type ScreenId } from './phone-screens';

// Landing-only faces, self-hosted at build time by next/font (no runtime Google request).
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument',
  display: 'swap',
});
const anek = Anek_Bangla({
  subsets: ['bengali'],
  variable: '--font-anek',
  display: 'swap',
  preload: false, // fetched only when Bengali text renders
});

type FeatureId = MarketingCopy['features'][number]['id'];

/** Per-module accent (brand colors only) and the app screen that shows it. */
const FEATURE_STYLE: Record<FeatureId, { eyebrow: string; dot: string; screen: ScreenId }> = {
  salah: { eyebrow: 'text-cerulean-text', dot: 'bg-cerulean', screen: 'salah' },
  spirit: { eyebrow: 'text-violet-text', dot: 'bg-violet', screen: 'home' },
  dhikr: { eyebrow: 'text-iris-text', dot: 'bg-iris', screen: 'dhikr' },
  finance: { eyebrow: 'text-raspberry-text', dot: 'bg-raspberry', screen: 'finance' },
  habits: { eyebrow: 'text-terracotta-text', dot: 'bg-terracotta', screen: 'habits' },
};

const SCREEN_LABEL: Record<ScreenId, { en: string; bn: string }> = {
  home: {
    en: 'Lamim home: next prayer countdown, Spirit Score and today’s prayers',
    bn: 'লামিম হোম: পরবর্তী সালাত, আধ্যাত্মিক স্কোর ও আজকের সালাত',
  },
  salah: {
    en: 'Salah screen: next prayer countdown and each prayer logged as Jama’at, alone, qaza or missed',
    bn: 'সালাত স্ক্রিন: পরবর্তী সালাত ও প্রতিটি সালাতের অবস্থা',
  },
  dhikr: {
    en: 'Dhikr counter at 21 of 33 with a progress ring',
    bn: 'যিকির কাউন্টার: ৩৩-এর মধ্যে ২১',
  },
  finance: {
    en: 'Finance screen: available cash, monthly income and spending, budget and top spending',
    bn: 'অর্থ স্ক্রিন: হাতে থাকা টাকা, মাসিক আয়-ব্যয়, বাজেট ও প্রধান খরচ',
  },
  habits: {
    en: 'Habit timer: 23 days clean with rank progress and a breathing exercise',
    bn: 'অভ্যাস টাইমার: ২৩ দিন পরিচ্ছন্ন, পদমর্যাদা ও শ্বাসের ব্যায়াম',
  },
};

/** Chips that float around the hero devices at different depths (parallax). */
const HERO_CHIPS: { id: FeatureId; pos: string; depth: number; delay: string }[] = [
  { id: 'salah', pos: '-left-4 top-[14%] md:-left-12', depth: 0.9, delay: '[animation-delay:0s]' },
  {
    id: 'dhikr',
    pos: '-right-2 top-[34%] md:-right-10',
    depth: 0.5,
    delay: '[animation-delay:-2s]',
  },
  {
    id: 'finance',
    pos: '-left-2 bottom-[26%] md:-left-16',
    depth: 0.7,
    delay: '[animation-delay:-4s]',
  },
  {
    id: 'habits',
    pos: '-right-2 bottom-[8%] md:-right-8',
    depth: 1.1,
    delay: '[animation-delay:-3s]',
  },
];

const CONTAINER = 'mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12';
const SECTION = 'relative py-24 md:py-32 lg:py-40';
const PRIMARY =
  'group inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-cerulean-strong px-6 text-body font-semibold text-white shadow-[0_8px_32px_rgb(0_133_193/0.35)] transition-[box-shadow,filter] duration-200 hover:shadow-[0_8px_48px_rgb(0_133_193/0.6)] hover:brightness-110 focus-visible:brightness-110 active:brightness-95';
const SECONDARY =
  'glass inline-flex min-h-12 items-center justify-center rounded-pill px-6 text-body font-semibold text-fg transition-colors duration-200 hover:bg-surface-subtle focus-visible:bg-surface-subtle';
const FOOT_LINK =
  'inline-flex min-h-11 items-center text-body text-fg-muted transition-colors duration-200 hover:text-fg focus-visible:text-fg';
const EYEBROW = 'text-caption font-semibold tracking-eyebrow uppercase';
const SECTION_TITLE = 'text-section font-semibold tracking-display text-balance text-fg';

function Arrow({ up = false }: { up?: boolean }) {
  return (
    <svg
      aria-hidden
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${up ? '-rotate-90 group-hover:-translate-y-1' : 'group-hover:translate-x-1'}`}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** The headline's accent phrase: serif italic in the brand gradient (display size only). */
function AccentTitle({ title, accent }: { title: string; accent: string }) {
  const i = title.indexOf(accent);
  if (i < 0) return <>{title}</>;
  // Keep trailing punctuation inside the accent so it shares the serif and gradient.
  let end = i + accent.length;
  while (end < title.length && /[.,!?।]/.test(title[end]!)) end++;
  return (
    <>
      {title.slice(0, i)}
      <span className="font-accent bg-celestial bg-clip-text pr-2 text-transparent">
        {title.slice(i, end)}
      </span>
      {title.slice(end)}
    </>
  );
}

function Dot({ className }: { className: string }) {
  return <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-pill ${className}`} />;
}

/** Eight-point star lattice (khatam) — the geometric language of Islamic art; decorative. */
function GeoPattern({ id, className = '' }: { id: string; className?: string }) {
  return (
    <svg aria-hidden className={`pointer-events-none absolute inset-0 size-full ${className}`}>
      <defs>
        <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="0.75">
            <path d="M32 8 39 25 56 32 39 39 32 56 25 39 8 32 25 25Z" />
            <rect x="20" y="20" width="24" height="24" transform="rotate(45 32 32)" />
            <circle cx="32" cy="32" r="4" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Drifting brand-color aurora and stars behind a section; decorative. */
function Sky({ intensity = 'soft' }: { intensity?: 'soft' | 'bright' }) {
  const o = intensity === 'bright' ? 'opacity-50' : 'opacity-30';
  return (
    <div
      aria-hidden
      className="mask-fade-y pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="bg-stars absolute inset-0 opacity-60" />
      <div data-parallax="-20" className="absolute -top-1/4 -left-1/4 size-[60vmax]">
        <span className={`bg-dusk animate-aurora absolute inset-0 rounded-full blur-3xl ${o}`} />
      </div>
      <div data-parallax="24" className="absolute -right-1/4 -bottom-1/3 size-[56vmax]">
        <span
          className={`bg-dawn animate-aurora absolute inset-0 rounded-full blur-3xl [animation-delay:-13s] ${o}`}
        />
      </div>
    </div>
  );
}

function Section({
  id,
  children,
  labelledBy,
  className = '',
}: {
  id?: string;
  children: ReactNode;
  labelledBy: string;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${SECTION} scroll-mt-16 ${className}`}
    >
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

function Screen({ id, lang }: { id: ScreenId; lang: MarketingLang }) {
  const S = SCREENS[id];
  return <S lang={lang} />;
}

const PRIVACY_ICONS = [
  // on your device
  'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm4 15h2',
  // no account
  'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 11-5.7M17 17l4 4m0-4-4 4',
  // no ads, no tracking
  'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.6 9.6 0 0 1 12 5c5 0 9 5 9 7a9 9 0 0 1-2.2 3.4M6.6 6.6C4.4 8 3 10.4 3 12c0 2 4 7 9 7a9.4 9.4 0 0 0 4.4-1.1',
  // works offline
  'M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.4 5.1M5 12.5a10 10 0 0 1 2.9-1.8M19 12.5a10 10 0 0 0-3.7-2.1M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18',
];

export function LandingPage({ lang }: { lang: MarketingLang }) {
  const c = MARKETING_COPY[lang];
  const paths = MARKETING_PATHS[lang];
  const other: MarketingLang = lang === 'en' ? 'bn' : 'en';
  const ayah = DAILY_AYAT.find((a) => a.ref === LANDING_AYAH_REF) ?? DAILY_AYAT[0]!;
  const nf = new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US');
  const ayahRef = ayah.ref.replace(/\d+/g, (n) => nf.format(Number(n)));
  const featureById = new Map(c.features.map((f) => [f.id, f]));
  const two = (n: number) => nf.format(n).padStart(2, nf.format(0));

  return (
    <div
      id="top"
      data-landing
      data-theme="dark"
      lang={lang}
      className={`${geist.variable} ${instrument.variable} ${anek.variable} relative isolate min-h-dvh overflow-x-clip bg-app text-fg antialiased`}
    >
      <LandingMotion />
      <ScreenDefs />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-toast) focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2"
      >
        {lang === 'bn' ? 'মূল অংশে যান' : 'Skip to content'}
      </a>

      {/* Header (Floating island capsule, inspired by sellsull.com) */}
      <Navbar lang={lang} c={c} paths={paths} other={other} />

      <main id="main">
        {/* Hero — server-rendered and fully visible; motion only adds transforms */}
        <section
          data-anim="hero"
          aria-labelledby="hero-title"
          className="relative isolate overflow-hidden pt-24 pb-24 md:pt-32 md:pb-32"
        >
          <Sky intensity="bright" />
          <div className={`${CONTAINER} grid items-center gap-16 lg:grid-cols-12`}>
            <div className="grid gap-8 lg:col-span-7">
              <p
                data-anim="hero-item"
                className={`${EYEBROW} glass inline-flex w-fit items-center gap-2 rounded-pill px-4 py-2 text-fg-muted`}
              >
                <span aria-hidden className="relative flex size-2">
                  <span className="animate-beacon absolute inset-0 rounded-pill bg-cerulean" />
                  <span className="relative size-2 rounded-pill bg-cerulean" />
                </span>
                {c.hero.eyebrow}
              </p>
              <h1
                id="hero-title"
                data-anim="hero-item"
                className="text-hero font-semibold tracking-tightest text-balance text-fg"
              >
                <AccentTitle title={c.hero.title} accent={c.hero.titleAccent} />
              </h1>
              <p data-anim="hero-item" className="max-w-xl text-lead text-fg-muted">
                {c.hero.body}
              </p>
              <div data-anim="hero-item" className="flex flex-wrap gap-4">
                <Link href="/app/home" data-magnetic className={PRIMARY}>
                  {c.hero.primaryCta}
                  <Arrow />
                </Link>
                <a href="#features" data-magnetic className={SECONDARY}>
                  {c.hero.secondaryCta}
                </a>
              </div>
              <p data-anim="hero-item" className="text-caption text-fg-muted">
                {c.hero.note}
              </p>
            </div>

            {/* 3D device stack: intro (stage) → scroll (phone) → pointer (tilt), one transform each */}
            <div className="lg:col-span-5">
              <div data-anim="hero-stage" className="relative mx-auto w-full max-w-80">
                <div data-anim="hero-phone" className="[transform-style:preserve-3d]">
                  <div data-anim="hero-tilt" className="relative [transform-style:preserve-3d]">
                    <svg
                      aria-hidden
                      viewBox="0 0 400 400"
                      className="animate-orbit pointer-events-none absolute top-1/2 left-1/2 -z-10 w-[165%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-60"
                    >
                      <defs>
                        <linearGradient id="hero-orbit" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="var(--color-terracotta)" />
                          <stop offset="50%" stopColor="var(--color-violet)" />
                          <stop offset="100%" stopColor="var(--color-cerulean)" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="200"
                        cy="200"
                        r="190"
                        fill="none"
                        stroke="url(#hero-orbit)"
                        strokeWidth="1"
                        strokeDasharray="2 10"
                      />
                      <circle cx="200" cy="10" r="5" fill="var(--color-raspberry)" />
                      <circle cx="390" cy="200" r="4" fill="var(--color-azure)" />
                    </svg>
                    {/* Fanned devices behind (static pose in CSS individual transforms) */}
                    <div
                      aria-hidden
                      className="absolute inset-0 -z-10 [rotate:-9deg] [scale:0.84] [translate:-46%_6%] max-sm:[translate:-30%_6%]"
                    >
                      <div data-anim="fan-left" className="opacity-80 brightness-75">
                        <Device label="">
                          <Screen id="salah" lang={lang} />
                        </Device>
                      </div>
                    </div>
                    <div
                      aria-hidden
                      className="absolute inset-0 -z-10 [rotate:9deg] [scale:0.84] [translate:46%_6%] max-sm:[translate:30%_6%]"
                    >
                      <div data-anim="fan-right" className="opacity-80 brightness-75">
                        <Device label="">
                          <Screen id="finance" lang={lang} />
                        </Device>
                      </div>
                    </div>
                    <Device label={SCREEN_LABEL.home[lang]}>
                      <Screen id="home" lang={lang} />
                    </Device>
                    {HERO_CHIPS.map((chip) => {
                      const f = featureById.get(chip.id);
                      if (!f) return null;
                      return (
                        <div
                          key={chip.id}
                          aria-hidden
                          data-depth={chip.depth}
                          className={`absolute ${chip.pos}`}
                        >
                          <span
                            className={`animate-float flex items-center gap-2 rounded-pill border border-border bg-surface/95 px-4 py-2 text-caption font-semibold text-fg shadow-overlay backdrop-blur-md ${chip.delay}`}
                          >
                            <span className={`size-2 rounded-pill ${FEATURE_STYLE[chip.id].dot}`} />
                            {f.eyebrow}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee — the rhythm of the day; decorative */}
        <div aria-hidden className="mask-fade-x overflow-hidden border-y border-border py-8">
          <div className="animate-marquee flex w-max items-center gap-12">
            {[...c.marquee, ...c.marquee].map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="flex items-center gap-12 text-section font-semibold tracking-display whitespace-nowrap"
              >
                <span
                  className={
                    i % 2 === 1
                      ? 'font-accent bg-celestial bg-clip-text pr-2 text-transparent'
                      : 'text-fg-muted'
                  }
                >
                  {word}
                </span>
                <svg viewBox="0 0 24 24" className="size-6 text-violet">
                  <path
                    fill="currentColor"
                    d="M12 2 14.6 7.4 20.5 8.2 16.2 12.3 17.3 18.2 12 15.4 6.7 18.2 7.8 12.3 3.5 8.2 9.4 7.4Z"
                  />
                </svg>
              </span>
            ))}
          </div>
        </div>

        {/* Essence — words light up as you scroll */}
        <Section labelledBy="essence-title">
          <div data-anim="essence" className="mx-auto grid max-w-5xl gap-8 text-center">
            <h2 id="essence-title" className={`${EYEBROW} text-violet-text`}>
              {c.essence.title}
            </h2>
            <p className="text-statement font-medium tracking-display text-balance text-fg">
              {c.essence.body.split(' ').map((w, i) => (
                <span key={i} data-anim="word">
                  {w}{' '}
                </span>
              ))}
            </p>
          </div>
        </Section>

        {/* Features — sticky device story on desktop, inline devices on mobile */}
        <section
          id="features"
          aria-labelledby="features-title"
          className="relative scroll-mt-16 py-16 md:py-24"
        >
          <div className={CONTAINER}>
            <h2 id="features-title" className="sr-only">
              {c.nav.features}
            </h2>
            <div data-story data-active="0" className="grid gap-16 lg:grid-cols-12 lg:gap-8">
              <div className="grid gap-24 lg:col-span-6 lg:gap-0">
                {c.features.map((f, i) => {
                  const style = FEATURE_STYLE[f.id];
                  return (
                    <article
                      key={f.id}
                      id={`feature-${f.id}`}
                      data-step={i}
                      aria-labelledby={`feature-title-${f.id}`}
                      className="grid scroll-mt-24 content-center gap-12 lg:min-h-[85vh]"
                    >
                      <div data-anim="reveal" className="grid max-w-xl gap-6">
                        <p className={`${EYEBROW} flex items-center gap-4 ${style.eyebrow}`}>
                          <span
                            aria-hidden
                            className="font-accent bg-celestial bg-clip-text pr-1 text-h1 text-transparent"
                          >
                            {two(i + 1)}
                          </span>
                          {f.eyebrow}
                        </p>
                        <h3
                          id={`feature-title-${f.id}`}
                          className="text-h1 font-semibold tracking-display text-balance text-fg"
                        >
                          {f.title}
                        </h3>
                        <p className="text-lead text-fg-muted">{f.body}</p>
                        <ul className="grid gap-4 border-t border-border pt-6">
                          {f.points.map((p) => (
                            <li key={p} className="flex gap-4 text-body text-fg">
                              <Dot className={style.dot} />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="lg:hidden">
                        <div data-anim="feature-phone" data-dir={i % 2 ? '-1' : '1'}>
                          <Device label={SCREEN_LABEL[style.screen][lang]} className="max-w-72">
                            <Screen id={style.screen} lang={lang} />
                          </Device>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div aria-hidden className="relative hidden lg:col-span-6 lg:block">
                <div className="sticky top-16 grid h-[calc(100dvh-4rem)] place-items-center">
                  <span className="bg-celestial absolute top-1/2 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl" />
                  <div className="relative flex items-center gap-12">
                    <div data-anim="story-device" className="w-80">
                      {/* One device; its screen swaps per step (CSS [data-active]) */}
                      <Device label="">
                        {c.features.map((f, i) => (
                          <div key={f.id} data-screen={i}>
                            <Screen id={FEATURE_STYLE[f.id].screen} lang={lang} />
                          </div>
                        ))}
                      </Device>
                    </div>
                    <ol className="grid gap-4">
                      {c.features.map((f, i) => (
                        <li key={f.id} className="flex items-center gap-4">
                          <span
                            data-step-dot={i}
                            className={`h-1 w-4 rounded-pill opacity-40 transition-[width,opacity] duration-300 ${FEATURE_STYLE[f.id].dot}`}
                          />
                          <span className="text-caption font-semibold text-fg-muted">
                            {f.eyebrow}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & offline — bento with tilt */}
        <Section id="privacy" labelledBy="privacy-title" className="overflow-hidden">
          <Sky />
          <div className="grid gap-16">
            <div data-anim="reveal" className="grid max-w-3xl gap-6">
              <h2 id="privacy-title" className={SECTION_TITLE}>
                {c.privacy.title}
              </h2>
              <p className="text-lead text-fg-muted">{c.privacy.body}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
              {c.privacy.points.map((p, i) => {
                const big = i === 0;
                const wide = i === 3;
                return (
                  <li
                    key={p.title}
                    data-anim="reveal"
                    className={big ? 'sm:col-span-2 lg:row-span-2' : wide ? 'sm:col-span-2' : ''}
                  >
                    <div
                      data-tilt
                      className={`glass sheen relative grid h-full content-start gap-4 overflow-hidden rounded-xl p-8 transition-colors duration-200 hover:border-azure/40 ${big ? 'lg:content-end' : ''}`}
                    >
                      {big ? (
                        <GeoPattern id="privacy-geo" className="text-iris opacity-20 mask-fade-y" />
                      ) : null}
                      <span
                        aria-hidden
                        className={`relative grid place-items-center rounded-lg bg-azure-strong text-white shadow-[0_0_32px_rgb(0_124_211/0.5)] ${big ? 'size-16' : 'size-12'}`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className={big ? 'size-8' : 'size-6'}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={PRIVACY_ICONS[i] ?? PRIVACY_ICONS[0]} />
                        </svg>
                      </span>
                      <h3
                        className={`relative font-semibold tracking-display text-fg ${big ? 'text-h1' : 'text-h3'}`}
                      >
                        {p.title}
                      </h3>
                      <p className="relative text-body text-fg-muted">{p.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Section>

        {/* Featured ayah — geometric lattice, text on a solid surface for guaranteed contrast */}
        <section
          aria-labelledby="ayah-label"
          className="relative isolate overflow-hidden py-24 md:py-40"
        >
          <div aria-hidden className="absolute inset-0 -z-10">
            <GeoPattern id="ayah-geo" className="mask-fade-y text-violet opacity-25" />
            <div className="bg-celestial absolute inset-x-0 top-1/2 h-1/2 -translate-y-1/2 opacity-40 blur-3xl" />
          </div>
          <div className={CONTAINER}>
            <div data-anim="zoom" className="mx-auto max-w-4xl">
              <figure className="grid gap-8 rounded-xl border border-border bg-surface p-8 text-center shadow-overlay md:p-16">
                <h2 id="ayah-label" className={`${EYEBROW} text-violet-text`}>
                  {c.ayah.label}
                </h2>
                <blockquote className="grid gap-8">
                  <p lang="ar" dir="rtl" className="font-quran text-quran text-fg">
                    {ayah.arabic}
                  </p>
                  <p className="text-statement font-accent text-fg">
                    {lang === 'bn' ? ayah.bn : ayah.en}
                  </p>
                </blockquote>
                <figcaption className="text-caption font-semibold tracking-eyebrow text-fg-muted uppercase">
                  {lang === 'bn' ? `কুরআন ${ayahRef}` : `Qur’an ${ayahRef}`}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Coming soon */}
        <Section labelledBy="soon-title">
          <div className="grid gap-12 lg:grid-cols-12">
            <h2 id="soon-title" data-anim="reveal" className={`${SECTION_TITLE} lg:col-span-4`}>
              {c.comingSoon.title}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2 lg:col-span-8">
              {c.comingSoon.items.map((item, i) => (
                <li key={item.title} data-anim="reveal">
                  <div
                    data-tilt
                    className="sheen grid h-full gap-4 rounded-xl border border-dashed border-border bg-surface/50 p-8"
                  >
                    <span className="font-accent bg-celestial w-fit bg-clip-text pr-1 text-h1 text-transparent">
                      {two(i + 1)}
                    </span>
                    <h3 className="text-h3 font-semibold tracking-display text-fg">{item.title}</h3>
                    <p className="text-body text-fg-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* FAQ — native details/summary, no JS */}
        <Section id="faq" labelledBy="faq-title">
          <div className="grid gap-12 lg:grid-cols-12">
            <h2
              id="faq-title"
              className={`${SECTION_TITLE} lg:sticky lg:top-24 lg:col-span-4 lg:self-start`}
            >
              {c.faq.title}
            </h2>
            <div className="grid gap-2 lg:col-span-8">
              {c.faq.items.map((item) => (
                <details
                  key={item.q}
                  data-anim="reveal"
                  className="group glass rounded-lg px-6 transition-colors duration-200 open:bg-surface-subtle"
                >
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lead font-medium text-fg [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-pill border border-border text-fg-muted transition-transform duration-200 group-open:rotate-45"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="pb-6 text-body text-fg-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Section>

        {/* Final CTA */}
        <section aria-labelledby="final-title" className={`${SECTION} isolate overflow-hidden`}>
          <Sky intensity="bright" />
          <div className={CONTAINER}>
            <div
              data-anim="zoom"
              className="glass relative mx-auto grid max-w-5xl justify-items-center gap-8 overflow-hidden rounded-xl px-6 py-24 text-center shadow-overlay md:px-16"
            >
              <GeoPattern id="final-geo" className="mask-fade-y text-iris opacity-15" />
              <span aria-hidden className="bg-celestial relative h-1 w-24 rounded-pill" />
              <h2 id="final-title" className={`${SECTION_TITLE} relative`}>
                {c.final.title}
              </h2>
              <p className="relative max-w-prose text-lead text-fg-muted">{c.final.body}</p>
              <Link href="/app/home" data-magnetic className={`${PRIMARY} relative`}>
                {c.final.cta}
                <Arrow />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative isolate overflow-hidden border-t border-border pt-24">
        <div
          aria-hidden
          className="bg-celestial absolute -bottom-1/2 left-1/2 -z-10 h-full w-3/4 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        />
        <div className={`${CONTAINER} grid gap-16 lg:grid-cols-12`}>
          <div className="grid content-start gap-6 lg:col-span-5">
            <Link
              href={paths.home}
              className="bg-celestial w-fit bg-clip-text text-h1 font-semibold tracking-display text-transparent"
            >
              Lamim
            </Link>
            <p className="max-w-sm text-lead text-fg-muted">{c.footer.lead}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/app/home" className={PRIMARY}>
                {c.nav.openApp}
                <Arrow />
              </Link>
              <Link
                href={MARKETING_PATHS[other].home}
                hrefLang={other}
                lang={other}
                className={SECONDARY}
              >
                {c.nav.language}
              </Link>
            </div>
          </div>
          <nav
            aria-label={lang === 'bn' ? 'ফুটার' : 'Footer'}
            className="grid gap-12 sm:grid-cols-3 lg:col-span-7"
          >
            <div className="grid content-start gap-2">
              <h2 className={`${EYEBROW} mb-2 text-fg-subtle`}>{c.footer.explore}</h2>
              <a href="#features" className={FOOT_LINK}>
                {c.nav.features}
              </a>
              <a href="#privacy" className={FOOT_LINK}>
                {c.nav.privacy}
              </a>
              <a href="#faq" className={FOOT_LINK}>
                {c.nav.faq}
              </a>
            </div>
            <div className="grid content-start gap-2">
              <h2 className={`${EYEBROW} mb-2 text-fg-subtle`}>{c.footer.modules}</h2>
              {c.features.map((f) => (
                <a key={f.id} href={`#feature-${f.id}`} className={FOOT_LINK}>
                  {f.eyebrow}
                </a>
              ))}
            </div>
            <div className="grid content-start gap-2">
              <h2 className={`${EYEBROW} mb-2 text-fg-subtle`}>{c.footer.more}</h2>
              <Link href={paths.privacy} className={FOOT_LINK}>
                {c.footer.privacyLink}
              </Link>
              <Link href="/app/home" className={FOOT_LINK}>
                {c.nav.openApp}
              </Link>
            </div>
          </nav>
        </div>

        {/* Giant wordmark, rising as the page ends */}
        <div aria-hidden className={`${CONTAINER} mt-24 overflow-hidden`}>
          <p
            data-anim="wordmark"
            className="bg-celestial bg-clip-text text-center text-mega font-semibold tracking-tightest text-transparent opacity-90 select-none"
          >
            Lamim
          </p>
        </div>

        <div className="border-t border-border">
          <div
            className={`${CONTAINER} flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between`}
          >
            <p className="text-caption text-fg-muted">{c.footer.rights}</p>
            <p className="text-caption text-fg-muted">{c.footer.tagline}</p>
            <a
              href="#top"
              className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-pill border border-border px-4 text-caption font-semibold text-fg transition-colors duration-200 hover:bg-surface-subtle"
            >
              {c.footer.backToTop}
              <Arrow up />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
