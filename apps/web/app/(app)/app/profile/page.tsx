'use client';

import { getProfile } from '@lamim/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp } from '@/components/app/app-provider';
import { PrayerSettingsCard } from '@/components/settings/prayer-settings-card';
import { PreferencesCard } from '@/components/settings/preferences-card';
import { ProfileCard } from '@/components/settings/profile-card';

export default function ProfilePage() {
  const { db, profileId, t } = useApp();
  const profile = useLiveQuery(() => getProfile(db, profileId), [db, profileId]);

  return (
    <div className="grid gap-6">
      <h1 className="text-h1 font-bold text-fg">{t('profile.title')}</h1>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-6">
          {profile ? (
            <ProfileCard profile={profile} />
          ) : (
            <div aria-busy className="min-h-48 animate-pulse rounded-xl bg-surface-subtle" />
          )}
          <PreferencesCard />
        </div>
        <PrayerSettingsCard />
      </div>
    </div>
  );
}
