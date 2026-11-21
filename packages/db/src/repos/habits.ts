/**
 * Habits repository. Relapses are append-only `habitEvents` rows; the current
 * streak is derived (core `habitStats`), never written back onto the habit.
 */
import { habitStats, isDateStr, type DateStr } from '@lamim/core';
import type { Habit, HabitEvent, LamimDB } from '../schema';
import { uuidv7 } from '../uuid';
import { enqueueSync, nextUpdatedAt } from './common';

export class HabitError extends Error {
  override name = 'HabitError';
}

export interface HabitWithEvents {
  habit: Habit;
  /** Live events, oldest first. */
  events: HabitEvent[];
}

export async function listHabits(db: LamimDB, profileId: string): Promise<HabitWithEvents[]> {
  const habits = (await db.habits.where('profileId').equals(profileId).toArray()).filter(
    (h) => h.deletedAt === null,
  );
  if (habits.length === 0) return [];
  const events = (
    await db.habitEvents
      .where('habitId')
      .anyOf(habits.map((h) => h.id))
      .toArray()
  ).filter((e) => e.deletedAt === null);
  return habits
    .sort((a, b) => (a.trackedSince ?? a.startDate).localeCompare(b.trackedSince ?? b.startDate))
    .map((habit) => ({
      habit,
      events: events
        .filter((e) => e.habitId === habit.id)
        .sort((a, b) => (a.at ?? a.date).localeCompare(b.at ?? b.date)),
    }));
}

export interface CreateHabitInput {
  profileId: string;
  label: string;
  icon?: string | null;
  /** When the user stopped (ISO); defaults to now. Cannot be in the future. */
  startIso?: string;
  now?: number;
}

export async function createHabit(db: LamimDB, input: CreateHabitInput): Promise<Habit> {
  const label = input.label.trim();
  if (!input.profileId) throw new HabitError('profileId is required');
  if (!label || label.length > 60) throw new HabitError('Habit name must be 1–60 characters');
  const now = input.now ?? Date.now();
  const start = input.startIso ? Date.parse(input.startIso) : now;
  if (!Number.isFinite(start)) throw new HabitError('Invalid start date');
  if (start > now + 60_000) throw new HabitError('Start date cannot be in the future');
  const startIso = new Date(start).toISOString();
  const habit: Habit = {
    id: uuidv7(now),
    profileId: input.profileId,
    label,
    icon: input.icon ?? null,
    color: null,
    startDate: startIso,
    trackedSince: startIso,
    updatedAt: now,
    deletedAt: null,
  };
  await db.transaction('rw', db.habits, db.syncQueue, async () => {
    await db.habits.add(habit);
    await enqueueSync(db, 'habits', habit.id, 'put', now);
  });
  return habit;
}

export interface RelapseInput {
  profileId: string;
  habitId: string;
  /** Waking date the relapse belongs to (Spirit Score day). */
  date: DateStr;
  reason?: string;
  now?: number;
}

/** Appends a relapse event recording the streak (days) it ended. Returns the event. */
export async function logRelapse(db: LamimDB, input: RelapseInput): Promise<HabitEvent> {
  if (!isDateStr(input.date)) throw new HabitError(`Invalid date: ${input.date}`);
  const reason = (input.reason ?? '').trim();
  if (reason.length > 200) throw new HabitError('Reason must be at most 200 characters');
  const now = input.now ?? Date.now();

  return db.transaction('rw', db.habits, db.habitEvents, db.syncQueue, async () => {
    const habit = await db.habits.get(input.habitId);
    if (!habit || habit.profileId !== input.profileId || habit.deletedAt !== null) {
      throw new HabitError('Habit not found');
    }
    const events = (await db.habitEvents.where('habitId').equals(habit.id).toArray()).filter(
      (e) => e.deletedAt === null,
    );
    const stats = habitStats(habit.startDate, events, now);
    const event: HabitEvent = {
      id: uuidv7(now),
      profileId: habit.profileId,
      habitId: habit.id,
      date: input.date,
      type: 'relapse',
      at: new Date(now).toISOString(),
      reason: reason || null,
      streak: stats.current.days,
      updatedAt: now,
      deletedAt: null,
    };
    await db.habitEvents.add(event);
    await enqueueSync(db, 'habitEvents', event.id, 'put', now);
    return event;
  });
}

/** Undo a mistaken relapse: tombstones the event (the row is never edited otherwise). */
export async function undoRelapse(
  db: LamimDB,
  profileId: string,
  eventId: string,
  now = Date.now(),
): Promise<void> {
  await db.transaction('rw', db.habitEvents, db.syncQueue, async () => {
    const event = await db.habitEvents.get(eventId);
    if (
      !event ||
      event.profileId !== profileId ||
      event.deletedAt !== null ||
      event.type !== 'relapse'
    ) {
      throw new HabitError('Relapse not found');
    }
    const updatedAt = nextUpdatedAt(event.updatedAt, now);
    await db.habitEvents.update(eventId, { deletedAt: updatedAt, updatedAt });
    await enqueueSync(db, 'habitEvents', eventId, 'delete', now);
  });
}

export async function deleteHabit(
  db: LamimDB,
  profileId: string,
  habitId: string,
  now = Date.now(),
): Promise<void> {
  await db.transaction('rw', db.habits, db.syncQueue, async () => {
    const habit = await db.habits.get(habitId);
    if (!habit || habit.profileId !== profileId || habit.deletedAt !== null)
      throw new HabitError('Habit not found');
    const updatedAt = nextUpdatedAt(habit.updatedAt, now);
    await db.habits.update(habitId, { deletedAt: updatedAt, updatedAt });
    await enqueueSync(db, 'habits', habitId, 'delete', now);
  });
}
