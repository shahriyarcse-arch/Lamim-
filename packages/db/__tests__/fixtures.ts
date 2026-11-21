import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { LamimDB } from '../src/schema';
import type { StorageLike } from '../src/legacy/source';

export const A = '3f1c2a9e-8d4b-4c1e-9f2a-6b7c8d9e0f1a'; // crypto.randomUUID-style id
export const R = 'usr_1700000000000'; // older 'usr_' + Date.now() id (contains underscores)

const userA = {
  id: A,
  name: 'Amina',
  email: 'local@lamim.offline',
  role: 'user',
  gender: 'female',
  dob: '1998-04-12',
  bio: 'hi',
  avatar: null,
  createdAt: '2025-01-10T08:00:00.000Z',
};

/** Values are JSON-encoded on write unless wrapped in raw(). */
export const raw = (s: string) => ({ __raw: s });

export const LEGACY_IDB: Record<string, unknown> = {
  lamim_user: userA,
  lamim_profiles_vault: [
    { id: A, name: 'Amina', gender: 'female', lastActive: '2026-11-20T10:00:00Z', userData: userA },
    {
      id: R,
      name: 'Rahim',
      gender: 'male',
      userData: { id: R, name: 'Rahim', gender: 'male', dob: '' },
    },
    { name: 'no id, no userData' },
  ],
  lamim_lang: raw('bn'),
  lamim_dhikr_presets: [{ id: 'p1', latin: 'Ya Latif', target: 129 }],
  lamim_current_sw_version: raw('v9'),

  [`usr_${A}_lamim_settings`]: {
    language: 'bn',
    currency: 'BDT',
    lat: 23.81,
    lng: 90.41,
    locationName: 'Dhaka',
    hijriOffset: -1,
    theme: 'dark',
    notifications: true,
    jumuahMode: true,
  },
  [`usr_${A}_lamim_salah_2026-11-20`]: {
    fajr: 'jamaat',
    dhuhr: 'alone',
    asr: 'qaza',
    maghrib: 'missed',
    isha: null,
    tahajjud: true,
    tahajjud_rakat: 8,
    witr: 3,
    jummah: false,
    notes: { fajr: 'late' },
    sunnah: { fajr_s: true },
  },
  [`usr_${A}_lamim_salah_2026-11-21`]: { fajr: 'jamaah', dhuhr: 'prayed', asr: 'weird' },
  [`usr_${A}_lamim_salah_2026-02-30`]: { fajr: 'jamaat' },
  [`usr_${A}_lamim_salah_intro_done`]: true,
  [`usr_${A}_lamim_dhikr_2026-11-20`]: { subhanallah: 33, alhamdulillah: '34', bad: 'x' },
  [`usr_${A}_lamim_gym_2026-11-20`]: { water: { amount: 1500, goal: 3000 } },
  [`usr_${A}_lamim_career_2026-11-20`]: {
    studyDuration: 45,
    checklist: [{ id: 1, text: 'Read', done: true }],
  },
  [`usr_${A}_lamim_gym_body_metrics`]: { entries: [{ date: '2026-11-01', weight: 60 }] },
  [`usr_${A}_lamim_dhikr_2026-11-18`]: raw('{not json'),
  [`usr_${A}_lamim_habits`]: [
    {
      id: 'custom-abc',
      label: 'No sugar',
      icon: 'leaf',
      color: '#6366f1',
      startDate: '2026-11-01T00:00:00.000Z',
      customStart: true,
      longestStreak: 5,
      history: [
        {
          date: '2026-10-30',
          fullDate: '2026-10-30T10:00:00.000Z',
          reason: 'Tom &amp; Jerry &lt;3',
          streak: 4,
          clean: false,
        },
        { date: 'bad', clean: false },
      ],
    },
    'not an object',
  ],
  [`usr_${A}_lamim_finance`]: {
    nisab: 600,
    cash: 100.5,
    gold: 0,
    debts: [{ name: 'loan', amount: 10 }],
    income: [
      { id: 'i1', description: 'Salary', amount: 1000.1, date: '2026-11-01' },
      { id: 'i2', amount: 0.2, date: '2026-11-02' },
    ],
    expenses: [
      { id: 'e1', description: 'Food', amount: 0.1, category: 'food', date: '2026-11-03' },
      {
        id: 'e2',
        description: 'Vault Deposit: Hajj',
        amount: 50,
        category: 'transfer',
        vaultId: 'v1',
        date: '2026-11-04',
      },
      { id: 'e3', amount: 'NaN', date: '2026-11-04' },
      { id: 'e4', amount: 5, date: '2026-11-05T10:00:00.000Z', category: 'transport' },
    ],
    savings: [{ id: 'v1', name: 'Hajj', target: 5000, saved: 50 }],
  },

  [`usr_${R}_lamim_salah_2026-11-20`]: { fajr: 'alone' },
  'usr_ghost_lamim_salah_2026-11-20': { fajr: 'alone' },
  'lamim_salah_2025-01-01': { fajr: 'jamaat' }, // pre-multi-profile orphan → active user
};

/** localStorage from sessions where the legacy app fell back (IndexedDB blocked). */
export const LEGACY_LS: Record<string, string> = {
  lamim_settings: JSON.stringify({ currency: 'USD', language: 'en' }),
  lamim_lang: 'bn',
  [`usr_${A}_lamim_salah_2026-11-19`]: JSON.stringify({ fajr: 'jamaat', isha: 'jamaat' }),
  [`usr_${A}_lamim_salah_2026-11-20`]: JSON.stringify({ fajr: 'missed' }), // conflicts; IndexedDB wins
  unrelated_key: 'ignored',
};

export function encode(value: unknown): string {
  return value && typeof value === 'object' && '__raw' in value
    ? (value as { __raw: string }).__raw
    : JSON.stringify(value);
}

export async function seedLegacyIDB(
  factory: IDBFactory,
  entries: Record<string, unknown>,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const req = factory.open('lamim_db', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('keyvalue');
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('keyvalue', 'readwrite');
      for (const [k, v] of Object.entries(entries)) tx.objectStore('keyvalue').put(encode(v), k);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    };
  });
}

export function memoryStorage(entries: Record<string, string>): StorageLike {
  const keys = Object.keys(entries);
  return { length: keys.length, key: (i) => keys[i] ?? null, getItem: (k) => entries[k] ?? null };
}

export function freshEnv() {
  const factory = new IDBFactory();
  const db = new LamimDB('lamim', { indexedDB: factory, IDBKeyRange });
  return { factory, db };
}

export async function databaseNames(factory: IDBFactory): Promise<string[]> {
  return (await factory.databases()).map((d) => d.name ?? '');
}
