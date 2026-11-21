/** Canonical origin (legacy canonical was https://www.lamim.tech). Override per environment. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.lamim.tech').replace(
  /\/$/,
  '',
);

export const MARKETING_PATHS = {
  en: { home: '/', privacy: '/privacy' },
  bn: { home: '/bn', privacy: '/bn/privacy' },
} as const;
