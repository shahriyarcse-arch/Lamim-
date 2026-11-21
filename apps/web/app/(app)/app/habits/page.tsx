'use client';

import { listHabits } from '@lamim/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useApp } from '@/components/app/app-provider';
import { AddHabit } from '@/components/habits/add-habit';
import { BreathingCircle } from '@/components/habits/breathing';
import { HabitCard } from '@/components/habits/habit-card';
import { useMinuteClock } from '@/components/salah/use-clock';

export default function HabitsPage() {
  const { db, profileId, t } = useApp();
  const clock = useMinuteClock();
  const habits = useLiveQuery(() => listHabits(db, profileId), [db, profileId]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-h1 font-bold text-fg">{t('habits.title')}</h1>
        <p className="text-body text-fg-muted">{t('habits.intro')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="grid gap-4">
          {habits === undefined ? (
            <div aria-busy className="min-h-24 animate-pulse rounded-xl bg-surface-subtle" />
          ) : habits.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-body text-fg-muted">
              {t('habits.empty')}
            </p>
          ) : (
            <ul className="grid gap-4">
              {habits.map((item) => (
                <HabitCard
                  key={item.habit.id}
                  item={item}
                  minuteNow={clock.now}
                  today={clock.wakingDate}
                />
              ))}
            </ul>
          )}
          <AddHabit />
        </div>
        <BreathingCircle />
      </div>
    </div>
  );
}
