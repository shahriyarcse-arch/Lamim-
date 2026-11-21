import { updateSettings, type LamimDB } from '@lamim/db';

export type LocationResult = 'ok' | 'denied' | 'unsupported' | 'failed';

/**
 * Ask the browser for the current position (only ever on an explicit tap) and store
 * it rounded to ~11 m — plenty for prayer times, and not an exact address.
 */
export function refreshLocation(db: LamimDB, profileId: string): Promise<LocationResult> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator))
    return Promise.resolve('unsupported');
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const round = (n: number) => Math.round(n * 1e4) / 1e4;
        updateSettings(db, profileId, {
          lat: round(pos.coords.latitude),
          lng: round(pos.coords.longitude),
        })
          .then(() => resolve('ok'))
          .catch(() => resolve('failed'));
      },
      (err) => resolve(err.code === err.PERMISSION_DENIED ? 'denied' : 'failed'),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}
