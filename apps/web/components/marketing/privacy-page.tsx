import Link from 'next/link';
import type { MarketingLang } from '@/lib/marketing-content';
import { MARKETING_COPY } from '@/lib/marketing-content';
import { PRIVACY_COPY } from '@/lib/privacy-content';
import { MARKETING_PATHS } from '@/lib/site';

export function PrivacyPage({ lang }: { lang: MarketingLang }) {
  const p = PRIVACY_COPY[lang];
  const c = MARKETING_COPY[lang];
  const other: MarketingLang = lang === 'en' ? 'bn' : 'en';
  return (
    <div lang={lang} className="min-h-dvh bg-app text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-toast) focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2"
      >
        {lang === 'bn' ? 'মূল অংশে যান' : 'Skip to content'}
      </a>
      <header className="border-b border-border bg-app">
        <div className="mx-auto flex min-h-16 w-full max-w-3xl items-center justify-between gap-4 px-4 md:px-8">
          <Link
            href={MARKETING_PATHS[lang].home}
            className="bg-celestial bg-clip-text text-h3 font-bold text-transparent"
          >
            Lamim
          </Link>
          <Link
            href={MARKETING_PATHS[other].privacy}
            hrefLang={other}
            lang={other}
            className="inline-flex min-h-11 items-center rounded-pill border border-border px-4 text-caption font-semibold text-fg transition-colors hover:bg-surface-subtle"
          >
            {c.nav.language}
          </Link>
        </div>
      </header>
      <main id="main" className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-16 md:px-8">
        <div className="grid gap-2">
          <h1 className="text-h1 font-bold text-fg">{p.title}</h1>
          <p className="text-caption text-fg-muted">{p.updated}</p>
        </div>
        <p className="text-lead text-fg-muted">{p.intro}</p>
        {p.sections.map((s) => (
          <section key={s.heading} className="grid gap-2">
            <h2 className="text-h3 font-semibold text-fg">{s.heading}</h2>
            {s.body.map((para) => (
              <p key={para} className="text-body text-fg-muted">
                {para}
              </p>
            ))}
          </section>
        ))}
        <Link
          href={MARKETING_PATHS[lang].home}
          className="text-body font-semibold text-cerulean-text underline underline-offset-4"
        >
          {lang === 'bn' ? 'প্রথম পাতায় ফিরুন' : 'Back to the home page'}
        </Link>
      </main>
    </div>
  );
}
