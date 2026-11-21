import { LandingPage } from '@/components/marketing/landing-page';
import { landingJsonLd, marketingMetadata } from '@/lib/marketing-metadata';

export const metadata = marketingMetadata('en', 'home');

export default function MarketingHome() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: landingJsonLd('en') }}
      />
      <LandingPage lang="en" />
    </>
  );
}
