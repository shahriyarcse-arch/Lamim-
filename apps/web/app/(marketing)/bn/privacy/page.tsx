import { PrivacyPage } from '@/components/marketing/privacy-page';
import { marketingMetadata } from '@/lib/marketing-metadata';

export const metadata = marketingMetadata('bn', 'privacy');

export default function PrivacyBn() {
  return <PrivacyPage lang="bn" />;
}
