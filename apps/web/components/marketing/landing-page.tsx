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
import { PhoneFrame } from './phone-frame';

type FeatureId = MarketingCopy['features'][number]['id'];

/** Per-module accent (brand colors only) and product screenshot. */
const FEATURE_STYLE: Record<
  FeatureId,
  {
    eyebrow: string;
    dot: string;
    wash: 'dawn' | 'dusk';
    glow: string;
    shot: string | null;
    alt: { en: string; bn: string };
  }
> = {
  salah: {
    eyebrow: 'text-cerulean-text',
    dot: 'bg-cerulean',
    wash: 'dawn',
    glow: 'bg-dawn',
    shot: '/marketing/salah.webp',
    alt: {
      en: 'Salah screen: next prayer countdown and the five prayers',
      bn: 'সালাত স্ক্রিন: পরবর্তী সালাতের সময় ও পাঁচ ওয়াক্ত',
    },
  },
  spirit: {
    eyebrow: 'text-violet-text',
    dot: 'bg-violet',
    wash: 'dusk',
    glow: 'bg-dusk',
    shot: null,
    alt: { en: '', bn: '' },
  },
  dhikr: {
    eyebrow: 'text-iris-text',
    dot: 'bg-iris',
    wash: 'dawn',
    glow: 'bg-dawn',
    shot: '/marketing/dhikr.webp',
    alt: {
      en: 'Dhikr counter at 21 of 33 with a progress ring',
      bn: 'যিকির কাউন্টার: ৩৩-এর মধ্যে ২১',
    },
  },
  finance: {
    eyebrow: 'text-raspberry-text',
    dot: 'bg-raspberry',
    wash: 'dusk',
    glow: 'bg-dusk',
    shot: '/marketing/finance.webp',
    alt: {
      en: 'Finance screen: available cash, monthly income and spending, budget bar',
      bn: 'অর্থ স্ক্রিন: হাতে থাকা টাকা, মাসিক আয়-ব্যয় ও বাজেট',
    },
  },
  habits: {
    eyebrow: 'text-terracotta-text',
    dot: 'bg-terracotta',
    wash: 'dusk',
    glow: 'bg-dusk',
    shot: '/marketing/habits.webp',
    alt: {
      en: 'Habit timer: 23 days clean with rank progress',
      bn: 'অভ্যাস টাইমার: ২৩ দিন পরিচ্ছন্ন',
    },
  },
};

/** Chips that float around the hero phone at different depths (parallax). */
const HERO_CHIPS: { id: FeatureId; pos: string; depth: number; delay: string }[] = [
  { id: 'salah', pos: '-left-8 top-16 md:-left-16', depth: 0.9, delay: '[animation-delay:0s]' },
  { id: 'dhikr', pos: '-right-6 top-40 md:-right-14', depth: 0.5, delay: '[animation-delay:-2s]' },
  {
    id: 'finance',
    pos: '-left-6 bottom-32 md:-left-20',
    depth: 0.7,
    delay: '[animation-delay:-4s]',
  },
  {
    id: 'habits',
    pos: '-right-4 bottom-12 md:-right-10',
    depth: 1.1,
    delay: '[animation-delay:-3s]',
  },
];

const CONTAINER = 'mx-auto w-full max-w-6xl px-4 md:px-8 lg:px-12';
const SECTION = 'relative py-16 md:py-24 lg:py-32';
const PRIMARY =
  'group inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-cerulean-strong px-6 text-body font-semibold text-white shadow-[0_8px_32px_rgb(0_133_193/0.35)] transition-[box-shadow,filter] duration-200 hover:shadow-[0_8px_48px_rgb(0_133_193/0.55)] hover:brightness-110 focus-visible:brightness-110 active:brightness-95';
const SECONDARY =
  'inline-flex min-h-12 items-center justify-center rounded-pill glass px-6 text-body font-semibold text-fg transition-colors duration-200 hover:bg-surface-subtle focus-visible:bg-surface-subtle';
/** Compact primary for the header; separate constant so Tailwind utilities never conflict. */
const PRIMARY_SM =
  'inline-flex min-h-11 items-center justify-center rounded-pill bg-cerulean-strong px-4 text-caption font-semibold text-white transition-[filter] duration-200 hover:brightness-110 focus-visible:brightness-110';
const NAV_LINK =
  'inline-flex min-h-11 items-center rounded-pill px-4 text-body text-fg-muted transition-colors duration-200 hover:bg-surface-subtle hover:text-fg focus-visible:text-fg';
const EYEBROW = 'text-caption font-semibold tracking-wide uppercase';

function Arrow() {
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
      className="transition-transform duration-200 group-hover:translate-x-1"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Wraps the gradient phrase of the headline (display size only — contrast contract). */
function AccentTitle({ title, accent }: { title: string; accent: string }) {
  const i = title.indexOf(accent);
  if (i < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, i)}
      <span className="bg-celestial bg-clip-text text-transparent">{accent}</span>
      {title.slice(i + accent.length)}
    </>
  );
}

function Dot({ className }: { className: string }) {
  return <span aria-hidden className={`mt-2 size-2 shrink-0 rounded-pill ${className}`} />;
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

function SpiritRing() {
  // Decorative only: a celestial arc that fills as it scrolls in. No demo number.
  return (
    <div
      aria-hidden
      className="glass relative mx-auto grid aspect-square w-full max-w-72 place-items-center rounded-xl shadow-overlay"
    >
      <span className="bg-dusk absolute inset-12 -z-10 rounded-full opacity-40 blur-3xl" />
      <svg viewBox="0 0 200 200" className="w-3/4 -rotate-90">
        <defs>
          <linearGradient id="landing-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-terracotta)" />
            <stop offset="35%" stopColor="var(--color-violet)" />
            <stop offset="70%" stopColor="var(--color-iris)" />
            <stop offset="100%" stopColor="var(--color-cerulean)" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="84"
          fill="none"
          stroke="var(--color-surface-subtle)"
          strokeWidth="12"
        />
        <circle
          data-anim="ring"
          cx="100"
          cy="100"
          r="84"
          fill="none"
          stroke="url(#landing-ring)"
          strokeWidth="12"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="0.72 1"
        />
      </svg>
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

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 5 5 9-10" />
    </svg>
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

  return (
    <div
      data-landing
      data-theme="dark"
      lang={lang}
      className="relative isolate min-h-dvh overflow-x-clip bg-app text-fg"
    >
      <LandingMotion />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-toast) focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2"
      >
        {lang === 'bn' ? 'মূল অংশে যান' : 'Skip to content'}
      </a>

      {/* Header */}
      <header className="sticky top-0 z-(--z-dock) border-b border-border bg-app/70 backdrop-blur-xl">
        <span
          aria-hidden
          data-anim="progress"
          className="bg-celestial absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0"
        />
        <div
          className={`${CONTAINER} grid min-h-16 grid-cols-[1fr_auto_auto] items-center gap-2 md:grid-cols-[auto_1fr_auto_auto] md:gap-4`}
        >
          <Link
            href={paths.home}
            className="bg-celestial bg-clip-text text-h3 font-bold text-transparent"
          >
            Lamim
          </Link>
          <nav
            aria-label={lang === 'bn' ? 'প্রধান' : 'Primary'}
            className="hidden justify-center gap-2 md:flex"
          >
            {(
              [
                ['#features', c.nav.features],
                ['#privacy', c.nav.privacy],
                ['#faq', c.nav.faq],
              ] as const
            ).map(([href, label]) => (
              <a key={href} href={href} className={NAV_LINK}>
                {label}
              </a>
            ))}
          </nav>
          <Link
            href={MARKETING_PATHS[other].home}
            hrefLang={other}
            lang={other}
            className="inline-flex min-h-11 items-center rounded-pill border border-border px-4 text-caption font-semibold text-fg transition-colors duration-200 hover:bg-surface-subtle"
          >
            {c.nav.language}
          </Link>
          <Link href="/app/home" className={PRIMARY_SM}>
            {c.nav.openApp}
          </Link>
        </div>
      </header>

      <main id="main">
        {/* Hero — server-rendered and fully visible; motion only adds transforms */}
        <section
          data-anim="hero"
          aria-labelledby="hero-title"
          className="relative isolate overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32"
        >
          <Sky intensity="bright" />
          <div className={`${CONTAINER} grid items-center gap-16 lg:grid-cols-12`}>
            <div className="grid gap-6 lg:col-span-7">
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
                className="text-display font-bold tracking-tight text-balance text-fg"
              >
                <AccentTitle title={c.hero.title} accent={c.hero.titleAccent} />
              </h1>
              <p data-anim="hero-item" className="max-w-prose text-lead text-fg-muted">
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

            {/* 3D stage: intro (stage) → scroll (phone) → pointer (tilt), one transform per wrapper */}
            <div className="lg:col-span-5">
              <div data-anim="hero-stage" className="relative mx-auto w-full max-w-72">
                <div data-anim="hero-phone" className="[transform-style:preserve-3d]">
                  <div data-anim="hero-tilt" className="relative [transform-style:preserve-3d]">
                    <svg
                      aria-hidden
                      viewBox="0 0 400 400"
                      className="animate-orbit pointer-events-none absolute top-1/2 left-1/2 -z-10 w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-60"
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
                    <PhoneFrame
                      src="/marketing/home.webp"
                      alt={
                        lang === 'bn'
                          ? 'লামিম হোম: পরবর্তী সালাত, আধ্যাত্মিক স্কোর ও আজকের সালাত'
                          : 'Lamim home: next prayer, Spirit Score and today’s prayers'
                      }
                      wash="celestial"
                      priority
                    />
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

        {/* Marquee — the rhythm of the day; decorative duplicate of nothing essential */}
        <div aria-hidden className="mask-fade-x overflow-hidden border-y border-border py-6">
          <div className="animate-marquee flex w-max gap-12">
            {[...c.marquee, ...c.marquee].map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="flex items-center gap-12 text-h2 font-bold whitespace-nowrap text-fg-muted"
              >
                {word}
                <span className="bg-celestial size-2 rounded-pill" />
              </span>
            ))}
          </div>
        </div>

        {/* Essence — words light up as you scroll */}
        <Section labelledBy="essence-title">
          <div data-anim="essence" className="mx-auto grid max-w-4xl gap-8 text-center">
            <span aria-hidden className="bg-celestial mx-auto h-1 w-16 rounded-pill" />
            <h2 id="essence-title" className="text-h2 font-bold text-balance text-fg">
              {c.essence.title}
            </h2>
            <p className="text-h3 font-semibold text-balance text-fg">
              {c.essence.body.split(' ').map((w, i) => (
                <span key={i} data-anim="word">
                  {w}{' '}
                </span>
              ))}
            </p>
          </div>
        </Section>

        {/* Features */}
        <section
          id="features"
          aria-labelledby="features-title"
          className={`${SECTION} scroll-mt-16 overflow-hidden`}
        >
          <div className={`${CONTAINER} grid gap-32`}>
            <h2 id="features-title" className="sr-only">
              {c.nav.features}
            </h2>
            {c.features.map((f, i) => {
              const style = FEATURE_STYLE[f.id];
              const reversed = i % 2 === 1;
              return (
                <article
                  key={f.id}
                  aria-labelledby={`feature-${f.id}`}
                  className="relative grid items-center gap-12 lg:grid-cols-12"
                >
                  <div
                    data-anim="reveal"
                    className={`grid gap-4 lg:col-span-5 ${reversed ? 'lg:order-last lg:col-start-8' : ''}`}
                  >
                    <p className={`${EYEBROW} flex items-center gap-4 ${style.eyebrow}`}>
                      <span
                        aria-hidden
                        className="bg-celestial bg-clip-text text-h2 font-bold text-transparent"
                      >
                        {nf.format(i + 1).padStart(2, nf.format(0))}
                      </span>
                      {f.eyebrow}
                    </p>
                    <h3 id={`feature-${f.id}`} className="text-h2 font-bold text-balance text-fg">
                      {f.title}
                    </h3>
                    <p className="text-body text-fg-muted">{f.body}</p>
                    <ul className="grid gap-2">
                      {f.points.map((p) => (
                        <li key={p} className="flex gap-4 text-body text-fg">
                          <Dot className={style.dot} />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div
                    className={`relative lg:col-span-6 ${reversed ? 'lg:col-start-1' : 'lg:col-start-7'}`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-x-8 top-1/4 bottom-1/4 -z-10 rounded-full opacity-30 blur-3xl ${style.glow}`}
                    />
                    <div data-anim="feature-phone" data-dir={reversed ? '-1' : '1'}>
                      {style.shot ? (
                        <PhoneFrame src={style.shot} alt={style.alt[lang]} wash={style.wash} />
                      ) : (
                        <SpiritRing />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Privacy & offline — tilt cards */}
        <Section id="privacy" labelledBy="privacy-title" className="overflow-hidden">
          <Sky />
          <div className="grid gap-12">
            <div data-anim="reveal" className="grid max-w-3xl gap-4">
              <h2 id="privacy-title" className="text-h1 font-bold text-balance text-fg">
                {c.privacy.title}
              </h2>
              <p className="text-lead text-fg-muted">{c.privacy.body}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.privacy.points.map((p) => (
                <li key={p.title} data-anim="reveal">
                  <div
                    data-tilt
                    className="glass sheen grid h-full gap-2 rounded-xl p-6 transition-colors duration-200 hover:border-azure/40"
                  >
                    <span
                      aria-hidden
                      className="grid size-10 place-items-center rounded-md bg-azure-strong text-white shadow-[0_0_24px_rgb(0_124_211/0.45)]"
                    >
                      <CheckIcon />
                    </span>
                    <h3 className="text-body font-semibold text-fg">{p.title}</h3>
                    <p className="text-body text-fg-muted">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Featured ayah — celestial glow, text on a solid surface for guaranteed contrast */}
        <section
          aria-labelledby="ayah-label"
          className="relative isolate overflow-hidden py-24 md:py-32"
        >
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="bg-celestial absolute inset-x-0 top-1/2 h-2/3 -translate-y-1/2 opacity-40 blur-3xl" />
          </div>
          <div className={CONTAINER}>
            <div data-anim="zoom" className="mx-auto max-w-3xl">
              <figure className="grid gap-6 rounded-xl border border-border bg-surface p-8 text-center shadow-overlay md:p-12">
                <h2 id="ayah-label" className={`${EYEBROW} text-violet-text`}>
                  {c.ayah.label}
                </h2>
                <blockquote className="grid gap-6">
                  <p lang="ar" dir="rtl" className="font-quran text-quran text-fg">
                    {ayah.arabic}
                  </p>
                  <p className="text-lead text-fg-muted">{lang === 'bn' ? ayah.bn : ayah.en}</p>
                </blockquote>
                <figcaption className="text-caption font-semibold text-fg-muted">
                  {lang === 'bn' ? `কুরআন ${ayahRef}` : `Qur’an ${ayahRef}`}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Coming soon */}
        <Section labelledBy="soon-title">
          <div className="grid gap-8">
            <h2 id="soon-title" data-anim="reveal" className="text-h2 font-bold text-fg">
              {c.comingSoon.title}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {c.comingSoon.items.map((item) => (
                <li key={item.title} data-anim="reveal">
                  <div
                    data-tilt
                    className="sheen grid h-full gap-2 rounded-xl border border-dashed border-border bg-surface/50 p-6"
                  >
                    <h3 className="text-body font-semibold text-fg">{item.title}</h3>
                    <p className="text-body text-fg-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* FAQ — native details/summary, no JS */}
        <Section id="faq" labelledBy="faq-title">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2
              id="faq-title"
              className="text-h2 font-bold text-balance text-fg lg:sticky lg:top-24 lg:col-span-4 lg:self-start"
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
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 text-body font-semibold text-fg [&::-webkit-details-marker]:hidden">
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
              className="glass mx-auto grid max-w-4xl justify-items-center gap-6 rounded-xl px-6 py-16 text-center shadow-overlay md:px-16"
            >
              <span aria-hidden className="bg-celestial h-1 w-24 rounded-pill" />
              <h2 id="final-title" className="text-h1 font-bold text-balance text-fg">
                {c.final.title}
              </h2>
              <p className="max-w-prose text-lead text-fg-muted">{c.final.body}</p>
              <Link href="/app/home" data-magnetic className={PRIMARY}>
                {c.final.cta}
                <Arrow />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className={`${CONTAINER} grid gap-4 md:grid-cols-[1fr_auto] md:items-center`}>
          <div className="grid gap-1">
            <span className="bg-celestial bg-clip-text text-h3 font-bold text-transparent">
              Lamim
            </span>
            <p className="text-caption text-fg-muted">{c.footer.tagline}</p>
            <p className="text-caption text-fg-muted">{c.footer.rights}</p>
          </div>
          <nav aria-label={lang === 'bn' ? 'ফুটার' : 'Footer'} className="flex flex-wrap gap-2">
            <Link href={paths.privacy} className={NAV_LINK}>
              {c.footer.privacyLink}
            </Link>
            <Link href="/app/home" className={NAV_LINK}>
              {c.nav.openApp}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
