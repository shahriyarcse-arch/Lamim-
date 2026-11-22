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
type Tone = 'cream' | 'night' | 'lime' | 'coral';

/** Per-module accent dot (brand colors) and the app screen that shows it. */
const FEATURE_STYLE: Record<FeatureId, { dot: string; screen: ScreenId }> = {
  salah: { dot: 'bg-cerulean', screen: 'salah' },
  spirit: { dot: 'bg-violet', screen: 'home' },
  dhikr: { dot: 'bg-iris', screen: 'dhikr' },
  finance: { dot: 'bg-raspberry', screen: 'finance' },
  habits: { dot: 'bg-terracotta', screen: 'habits' },
};
/** Card colour behind each feature's device on mobile (desktop swaps via CSS). */
const FEATURE_CARD: Tone[] = ['lime', 'coral', 'night', 'cream', 'lime'];

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

const HERO_FACTS: Record<MarketingLang, string[]> = {
  en: ['Free', 'Works offline', 'Bangla & English'],
  bn: ['ফ্রি', 'ইন্টারনেট ছাড়াই চলে', 'বাংলা ও ইংরেজি'],
};

const CONTAINER = 'mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12';
const SECTION = 'relative py-24 md:py-32';
/** Card shell shared by every bento tile. */
const CARD = 'relative overflow-hidden rounded-xl p-6 md:p-8';
/** Inverts per tone: ink pill on light surfaces, cream pill on ink. */
const PRIMARY =
  'group inline-flex min-h-12 items-center justify-center gap-4 rounded-pill bg-fg py-2 pr-2 pl-6 text-body font-semibold text-app shadow-raised transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-overlay focus-visible:-translate-y-0.5 active:translate-y-0';
const SECONDARY =
  'inline-flex min-h-12 items-center justify-center rounded-pill border border-fg/20 px-6 text-body font-semibold text-fg transition-colors duration-200 hover:bg-fg hover:text-app focus-visible:bg-fg focus-visible:text-app';
const FOOT_LINK =
  'inline-flex min-h-11 items-center text-body text-fg-muted transition-colors duration-200 hover:text-fg focus-visible:text-fg';
const TAG =
  'inline-flex w-fit items-center gap-2 rounded-pill border border-border bg-surface px-4 py-1 text-caption font-semibold text-fg';
const SECTION_TITLE = 'font-display text-section text-balance text-fg';

/** Arrow inside a lime bubble (the primary CTA's tail). */
function ArrowBubble() {
  return (
    <span
      aria-hidden
      className="grid size-8 place-items-center rounded-pill bg-lime text-ink transition-transform duration-200 group-hover:translate-x-1"
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

function Check({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

/** The headline's accent phrase: serif italic on a lime highlighter stroke. */
function AccentTitle({ title, accent }: { title: string; accent: string }) {
  const i = title.indexOf(accent);
  if (i < 0) return <>{title}</>;
  // Keep trailing punctuation inside the accent so it shares the highlight.
  let end = i + accent.length;
  while (end < title.length && /[.,!?।]/.test(title[end]!)) end++;
  return (
    <>
      {title.slice(0, i)}
      <span className="font-accent rounded-md bg-lime px-2 text-ink [box-decoration-break:clone]">
        {title.slice(i, end)}
      </span>
      {title.slice(end)}
    </>
  );
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

/** Square icon badge used on every card (inverts against the card tone). */
function IconBox({ d, className }: { d: string; className: string }) {
  return (
    <span aria-hidden className={`grid size-12 place-items-center rounded-lg ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    </span>
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
      className={`${SECTION} scroll-mt-24 ${className}`}
    >
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

function Screen({ id, lang }: { id: ScreenId; lang: MarketingLang }) {
  const S = SCREENS[id];
  return <S lang={lang} />;
}

// ---- Privacy bento: each card shows what it claims ------------------------------

const ICON = {
  device: 'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm4 15h2',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 11-5.7M17 17l4 4m0-4-4 4',
  eye: 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.6 9.6 0 0 1 12 5c5 0 9 5 9 7a9 9 0 0 1-2.2 3.4M6.6 6.6C4.4 8 3 10.4 3 12c0 2 4 7 9 7a9.4 9.4 0 0 0 4.4-1.1',
  offline:
    'M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.4 5.1M5 12.5a10 10 0 0 1 2.9-1.8M19 12.5a10 10 0 0 0-3.7-2.1M8.5 16a5 5 0 0 1 7 0M12 20h.01M3 3l18 18',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  cloud: 'M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9Z',
};

const PRIVACY_CARD: {
  tone: Tone;
  span: string;
  icon: string;
  iconBox: string;
  badge: { en: string; bn: string };
}[] = [
  {
    tone: 'lime',
    span: 'lg:col-span-2',
    icon: ICON.device,
    iconBox: 'bg-ink text-lime',
    badge: { en: 'Stays on this device', bn: 'এই ডিভাইসেই থাকে' },
  },
  {
    tone: 'night',
    span: '',
    icon: ICON.user,
    iconBox: 'bg-lime text-ink',
    badge: { en: 'Sign-up optional', bn: 'সাইন-আপ ঐচ্ছিক' },
  },
  {
    tone: 'coral',
    span: '',
    icon: ICON.eye,
    iconBox: 'bg-ink text-coral',
    badge: { en: '0 third-party requests', bn: 'বাইরের রিকোয়েস্ট নেই' },
  },
  {
    tone: 'cream',
    span: 'lg:col-span-2',
    icon: ICON.offline,
    iconBox: 'bg-lime text-ink',
    badge: { en: 'Works in airplane mode', bn: 'এয়ারপ্লেন মোডেও চলে' },
  },
];

/** Inner white panel of a bento card (like a mini screen). */
const PANEL = 'rounded-lg border border-ink/10 bg-white p-4 text-ink';

function StorageVisual({ lang, nf }: { lang: MarketingLang; nf: Intl.NumberFormat }) {
  const rows: [string, number, number][] = [
    ['salahEntries', 1204, 0.92],
    ['transactions', 318, 0.46],
    ['dhikrLogs', 96, 0.24],
    ['habitEvents', 41, 0.12],
  ];
  return (
    <div className={`${PANEL} grid gap-2`}>
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
        <span className="rounded-pill bg-lime px-2 py-0.5">
          {lang === 'bn' ? 'এই ডিভাইস' : 'this device'}
        </span>
      </div>
      {rows.map(([name, n, w]) => (
        <div key={name} className="grid grid-cols-[7rem_1fr_auto] items-center gap-4 text-caption">
          <span className="truncate font-mono">{name}</span>
          <span className="h-2 overflow-hidden rounded-pill bg-sand">
            <span className="block h-full rounded-pill bg-ink" style={{ width: `${w * 100}%` }} />
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
    <div className={`${PANEL} grid gap-2`}>
      {fields.map((f) => (
        <span
          key={f}
          className="flex h-10 items-center justify-between rounded-md border border-dashed border-ink/25 px-4 text-caption"
        >
          <span className="text-ink/70 line-through">{f}</span>
          <span className="font-semibold">{lang === 'bn' ? 'লাগবে না' : 'not needed'}</span>
        </span>
      ))}
      <span className="flex h-10 items-center justify-between rounded-pill bg-ink pr-1 pl-4 text-caption font-semibold text-cream">
        {lang === 'bn' ? 'সরাসরি শুরু করুন' : 'Start right away'}
        <span className="grid size-8 place-items-center rounded-pill bg-lime text-ink">→</span>
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
    <div className={`${PANEL} grid grid-cols-[auto_1fr] items-center gap-6`}>
      <div className="grid justify-items-center">
        <span className="font-display text-mega-sm leading-none">0</span>
        <span className="text-caption">{lang === 'bn' ? 'বাইরের রিকোয়েস্ট' : 'third-party'}</span>
      </div>
      <div className="grid gap-2">
        {rows.map(([k, v]) => (
          <span key={k} className="flex items-center justify-between text-caption">
            <span>{k}</span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="grid size-4 place-items-center rounded-pill bg-coral">
                <Check className="size-2.5" />
              </span>
              {v}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function OfflineVisual({ lang }: { lang: MarketingLang }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <span className={`${PANEL} flex items-center justify-between text-caption font-semibold`}>
        <span className="flex items-center gap-2">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5Z" />
          </svg>
          {lang === 'bn' ? 'এয়ারপ্লেন মোড' : 'Airplane mode'}
        </span>
        <span className="flex h-6 w-11 items-center justify-end rounded-pill bg-ink p-1">
          <span className="size-4 rounded-pill bg-lime" />
        </span>
      </span>
      <span className={`${PANEL} grid gap-1`}>
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
      className={`${iserif.variable} ${isans.variable} ${anek.variable} ${serifBn.variable} tone-cream relative isolate min-h-dvh overflow-x-clip antialiased`}
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
          className="relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24"
        >
          <div className={`${CONTAINER} grid items-center gap-16 xl:grid-cols-12`}>
            <div className="grid gap-8 xl:col-span-6">
              <p data-anim="hero-item" className={TAG}>
                <span aria-hidden className="relative flex size-2">
                  <span className="animate-beacon absolute inset-0 rounded-pill bg-coral" />
                  <span className="relative size-2 rounded-pill bg-coral" />
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
              <ul data-anim="hero-item" className="flex flex-wrap gap-4">
                {HERO_FACTS[lang].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-caption font-semibold text-fg"
                  >
                    <span className="grid size-5 place-items-center rounded-pill bg-lime text-ink">
                      <Check className="size-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* 3D rig on a coral card: one perspective (stage), then intro → scroll →
                pointer wrappers, each a small transform. Back devices sit at negative Z. */}
            <div className="xl:col-span-6">
              <div className="tone-coral relative isolate rounded-xl px-8 py-16 md:px-16">
                <GeoPattern id="hero-geo" className="text-ink opacity-10" />
                <div className="hero-stage relative mx-auto w-full max-w-64 md:max-w-72">
                  <div data-anim="hero-intro" className="rig">
                    <div data-anim="hero-scroll" className="rig">
                      <div data-anim="hero-tilt" className="rig relative">
                        <div aria-hidden className="hero-back-left absolute inset-0">
                          <div data-anim="fan-left" className="brightness-[0.85]">
                            <Device label="">
                              <Screen id="salah" lang={lang} />
                            </Device>
                          </div>
                        </div>
                        <div aria-hidden className="hero-back-right absolute inset-0">
                          <div data-anim="fan-right" className="brightness-[0.85]">
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
                                  className={`animate-float flex items-center gap-2 rounded-pill bg-white px-4 py-2 text-caption font-semibold text-ink shadow-overlay ${chip.delay}`}
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
          </div>
        </section>

        {/* Marquee — the rhythm of the day on an ink band; decorative */}
        <div aria-hidden className="tone-night mask-fade-x overflow-hidden py-8">
          <div className="animate-marquee flex w-max items-center gap-12">
            {[...c.marquee, ...c.marquee].map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="flex items-center gap-12 text-section whitespace-nowrap"
              >
                <span className={i % 2 === 1 ? 'font-accent text-lime' : 'font-display text-fg'}>
                  {word}
                </span>
                <svg viewBox="0 0 24 24" className="size-6 text-coral">
                  <path
                    fill="currentColor"
                    d="M12 2 14.6 7.4 20.5 8.2 16.2 12.3 17.3 18.2 12 15.4 6.7 18.2 7.8 12.3 3.5 8.2 9.4 7.4Z"
                  />
                </svg>
              </span>
            ))}
          </div>
        </div>

        {/* Essence — words go from faint to ink as you scroll */}
        <Section labelledBy="essence-title">
          <div
            data-anim="essence"
            className="mx-auto grid max-w-5xl justify-items-center gap-8 text-center"
          >
            <h2 id="essence-title" className={TAG}>
              <span aria-hidden className="size-2 rounded-pill bg-coral" />
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

        {/* Features — sticky device on a colour-shifting card (desktop), inline cards on mobile */}
        <section
          id="features"
          aria-labelledby="features-title"
          className="relative scroll-mt-24 pb-16 md:pb-24"
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
                        <p className="flex items-center gap-4">
                          <span aria-hidden className="font-accent text-h1 text-fg-muted">
                            {two(i + 1)}
                          </span>
                          <span className={TAG}>
                            <span aria-hidden className={`size-2 rounded-pill ${style.dot}`} />
                            {f.eyebrow}
                          </span>
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
                              <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-pill bg-lime text-ink">
                                <Check className="size-3" />
                              </span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div
                        className={`tone-${FEATURE_CARD[i] ?? 'lime'} story-stage rounded-xl border border-border px-8 py-12 lg:hidden`}
                      >
                        <div data-anim="feature-phone" data-dir={i % 2 ? '-1' : '1'}>
                          <Device label={SCREEN_LABEL[style.screen][lang]} className="max-w-64">
                            <Screen id={style.screen} lang={lang} />
                          </Device>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div aria-hidden className="relative hidden lg:col-span-6 lg:block">
                <div className="sticky top-24 grid h-[calc(100dvh-7rem)] place-items-center">
                  <div
                    data-story-card
                    className="story-stage relative grid size-full place-items-center overflow-hidden rounded-xl border border-border"
                  >
                    <GeoPattern id="story-geo" className="text-ink opacity-10" />
                    <div data-anim="story-device" className="relative w-72">
                      {/* One device; its screen swaps per step (CSS [data-active]) */}
                      <Device label="">
                        {c.features.map((f, i) => (
                          <div key={f.id} data-screen={i}>
                            <Screen id={FEATURE_STYLE[f.id].screen} lang={lang} />
                          </div>
                        ))}
                      </Device>
                    </div>
                    <ol className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 rounded-pill bg-white p-2 shadow-raised">
                      {c.features.map((f, i) => (
                        <li key={f.id} className="flex items-center">
                          <span
                            data-step-dot={i}
                            className={`h-2 w-2 rounded-pill opacity-40 transition-[width,opacity] duration-300 ${FEATURE_STYLE[f.id].dot}`}
                          />
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy — bento of coloured cards, each with a visual of what it claims */}
        <Section id="privacy" labelledBy="privacy-title">
          <div className="grid gap-12">
            <div data-anim="reveal" className="grid gap-8 lg:grid-cols-12 lg:items-end">
              <h2 id="privacy-title" className={`${SECTION_TITLE} lg:col-span-7`}>
                {c.privacy.title}
              </h2>
              <p className="text-lead text-fg-muted lg:col-span-5">{c.privacy.body}</p>
            </div>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {c.privacy.points.map((p, i) => {
                const card = PRIVACY_CARD[i] ?? PRIVACY_CARD[0]!;
                return (
                  <li key={p.title} data-anim="reveal" className={card.span}>
                    <article
                      data-tilt
                      className={`tone-${card.tone} ${CARD} grid h-full content-start gap-6 border border-border`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <IconBox d={card.icon} className={card.iconBox} />
                        <span className="rounded-pill border border-fg/20 px-4 py-1 text-caption font-semibold text-fg">
                          {card.badge[lang]}
                        </span>
                      </div>
                      <div className="grid gap-2">
                        <h3 className="font-display text-h1 text-fg">{p.title}</h3>
                        <p className="max-w-prose text-body text-fg-muted">{p.body}</p>
                      </div>
                      <div aria-hidden>{visuals[i]}</div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </Section>

        {/* Featured ayah — ink card with the khatam lattice */}
        <section aria-labelledby="ayah-label" className="relative pb-24 md:pb-32">
          <div className={CONTAINER}>
            <div data-anim="zoom">
              <figure className="tone-night relative grid gap-8 overflow-hidden rounded-xl p-8 text-center md:p-16">
                <GeoPattern id="ayah-geo" className="mask-fade-y text-lime opacity-10" />
                <h2
                  id="ayah-label"
                  className="relative mx-auto w-fit rounded-pill bg-lime px-4 py-1 text-caption font-semibold text-ink"
                >
                  {c.ayah.label}
                </h2>
                <blockquote className="relative grid gap-8">
                  <p lang="ar" dir="rtl" className="font-quran text-quran text-fg">
                    {ayah.arabic}
                  </p>
                  <p className="font-accent mx-auto max-w-3xl text-statement text-fg">
                    {lang === 'bn' ? ayah.bn : ayah.en}
                  </p>
                </blockquote>
                <figcaption className="relative text-caption font-semibold tracking-eyebrow text-fg-muted uppercase">
                  {lang === 'bn' ? `কুরআন ${ayahRef}` : `Qur’an ${ayahRef}`}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Coming soon */}
        <Section labelledBy="soon-title" className="!pt-0">
          <div className="grid gap-12 lg:grid-cols-12">
            <h2 id="soon-title" data-anim="reveal" className={`${SECTION_TITLE} lg:col-span-4`}>
              {c.comingSoon.title}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2 lg:col-span-8">
              {c.comingSoon.items.map((item, i) => (
                <li key={item.title} data-anim="reveal">
                  <div
                    data-tilt
                    className={`${i === 0 ? 'tone-coral' : 'tone-lime'} ${CARD} grid h-full gap-4 border border-border`}
                  >
                    <div className="flex items-start justify-between">
                      <IconBox
                        d={i === 0 ? ICON.spark : ICON.cloud}
                        className="bg-ink text-cream"
                      />
                      <span className="font-accent text-h1 text-fg">{two(i + 1)}</span>
                    </div>
                    <h3 className="font-display text-h1 text-fg">{item.title}</h3>
                    <p className="text-body text-fg-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* FAQ — native details/summary, no JS */}
        <Section id="faq" labelledBy="faq-title" className="!pt-0">
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
                  className="group rounded-lg border border-border bg-white px-6 transition-colors duration-200 open:bg-surface"
                >
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lead font-medium text-fg [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-pill bg-ink text-lime transition-transform duration-200 group-open:rotate-45"
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

        {/* Final CTA — a lime card */}
        <section aria-labelledby="final-title" className="relative pb-24 md:pb-32">
          <div className={CONTAINER}>
            <div
              data-anim="zoom"
              className="tone-lime relative grid justify-items-center gap-8 overflow-hidden rounded-xl border border-border px-6 py-24 text-center md:px-16"
            >
              <GeoPattern id="final-geo" className="mask-fade-y text-ink opacity-10" />
              <h2 id="final-title" className={`${SECTION_TITLE} relative max-w-3xl`}>
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

      {/* Footer — an ink panel inset on the cream page */}
      <footer className="px-2 pb-2 md:px-4 md:pb-4">
        <div className="tone-night relative overflow-hidden rounded-xl pt-24">
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
                <h2 className="mb-2 text-caption font-semibold tracking-eyebrow text-lime uppercase">
                  {c.footer.explore}
                </h2>
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
                <h2 className="mb-2 text-caption font-semibold tracking-eyebrow text-lime uppercase">
                  {c.footer.modules}
                </h2>
                {c.features.map((f) => (
                  <a key={f.id} href={`#feature-${f.id}`} className={FOOT_LINK}>
                    {f.eyebrow}
                  </a>
                ))}
              </div>
              <div className="grid content-start gap-2">
                <h2 className="mb-2 text-caption font-semibold tracking-eyebrow text-lime uppercase">
                  {c.footer.more}
                </h2>
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
              className="font-display bg-celestial bg-clip-text pb-4 text-center text-mega text-transparent select-none"
            >
              Lamim<span className="text-lime">.</span>
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
        </div>
      </footer>
    </div>
  );
}
