'use client';

import { updateProfile, type Gender, type Profile } from '@lamim/db';
import { useEffect, useId, useState } from 'react';
import { useApp } from '@/components/app/app-provider';
import { Segmented } from './segmented';

type GenderChoice = Gender | 'none';

export function ProfileCard({ profile }: { profile: Profile }) {
  const { db, profileId, t } = useApp();
  const nameId = useId();
  const [name, setName] = useState(profile.name);
  const [gender, setGender] = useState<GenderChoice>(
    profile.gender === 'male' || profile.gender === 'female' ? profile.gender : 'none',
  );
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Keep the form in sync if the profile changes elsewhere (another tab).
  useEffect(() => {
    setName(profile.name);
    setGender(profile.gender === 'male' || profile.gender === 'female' ? profile.gender : 'none');
  }, [profile.name, profile.gender]);

  const save = () => {
    updateProfile(db, profileId, { name, gender: gender === 'none' ? null : gender })
      .then(() => setStatus({ ok: true, text: t('profile.saved') }))
      .catch(() => setStatus({ ok: false, text: t('profile.error') }));
  };

  return (
    <section
      aria-labelledby="profile-heading"
      className="grid gap-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
    >
      <h2 id="profile-heading" className="text-lead font-semibold text-fg">
        {t('profile.details')}
      </h2>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className="grid gap-1">
          <label htmlFor={nameId} className="text-caption font-semibold text-fg">
            {t('profile.name')}
          </label>
          <input
            id={nameId}
            value={name}
            maxLength={60}
            required
            autoComplete="name"
            onChange={(e) => {
              setName(e.target.value);
              setStatus(null);
            }}
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-body text-fg focus:outline-2 focus:outline-focus"
          />
        </div>
        <Segmented<GenderChoice>
          legend={t('profile.gender')}
          value={gender}
          onChange={(v) => {
            setGender(v);
            setStatus(null);
          }}
          options={[
            { value: 'male', label: t('profile.gender.male') },
            { value: 'female', label: t('profile.gender.female') },
            { value: 'none', label: t('profile.gender.none') },
          ]}
        />
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            className="rounded-pill bg-cerulean-strong px-6 py-2 text-caption font-semibold text-white transition-[filter] hover:brightness-110 active:brightness-95"
          >
            {t('profile.save')}
          </button>
          {status ? (
            <p
              role={status.ok ? 'status' : 'alert'}
              className={`text-caption ${status.ok ? 'text-fg-muted' : 'text-terracotta-text'}`}
            >
              {status.text}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
