import {
  Anek_Bangla,
  Instrument_Sans,
  Instrument_Serif,
  Noto_Serif_Bengali,
} from 'next/font/google';
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
// Editorial pairing: Instrument Serif headings + Instrument Sans text; Bengali uses
// Noto Serif Bengali for headings and Anek Bangla for reading.
const iserif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-iserif',
  display: 'swap',
});
const isans = Instrument_Sans({ subsets: ['latin'], variable: '--font-isans', display: 'swap' });
const anek = Anek_Bangla({
  subsets: ['bengali'],
  variable: '--font-anek',
  display: 'swap',
  preload: false, // fetched only when Bengali text renders
});
const serifBn = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['500', '600'],
  variable: '--font-serif-bn',
  display: 'swap',
  preload: false,
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
    bn: 'লামিম হোম: পরের ওয়াক্তের কাউন্টডাউন, স্পিরিট স্কোর আর আজকের সালাত',
  },
  salah: {
    en: 'Salah screen: next prayer countdown and each prayer marked as Jama’at, alone, qaza or missed',
    bn: 'সালাত স্ক্রিন: পরের ওয়াক্ত আর প্রতিটি সালাত জামাতে, একা, কাযা নাকি ছুটে গেছে',
  },
  dhikr: {
    en: 'Dhikr counter at 21 of 33 with a progress ring',
    bn: 'যিকির কাউন্টার: ৩৩-এর মধ্যে ২১',
  },
  finance: {
    en: 'Finance screen: cash in hand, this month’s income and spending, budget and top spending',
    bn: 'হিসাব স্ক্রিন: হাতে থাকা টাকা, এ মাসের আয়-খরচ, বাজেট আর বেশি খরচের খাত',
  },
  habits: {
    en: 'Habit timer: 23 days clean with rank progress and a breathing exercise',
    bn: 'অভ্যাস টাইমার: ২৩ দিন ধরে বিরত, পরের ধাপ আর শ্বাসের অনুশীলন',
  },
};

/** Chips that float in front of the hero devices; depth drives scroll parallax. */
const HERO_CHIPS: { id: FeatureId; pos: string; depth: number; delay: string }[] = [
  { id: 'salah', pos: '-left-6 top-[12%] md:-left-16', depth: 0.9, delay: '' },
  {
    id: 'dhikr',
    pos: '-right-4 top-[36%] md:-right-14',
    depth: 0.5,
    delay: '[animation-delay:-2s]',
  },
  {
    id: 'finance',
    pos: '-left-4 bottom-[28%] md:-left-20',
    depth: 0.7,
    delay: '[animation-delay:-4s]',
  },
  {
    id: 'habits',
    pos: '-right-4 bottom-[8%] md:-right-10',
    depth: 1.1,
    delay: '[animation-delay:-3s]',
  },
];

const CONTAINER = 'mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12';
const SECTION = 'relative py-24 md:py-32';
/** Inverts per tone: cream pill on night sections, ink pill on cream sections. */
const PRIMARY =
  'group inline-flex min-h-12 items-center justify-center gap-4 rounded-pill bg-fg py-2 pr-2 pl-6 text-body font-semibold text-app shadow-raised transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-overlay focus-visible:-translate-y-0.5 active:translate-y-0';
const SECONDARY =
  'inline-flex min-h-12 items-center justify-center rounded-pill border border-border px-6 text-body font-semibold text-fg transition-colors duration-200 hover:bg-surface-subtle focus-visible:bg-surface-subtle';
const FOOT_LINK =
  'inline-flex min-h-11 items-center text-body text-fg-muted transition-colors duration-200 hover:text-fg focus-visible:text-fg';
const EYEBROW = 'text-caption font-semibold tracking-eyebrow uppercase';
const SECTION_TITLE = 'font-display text-section text-balance text-fg';

/** Arrow inside a gradient bubble (the primary CTA's tail). */
function ArrowBubble() {
  return (
    <span
      aria-hidden
      className="bg-celestial grid size-8 place-items-center rounded-pill text-white transition-transform duration-200 group-hover:translate-x-1"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

function ArrowUp() {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-200 group-hover:-translate-y-1"
    >
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

/** The headline's accent phrase: serif italic in the brand gradient (display size only). */
function AccentTitle({ title, accent }: { title: string; accent: string }) {
  const i = title.indexOf(accent);
  if (i < 0) return <>{title}</>;
  // Keep trailing punctuation inside the accent so it shares the italic and gradient.
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

/** Eight-point star lattice (khatam), the geometry of Islamic ornament; decorative. */
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

/** A soft brand-color glow and a few stars behind a night section; decorative. */
function Sky({ intensity = 'soft' }: { intensity?: 'soft' | 'bright' }) {
  const o = intensity === 'bright' ? 'opacity-35' : 'opacity-20';
  return (
    <div
      aria-hidden
      className="mask-fade-y pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="bg-stars absolute inset-0 opacity-40" />
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
  tone,
  className = '',
}: {
  id?: string;
  children: ReactNode;
  labelledBy: string;
  tone: 'night' | 'cream';
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`tone-${tone} ${SECTION} scroll-mt-24 ${className}`}
    >
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

function Screen({ id, lang }: { id: ScreenId; lang: MarketingLang }) {
  const S = SCREENS[id];
  return <S lang={lang} />;
}

// ---- Privacy cards: each one shows what it claims ------------------------------

const PRIVACY_CARD = [
  { block: 'bg-terracotta-strong', fact: { en: 'Stays on this device', bn: 'এই ডিভাইসেই থাকে' } },
  { block: 'bg-azure-strong', fact: { en: 'Sign-up is optional', bn: 'সাইন-আপ ঐচ্ছিক' } },
  {
    block: 'bg-iris-strong',
    fact: { en: '0 third-party requests', bn: 'বাইরের কোনো রিকোয়েস্ট নেই' },
  },
  {
    block: 'bg-raspberry-strong',
    fact: { en: 'Works in airplane mode', bn: 'এয়ারপ্লেন মোডেও চলে' },
  },
] as const;

function StorageVisual({ lang, nf }: { lang: MarketingLang; nf: Intl.NumberFormat }) {
  const rows: [string, number, number][] = [
    ['salahEntries', 1204, 0.92],
    ['transactions', 318, 0.46],
    ['dhikrLogs', 96, 0.24],
    ['habitEvents', 41, 0.12],
  ];
  return (
    <div className="absolute inset-4 grid content-start gap-2 rounded-lg bg-black/20 p-4 text-white">
      <div className="flex items-center justify-between text-caption font-semibold">
        <span className="flex items-center gap-2">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          IndexedDB
        </span>
        <span className="opacity-90">{lang === 'bn' ? 'এই ডিভাইস' : 'this device'}</span>
      </div>
      {rows.map(([name, n, w]) => (
        <div key={name} className="grid grid-cols-[7rem_1fr_auto] items-center gap-2 text-caption">
          <span className="truncate font-mono opacity-90">{name}</span>
          <span className="h-1 overflow-hidden rounded-pill bg-white/20">
            <span
              data-bar
              className="block h-full rounded-pill bg-white"
              style={{ width: `${w * 100}%` }}
            />
          </span>
          <span className="tabular-nums">{nf.format(n)}</span>
        </div>
      ))}
    </div>
  );
}

function SignupVisual({ lang }: { lang: MarketingLang }) {
  const fields = lang === 'bn' ? ['ইমেইল', 'পাসওয়ার্ড'] : ['Email', 'Password'];
  return (
    <div className="absolute inset-4 grid content-center gap-2 text-white">
      {fields.map((f) => (
        <span
          key={f}
          className="relative flex h-9 items-center rounded-md border border-white/30 px-4 text-caption opacity-80"
        >
          <span className="line-through decoration-2">{f}</span>
          <span className="absolute right-4 text-caption font-semibold no-underline">
            {lang === 'bn' ? 'লাগবে না' : 'not needed'}
          </span>
        </span>
      ))}
      <span className="mt-2 flex h-10 items-center justify-between rounded-pill bg-white pr-2 pl-4 text-caption font-semibold text-azure-strong">
        {lang === 'bn' ? 'সরাসরি শুরু করুন' : 'Start right away'}
        <span className="grid size-6 place-items-center rounded-pill bg-azure-strong text-white">
          →
        </span>
      </span>
    </div>
  );
}

function NetworkVisual({ lang }: { lang: MarketingLang }) {
  const rows: [string, string][] =
    lang === 'bn'
      ? [
          ['বিজ্ঞাপন', 'নেই'],
          ['অ্যানালিটিক্স', 'নেই'],
          ['ট্র্যাকার', 'নেই'],
        ]
      : [
          ['Ads', 'none'],
          ['Analytics', 'none'],
          ['Trackers', 'none'],
        ];
  return (
    <div className="absolute inset-4 grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg bg-black/20 p-4 text-white">
      <div className="grid justify-items-center">
        <span className="font-display text-mega-sm leading-none">0</span>
        <span className="text-caption opacity-90">
          {lang === 'bn' ? 'বাইরের রিকোয়েস্ট' : 'third-party'}
        </span>
      </div>
      <div className="grid gap-2">
        {rows.map(([k, v]) => (
          <span key={k} className="flex justify-between border-b border-white/20 pb-1 text-caption">
            <span>{k}</span>
            <span className="font-semibold">{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function OfflineVisual({ lang }: { lang: MarketingLang }) {
  return (
    <div className="absolute inset-4 grid content-center gap-2 text-white">
      <span className="flex h-10 items-center justify-between rounded-md bg-black/20 px-4 text-caption font-semibold">
        <span className="flex items-center gap-2">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z" />
          </svg>
          {lang === 'bn' ? 'এয়ারপ্লেন মোড' : 'Airplane mode'}
        </span>
        <span
          data-toggle
          className="flex h-5 w-9 items-center justify-end rounded-pill bg-white p-0.5"
        >
          <span className="size-4 rounded-pill bg-raspberry-strong" />
        </span>
      </span>
      <span className="grid gap-1 rounded-md bg-white p-4 text-raspberry-strong">
        <span className="text-caption font-semibold tracking-eyebrow uppercase">
          {lang === 'bn' ? 'পরের ওয়াক্ত' : 'Next prayer'}
        </span>
        <span className="flex items-baseline justify-between">
          <span className="font-display text-h2 leading-none">{lang === 'bn' ? 'আসর' : 'Asr'}</span>
          <span className="text-caption font-semibold tabular-nums">
            {lang === 'bn' ? '৩:৩৮' : '3:38 PM'}
          </span>
        </span>
      </span>
    </div>
  );
}

export function LandingPage({ lang }: { lang: MarketingLang }) {
  const c = MARKETING_COPY[lang];
  const paths = MARKETING_PATHS[lang];
  const other: MarketingLang = lang === 'en' ? 'bn' : 'en';
  const ayah = DAILY_AYAT.find((a) => a.ref === LANDING_AYAH_REF) ?? DAILY_AYAT[0]!;
  const nf = new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US');
  const ayahRef = ayah.ref.replace(/\d+/g, (n) => nf.format(Number(n)));
  const featureById = new Map(c.features.map((f) => [f.id, f]));
  const two = (n: number) => nf.format(n).padStart(2, nf.format(0));
  const visuals = [
    <StorageVisual key="s" lang={lang} nf={nf} />,
    <SignupVisual key="u" lang={lang} />,
    <NetworkVisual key="n" lang={lang} />,
    <OfflineVisual key="o" lang={lang} />,
  ];

  return (
    <div
      id="top"
      data-landing
      lang={lang}
      className={`${iserif.variable} ${isans.variable} ${anek.variable} ${serifBn.variable} tone-night relative isolate min-h-dvh overflow-x-clip antialiased`}
    >
      <LandingMotion />
      <ScreenDefs />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-toast) focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2"
      >
        {lang === 'bn' ? 'মূল অংশে যান' : 'Skip to content'}
      </a>

      <Navbar lang={lang} c={c} paths={paths} other={other} />

      <main id="main">
        {/* Hero — server-rendered and fully visible; motion only adds transforms */}
        <section
          data-anim="hero"
          aria-labelledby="hero-title"
          className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32"
        >
          <Sky intensity="bright" />
          <div className={`${CONTAINER} grid items-center gap-16 xl:grid-cols-12`}>
            <div className="grid gap-8 xl:col-span-7">
              <p
                data-anim="hero-item"
                className={`${EYEBROW} inline-flex w-fit items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-fg-muted`}
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
                className="font-display text-hero text-balance text-fg"
              >
                <AccentTitle title={c.hero.title} accent={c.hero.titleAccent} />
              </h1>
              <p data-anim="hero-item" className="max-w-xl text-lead text-fg-muted">
                {c.hero.body}
              </p>
              <div data-anim="hero-item" className="flex flex-wrap items-center gap-4">
                <Link href="/app/home" data-magnetic className={PRIMARY}>
                  {c.hero.primaryCta}
                  <ArrowBubble />
                </Link>
                <a href="#features" data-magnetic className={SECONDARY}>
                  {c.hero.secondaryCta}
                </a>
              </div>
              <p data-anim="hero-item" className="text-caption text-fg-muted">
                {c.hero.note}
              </p>
            </div>

            {/* 3D rig: one perspective (stage), then intro → scroll → pointer wrappers,
                each with a small transform of its own. Back devices sit at negative Z. */}
            <div className="py-8 xl:col-span-5 xl:py-0">
              <div className="hero-stage relative mx-auto w-full max-w-72 md:max-w-80">
                <div data-anim="hero-intro" className="rig">
                  <div data-anim="hero-scroll" className="rig">
                    <div data-anim="hero-tilt" className="rig relative">
                      <svg
                        aria-hidden
                        viewBox="0 0 400 400"
                        className="animate-orbit pointer-events-none absolute top-1/2 left-1/2 w-[160%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-50 [transform:translateZ(-260px)]"
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
                      <div aria-hidden className="hero-back-left absolute inset-0">
                        <div data-anim="fan-left" className="brightness-[0.7]">
                          <Device label="">
                            <Screen id="salah" lang={lang} />
                          </Device>
                        </div>
                      </div>
                      <div aria-hidden className="hero-back-right absolute inset-0">
                        <div data-anim="fan-right" className="brightness-[0.7]">
                          <Device label="">
                            <Screen id="finance" lang={lang} />
                          </Device>
                        </div>
                      </div>
                      <div className="relative">
                        <Device label={SCREEN_LABEL.home[lang]}>
                          <Screen id="home" lang={lang} />
                        </Device>
                      </div>
                      {HERO_CHIPS.map((chip) => {
                        const f = featureById.get(chip.id);
                        if (!f) return null;
                        return (
                          <div
                            key={chip.id}
                            aria-hidden
                            className={`absolute ${chip.pos} [transform:translateZ(80px)]`}
                          >
                            <div data-depth={chip.depth}>
                              <span
                                className={`tone-cream animate-float flex items-center gap-2 rounded-pill border border-border px-4 py-2 text-caption font-semibold shadow-overlay ${chip.delay}`}
                              >
                                <span
                                  className={`size-2 rounded-pill ${FEATURE_STYLE[chip.id].dot}`}
                                />
                                {f.eyebrow}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee — the rhythm of the day, on a cream band; decorative */}
        <div aria-hidden className="tone-cream mask-fade-x overflow-hidden py-8">
          <div className="animate-marquee flex w-max items-center gap-12">
            {[...c.marquee, ...c.marquee].map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="flex items-center gap-12 text-section whitespace-nowrap"
              >
                <span
                  className={
                    i % 2 === 1
                      ? 'font-accent bg-celestial bg-clip-text pr-2 text-transparent'
                      : 'font-display text-fg'
                  }
                >
                  {word}
                </span>
                <svg viewBox="0 0 24 24" className="size-6 text-terracotta">
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
        <Section tone="night" labelledBy="essence-title">
          <div data-anim="essence" className="mx-auto grid max-w-5xl gap-8 text-center">
            <h2 id="essence-title" className={`${EYEBROW} text-terracotta-text`}>
              {c.essence.title}
            </h2>
            <p className="font-display text-statement text-balance text-fg">
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
          className="tone-cream relative scroll-mt-24 py-16 md:py-24"
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
                          <span aria-hidden className="font-accent text-h1 normal-case">
                            {two(i + 1)}
                          </span>
                          {f.eyebrow}
                        </p>
                        <h3
                          id={`feature-title-${f.id}`}
                          className="font-display text-section text-balance text-fg"
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
                      <div className="story-stage lg:hidden">
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
                <div className="sticky top-24 grid h-[calc(100dvh-6rem)] place-items-center">
                  <span className="bg-celestial absolute top-1/2 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl" />
                  <div className="story-stage relative flex items-center gap-12">
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

        {/* Privacy — cream cards on night, each with a visual of what it claims */}
        <Section id="privacy" tone="night" labelledBy="privacy-title" className="overflow-hidden">
          <Sky />
          <div className="grid gap-16">
            <div data-anim="reveal" className="grid max-w-3xl gap-6">
              <h2 id="privacy-title" className={SECTION_TITLE}>
                {c.privacy.title}
              </h2>
              <p className="text-lead text-fg-muted">{c.privacy.body}</p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {c.privacy.points.map((p, i) => {
                const card = PRIVACY_CARD[i] ?? PRIVACY_CARD[0];
                return (
                  <li key={p.title} data-anim="reveal" className={i % 2 ? 'lg:pt-12' : ''}>
                    <article
                      data-tilt
                      className="tone-cream sheen grid h-full content-start gap-4 rounded-xl p-2 shadow-overlay"
                    >
                      <div
                        aria-hidden
                        className={`relative h-48 overflow-hidden rounded-lg ${card.block}`}
                      >
                        {visuals[i]}
                      </div>
                      <div className="grid gap-2 px-4 pt-2 pb-4">
                        <h3 className="font-display text-h2 text-fg">{p.title}</h3>
                        <p className="text-body text-fg-muted">{p.body}</p>
                        <span className="mt-2 w-fit rounded-pill bg-fg px-4 py-2 text-caption font-semibold text-app">
                          {card.fact[lang]}
                        </span>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </Section>

        {/* Featured ayah — night card on cream, khatam lattice behind */}
        <section
          aria-labelledby="ayah-label"
          className="tone-cream relative isolate overflow-hidden py-24 md:py-32"
        >
          <GeoPattern id="ayah-geo" className="mask-fade-y -z-10 text-terracotta opacity-25" />
          <div className={CONTAINER}>
            <div data-anim="zoom" className="mx-auto max-w-4xl">
              <figure className="tone-night grid gap-8 rounded-xl p-8 text-center shadow-overlay md:p-16">
                <h2 id="ayah-label" className={`${EYEBROW} text-terracotta-text`}>
                  {c.ayah.label}
                </h2>
                <blockquote className="grid gap-8">
                  <p lang="ar" dir="rtl" className="font-quran text-quran text-fg">
                    {ayah.arabic}
                  </p>
                  <p className="font-accent text-statement text-fg">
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
        <Section tone="night" labelledBy="soon-title">
          <div className="grid gap-12 lg:grid-cols-12">
            <h2 id="soon-title" data-anim="reveal" className={`${SECTION_TITLE} lg:col-span-4`}>
              {c.comingSoon.title}
            </h2>
            <ul className="grid gap-6 md:grid-cols-2 lg:col-span-8">
              {c.comingSoon.items.map((item, i) => (
                <li key={item.title} data-anim="reveal">
                  <div
                    data-tilt
                    className="sheen grid h-full gap-4 rounded-xl border border-dashed border-border bg-surface p-8"
                  >
                    <span className="font-accent w-fit text-h1 text-terracotta-text">
                      {two(i + 1)}
                    </span>
                    <h3 className="font-display text-h2 text-fg">{item.title}</h3>
                    <p className="text-body text-fg-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* FAQ — native details/summary, no JS */}
        <Section id="faq" tone="cream" labelledBy="faq-title">
          <div className="grid gap-12 lg:grid-cols-12">
            <h2
              id="faq-title"
              className={`${SECTION_TITLE} lg:sticky lg:top-32 lg:col-span-4 lg:self-start`}
            >
              {c.faq.title}
            </h2>
            <div className="grid gap-2 lg:col-span-8">
              {c.faq.items.map((item) => (
                <details
                  key={item.q}
                  data-anim="reveal"
                  className="group rounded-lg border border-border bg-surface px-6 transition-colors duration-200 open:bg-surface-subtle"
                >
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lead font-medium text-fg [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-pill bg-fg text-app transition-transform duration-200 group-open:rotate-45"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
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

        {/* Final CTA — a cream card on night */}
        <section
          aria-labelledby="final-title"
          className={`tone-night ${SECTION} isolate overflow-hidden`}
        >
          <Sky intensity="bright" />
          <div className={CONTAINER}>
            <div
              data-anim="zoom"
              className="tone-cream relative mx-auto grid max-w-5xl justify-items-center gap-8 overflow-hidden rounded-xl px-6 py-24 text-center shadow-overlay md:px-16"
            >
              <GeoPattern id="final-geo" className="mask-fade-y text-terracotta opacity-20" />
              <h2 id="final-title" className={`${SECTION_TITLE} relative`}>
                {c.final.title}
              </h2>
              <p className="relative max-w-prose text-lead text-fg-muted">{c.final.body}</p>
              <Link href="/app/home" data-magnetic className={`${PRIMARY} relative`}>
                {c.final.cta}
                <ArrowBubble />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="tone-night relative isolate overflow-hidden border-t border-border pt-24">
        <div
          aria-hidden
          className="bg-celestial absolute -bottom-1/2 left-1/2 -z-10 h-full w-3/4 -translate-x-1/2 rounded-full opacity-15 blur-3xl"
        />
        <div className={`${CONTAINER} grid gap-16 lg:grid-cols-12`}>
          <div className="grid content-start gap-6 lg:col-span-5">
            <Link
              href={paths.home}
              className="font-display w-fit text-section text-fg transition-opacity duration-200 hover:opacity-80"
            >
              Lamim
            </Link>
            <p className="max-w-sm text-lead text-fg-muted">{c.footer.lead}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/app/home" className={PRIMARY}>
                {c.nav.openApp}
                <ArrowBubble />
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
            className="font-display bg-celestial bg-clip-text text-center text-mega text-transparent select-none"
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
              <ArrowUp />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
