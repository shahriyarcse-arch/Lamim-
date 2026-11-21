import { LamimDB } from '@lamim/db';

let instance: LamimDB | null = null;

/** Browser-only singleton. IndexedDB does not exist during server rendering. */
export function getDb(): LamimDB {
  if (typeof window === 'undefined') throw new Error('getDb() is browser-only');
  instance ??= new LamimDB();
  return instance;
}
