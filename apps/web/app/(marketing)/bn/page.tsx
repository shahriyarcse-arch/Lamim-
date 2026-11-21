import { LandingPage } from '@/components/marketing/landing-page';
import { landingJsonLd, marketingMetadata } from '@/lib/marketing-metadata';

export const metadata = marketingMetadata('bn', 'home');

export default function MarketingHomeBn() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: landingJsonLd('bn') }}
      />
      <LandingPage lang="bn" />
    </>
  );
}
