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
import { PhoneFrame } from './phone-frame';
import { Reveal } from './reveal';

type FeatureId = MarketingCopy['features'][number]['id'];

/** Per-module accent (brand colors only) and product screenshot. */
const FEATURE_STYLE: Record<
  FeatureId,
  {
    eyebrow: string;
    dot: string;
    wash: 'dawn' | 'dusk';
    shot: string | null;
    alt: { en: string; bn: string };
  }
> = {
  salah: {
    eyebrow: 'text-cerulean-text',
    dot: 'bg-cerulean',
    wash: 'dawn',
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
    shot: null,
    alt: { en: '', bn: '' },
  },
  dhikr: {
    eyebrow: 'text-iris-text',
    dot: 'bg-iris',
    wash: 'dawn',
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
    shot: '/marketing/habits.webp',
    alt: {
      en: 'Habit timer: 23 days clean with rank progress',
      bn: 'অভ্যাস টাইমার: ২৩ দিন পরিচ্ছন্ন',
    },
  },
};

const CONTAINER = 'mx-auto w-full max-w-6xl px-4 md:px-8 lg:px-12';
const SECTION = 'py-16 md:py-24 lg:py-32';
const PRIMARY =
  'inline-flex min-h-11 items-center justify-center rounded-pill bg-cerulean-strong px-6 text-body font-semibold text-white shadow-card transition-[box-shadow,filter,transform] duration-200 hover:shadow-raised hover:brightness-110 active:translate-y-px';
const SECONDARY =
  'inline-flex min-h-11 items-center justify-center rounded-pill border border-border bg-surface px-6 text-body font-semibold text-fg transition-colors duration-200 hover:bg-surface-subtle';
/** Compact primary for the header; separate constant so Tailwind utilities never conflict. */
const PRIMARY_SM =
  'inline-flex min-h-11 items-center justify-center rounded-pill bg-cerulean-strong px-4 text-caption font-semibold text-white shadow-card transition-[box-shadow,filter,transform] duration-200 hover:shadow-raised hover:brightness-110 active:translate-y-px';
const EYEBROW = 'text-caption font-semibold tracking-wide uppercase';

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

function SpiritRing() {
  // Decorative only: a celestial arc on a calm surface. No demo number.
  return (
    <div
      aria-hidden
      className="relative mx-auto grid aspect-square w-full max-w-72 place-items-center rounded-xl border border-border bg-surface shadow-card"
    >
      <span className="bg-dusk absolute inset-12 -z-10 rounded-full opacity-25 blur-3xl" />
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
  tone,
  children,
  labelledBy,
}: {
  id?: string;
  tone: 'app' | 'surface';
  children: ReactNode;
  labelledBy: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${SECTION} ${tone === 'app' ? 'bg-app' : 'bg-surface'} scroll-mt-16`}
    >
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

export function LandingPage({ lang }: { lang: MarketingLang }) {
  const c = MARKETING_COPY[lang];
  const paths = MARKETING_PATHS[lang];
  const other: MarketingLang = lang === 'en' ? 'bn' : 'en';
  const ayah = DAILY_AYAT.find((a) => a.ref === LANDING_AYAH_REF) ?? DAILY_AYAT[0]!;
  const nf = new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US');
  const ayahRef = ayah.ref.replace(/\d+/g, (n) => nf.format(Number(n)));

  return (
    <div lang={lang} className="min-h-dvh bg-app text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-toast) focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2"
      >
        {lang === 'bn' ? 'মূল অংশে যান' : 'Skip to content'}
      </a>

      {/* Header */}
      <header className="sticky top-0 z-(--z-dock) border-b border-border bg-app/85 backdrop-blur-md">
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
              <a
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center rounded-pill px-4 text-body text-fg-muted transition-colors hover:bg-surface-subtle hover:text-fg"
              >
                {label}
              </a>
            ))}
          </nav>
          <Link
            href={MARKETING_PATHS[other].home}
            hrefLang={other}
            lang={other}
            className="inline-flex min-h-11 items-center rounded-pill border border-border px-4 text-caption font-semibold text-fg transition-colors hover:bg-surface-subtle"
          >
            {c.nav.language}
          </Link>
          <Link href="/app/home" className={PRIMARY_SM}>
            {c.nav.openApp}
          </Link>
        </div>
      </header>

      <main id="main">
        {/* Hero — server-rendered, no motion, h1 is the LCP element */}
        <section aria-labelledby="hero-title" className="bg-app py-16 md:py-24">
          <div className={`${CONTAINER} grid items-center gap-12 lg:grid-cols-12`}>
            <div className="grid gap-6 lg:col-span-7">
              <p className={`${EYEBROW} text-fg-muted`}>{c.hero.eyebrow}</p>
              <h1
                id="hero-title"
                className="text-display font-bold tracking-tight text-balance text-fg"
              >
                <AccentTitle title={c.hero.title} accent={c.hero.titleAccent} />
              </h1>
              <p className="max-w-prose text-lead text-fg-muted">{c.hero.body}</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/app/home" className={PRIMARY}>
                  {c.hero.primaryCta}
                </Link>
                <a href="#features" className={SECONDARY}>
                  {c.hero.secondaryCta}
                </a>
              </div>
              <p className="text-caption text-fg-muted">{c.hero.note}</p>
            </div>
            <div className="lg:col-span-5">
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
            </div>
          </div>
        </section>

        {/* Essence */}
        <Section tone="surface" labelledBy="essence-title">
          <Reveal className="mx-auto grid max-w-3xl gap-6 text-center">
            <span aria-hidden className="bg-celestial mx-auto h-1 w-16 rounded-pill" />
            <h2 id="essence-title" className="text-h2 font-bold text-balance text-fg">
              {c.essence.title}
            </h2>
            <p className="text-lead text-fg-muted">{c.essence.body}</p>
          </Reveal>
        </Section>

        {/* Features */}
        <section
          id="features"
          aria-labelledby="features-title"
          className={`${SECTION} scroll-mt-16 bg-app`}
        >
          <div className={`${CONTAINER} grid gap-24`}>
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
                  className="grid items-center gap-12 lg:grid-cols-12"
                >
                  <Reveal
                    className={`grid gap-4 lg:col-span-5 ${reversed ? 'lg:order-last lg:col-start-8' : ''}`}
                  >
                    <p className={`${EYEBROW} ${style.eyebrow}`}>{f.eyebrow}</p>
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
                  </Reveal>
                  <Reveal
                    y={24}
                    delay={0.08}
                    className={`lg:col-span-6 ${reversed ? 'lg:col-start-1' : 'lg:col-start-7'}`}
                  >
                    {style.shot ? (
                      <PhoneFrame src={style.shot} alt={style.alt[lang]} wash={style.wash} />
                    ) : (
                      <SpiritRing />
                    )}
                  </Reveal>
                </article>
              );
            })}
          </div>
        </section>

        {/* Privacy & offline */}
        <Section id="privacy" tone="surface" labelledBy="privacy-title">
          <div className="grid gap-12">
            <Reveal className="grid max-w-3xl gap-4">
              <h2 id="privacy-title" className="text-h2 font-bold text-balance text-fg">
                {c.privacy.title}
              </h2>
              <p className="text-lead text-fg-muted">{c.privacy.body}</p>
            </Reveal>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {c.privacy.points.map((p, i) => (
                <li key={p.title}>
                  <Reveal
                    delay={Math.min(i, 2) * 0.08}
                    className="grid h-full gap-2 rounded-lg border border-border bg-app p-6"
                  >
                    <span
                      aria-hidden
                      className="grid size-10 place-items-center rounded-md bg-azure-strong text-white"
                    >
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
                    </span>
                    <h3 className="text-body font-semibold text-fg">{p.title}</h3>
                    <p className="text-body text-fg-muted">{p.body}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Featured ayah — gradient band, text on a solid surface panel for guaranteed contrast */}
        <section aria-labelledby="ayah-label" className="bg-celestial py-16 md:py-24">
          <div className={CONTAINER}>
            <Reveal y={0} className="mx-auto max-w-3xl">
              <figure className="grid gap-6 rounded-xl bg-surface p-8 text-center shadow-overlay md:p-12">
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
            </Reveal>
          </div>
        </section>

        {/* Coming soon */}
        <Section tone="app" labelledBy="soon-title">
          <div className="grid gap-8">
            <h2 id="soon-title" className="text-h2 font-bold text-fg">
              {c.comingSoon.title}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {c.comingSoon.items.map((item) => (
                <li key={item.title}>
                  <Reveal className="grid h-full gap-2 rounded-lg border border-dashed border-border bg-surface p-6">
                    <h3 className="text-body font-semibold text-fg">{item.title}</h3>
                    <p className="text-body text-fg-muted">{item.body}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* FAQ — native details/summary, no JS */}
        <Section id="faq" tone="surface" labelledBy="faq-title">
          <div className="grid gap-8 lg:grid-cols-12">
            <h2
              id="faq-title"
              className="text-h2 font-bold text-balance text-fg lg:sticky lg:top-24 lg:col-span-4 lg:self-start"
            >
              {c.faq.title}
            </h2>
            <div className="divide-y divide-border lg:col-span-8">
              {c.faq.items.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-body font-semibold text-fg [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <svg
                      aria-hidden
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="shrink-0 text-fg-muted transition-transform duration-200 group-open:rotate-180"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="pb-4 text-body text-fg-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </Section>

        {/* Final CTA */}
        <Section tone="app" labelledBy="final-title">
          <Reveal className="mx-auto grid max-w-3xl justify-items-center gap-6 text-center">
            <span aria-hidden className="bg-celestial h-1 w-24 rounded-pill" />
            <h2 id="final-title" className="text-h1 font-bold text-balance text-fg">
              {c.final.title}
            </h2>
            <p className="text-lead text-fg-muted">{c.final.body}</p>
            <Link href="/app/home" className={PRIMARY}>
              {c.final.cta}
            </Link>
          </Reveal>
        </Section>
      </main>

      <footer className="border-t border-border bg-app py-12">
        <div className={`${CONTAINER} grid gap-4 md:grid-cols-[1fr_auto] md:items-center`}>
          <div className="grid gap-1">
            <span className="bg-celestial bg-clip-text text-h3 font-bold text-transparent">
              Lamim
            </span>
            <p className="text-caption text-fg-muted">{c.footer.tagline}</p>
            <p className="text-caption text-fg-muted">{c.footer.rights}</p>
          </div>
          <nav aria-label={lang === 'bn' ? 'ফুটার' : 'Footer'} className="flex flex-wrap gap-2">
            <Link
              href={paths.privacy}
              className="inline-flex min-h-11 items-center rounded-pill px-4 text-body text-fg-muted transition-colors hover:bg-surface-subtle hover:text-fg"
            >
              {c.footer.privacyLink}
            </Link>
            <Link
              href="/app/home"
              className="inline-flex min-h-11 items-center rounded-pill px-4 text-body text-fg-muted transition-colors hover:bg-surface-subtle hover:text-fg"
            >
              {c.nav.openApp}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
