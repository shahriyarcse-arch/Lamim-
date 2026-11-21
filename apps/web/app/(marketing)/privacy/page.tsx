import { PrivacyPage } from '@/components/marketing/privacy-page';
import { marketingMetadata } from '@/lib/marketing-metadata';

export const metadata = marketingMetadata('en', 'privacy');

export default function Privacy() {
  return <PrivacyPage lang="en" />;
}
