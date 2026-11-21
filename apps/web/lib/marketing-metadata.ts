import type { Metadata } from 'next';
import { MARKETING_COPY, type MarketingLang } from './marketing-content';
import { PRIVACY_COPY } from './privacy-content';
import { MARKETING_PATHS, SITE_URL } from './site';

type Page = 'home' | 'privacy';

/** Generated at build by app/og.png/route.tsx. */
const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'Lamim — Salah, dhikr, habits and halal finance, offline',
};

/** Canonical + hreflang alternates + Open Graph for a marketing page. */
export function marketingMetadata(lang: MarketingLang, page: Page): Metadata {
  const copy = MARKETING_COPY[lang];
  const title = page === 'home' ? copy.meta.title : `${PRIVACY_COPY[lang].title} · Lamim`;
  const description = page === 'home' ? copy.meta.description : PRIVACY_COPY[lang].intro;
  const path = MARKETING_PATHS[lang][page];
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: {
        en: MARKETING_PATHS.en[page],
        bn: MARKETING_PATHS.bn[page],
        'x-default': MARKETING_PATHS.en[page],
      },
    },
    openGraph: {
      type: 'website',
      url: path,
      siteName: 'Lamim',
      title,
      description,
      locale: lang === 'bn' ? 'bn_BD' : 'en_US',
      alternateLocale: lang === 'bn' ? ['en_US'] : ['bn_BD'],
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
    robots: { index: true, follow: true },
  };
}

/** schema.org WebApplication — facts only (free, web/PWA); no ratings or review counts. */
export function landingJsonLd(lang: MarketingLang): string {
  const copy = MARKETING_COPY[lang];
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    browserRequirements: 'Requires a modern browser with JavaScript and IndexedDB',
    name: 'Lamim',
    url: `${SITE_URL}${MARKETING_PATHS[lang].home}`,
    description: copy.meta.description,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web, Android, iOS (installable web app)',
    inLanguage: ['en', 'bn'],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  // Escape "<" so the JSON can never close the <script> element.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
