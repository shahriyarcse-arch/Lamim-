import { bootstrap, getSettings, LamimDB } from '@lamim/db';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshLocation } from '../lib/location';

async function freshProfile() {
  const db = new LamimDB('lamim', { indexedDB: new IDBFactory(), IDBKeyRange });
  const { profileId } = await bootstrap(db, { import: { readSources: async () => [] } });
  return { db, profileId };
}

function mockGeolocation(impl: (ok: PositionCallback, fail: PositionErrorCallback) => void) {
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: impl } });
}

const PERMISSION_DENIED = 1;
const positionError = (code: number) =>
  ({
    code,
    PERMISSION_DENIED,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
    message: 'x',
  }) as GeolocationPositionError;

afterEach(() => vi.unstubAllGlobals());

describe('refreshLocation', () => {
  it('stores the position rounded to 4 decimals (~11 m)', async () => {
    const { db, profileId } = await freshProfile();
    mockGeolocation((ok) =>
      ok({ coords: { latitude: 23.810331234, longitude: 90.412518765 } } as GeolocationPosition),
    );
    expect(await refreshLocation(db, profileId)).toBe('ok');
    expect(await getSettings(db, profileId)).toMatchObject({ lat: 23.8103, lng: 90.4125 });
  });

  it('reports a denied permission without touching settings', async () => {
    const { db, profileId } = await freshProfile();
    mockGeolocation((_ok, fail) => fail?.(positionError(PERMISSION_DENIED)));
    expect(await refreshLocation(db, profileId)).toBe('denied');
    expect(await getSettings(db, profileId)).toMatchObject({ lat: null, lng: null });
  });

  it('reports other failures (timeout / unavailable)', async () => {
    const { db, profileId } = await freshProfile();
    mockGeolocation((_ok, fail) => fail?.(positionError(3)));
    expect(await refreshLocation(db, profileId)).toBe('failed');
  });

  it('reports unsupported when the browser has no geolocation', async () => {
    const { db, profileId } = await freshProfile();
    vi.stubGlobal('navigator', {});
    expect(await refreshLocation(db, profileId)).toBe('unsupported');
  });
});
