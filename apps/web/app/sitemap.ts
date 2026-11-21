import type { MetadataRoute } from 'next';
import { MARKETING_PATHS, SITE_URL } from '@/lib/site';

/** Public marketing pages only; the /app PWA is not indexed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-11-21');
  return (['home', 'privacy'] as const).flatMap((page) =>
    (['en', 'bn'] as const).map((lang) => ({
      url: `${SITE_URL}${MARKETING_PATHS[lang][page]}`,
      lastModified,
      changeFrequency: page === 'home' ? ('weekly' as const) : ('yearly' as const),
      priority: page === 'home' ? 1 : 0.3,
      alternates: {
        languages: {
          en: `${SITE_URL}${MARKETING_PATHS.en[page]}`,
          bn: `${SITE_URL}${MARKETING_PATHS.bn[page]}`,
        },
      },
    })),
  );
}
