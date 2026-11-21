'use client';

import { updateSettings, type Settings } from '@lamim/db';
import { useApp } from '@/components/app/app-provider';
import { Segmented } from './segmented';

/** Language and theme apply instantly: settings are live-queried by the app shell. */
export function PreferencesCard() {
  const { db, profileId, settings, t } = useApp();

  const save = (patch: Partial<Pick<Settings, 'lang' | 'theme'>>) =>
    updateSettings(db, profileId, patch).catch((e: unknown) =>
      console.error(JSON.stringify({ event: 'settings.save.failed', message: String(e) })),
    );

  return (
    <section
      aria-labelledby="prefs-heading"
      className="grid gap-6 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <h2 id="prefs-heading" className="text-lead font-semibold text-fg">
        {t('prefs.title')}
      </h2>
      <Segmented<Settings['lang']>
        legend={t('prefs.language')}
        value={settings.lang}
        onChange={(lang) => void save({ lang })}
        options={[
          // Each language is named in itself, so it is findable whichever language is active.
          { value: 'en', label: 'English', lang: 'en' },
          { value: 'bn', label: 'বাংলা', lang: 'bn' },
        ]}
      />
      <Segmented<Settings['theme']>
        legend={t('prefs.theme')}
        value={settings.theme}
        onChange={(theme) => void save({ theme })}
        options={[
          { value: 'light', label: t('prefs.theme.light') },
          { value: 'dark', label: t('prefs.theme.dark') },
          { value: 'system', label: t('prefs.theme.system') },
        ]}
      />
    </section>
  );
}
