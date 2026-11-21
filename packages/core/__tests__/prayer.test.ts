import * as adhan from 'adhan';
import { beforeEach, describe, expect, it } from 'vitest';
import { addDays, parseDateStr } from '../src/date';
import {
  CALCULATION_METHODS,
  clearPrayerTimesCache,
  countdown,
  createCountdownTicker,
  formatCountdown,
  getCurrentPrayer,
  getNextPrayer,
  getPrayerTimes,
  prayerTimesCacheSize,
  type AsrSchool,
  type CalculationMethod,
  type PrayerSchedule,
} from '../src/prayer';

const DHAKA = { lat: 23.8103, lng: 90.4125 };
const MINUTE = 60_000;

// ---- Oracle: adhan-js (high-precision Meeus solar model) --------------------

const ADHAN_METHOD: Record<CalculationMethod, () => adhan.CalculationParameters> = {
  MWL: () => adhan.CalculationMethod.MuslimWorldLeague(),
  Karachi: () => adhan.CalculationMethod.Karachi(),
  ISNA: () => adhan.CalculationMethod.NorthAmerica(),
  Egypt: () => adhan.CalculationMethod.Egyptian(),
};

function oracle(date: string, lat: number, lng: number, method: CalculationMethod, asr: AsrSchool) {
  const params = ADHAN_METHOD[method]();
  params.madhab = asr === 'hanafi' ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  // Remove adhan's built-in +1 min Dhuhr safety margin so we compare raw astronomy.
  params.methodAdjustments = { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
  const { year, month, day } = parseDateStr(date)!;
  // adhan reads the calendar date from local Date components.
  const t = new adhan.PrayerTimes(
    new adhan.Coordinates(lat, lng),
    new Date(year, month - 1, day),
    params,
  );
  return {
    fajr: t.fajr.getTime(),
    sunrise: t.sunrise.getTime(),
    dhuhr: t.dhuhr.getTime(),
    asr: t.asr.getTime(),
    maghrib: t.maghrib.getTime(),
    isha: t.isha.getTime(),
  };
}

const CITIES = [
  { name: 'Dhaka', lat: 23.8103, lng: 90.4125 },
  { name: 'Chattogram', lat: 22.3569, lng: 91.7832 },
  { name: 'Makkah', lat: 21.4225, lng: 39.8262 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'New York', lat: 40.7128, lng: -74.006 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { name: 'Auckland', lat: -36.8485, lng: 174.7633 },
  { name: 'Honolulu', lat: 21.3069, lng: -157.8583 },
];

function sampleDates(): string[] {
  const dates: string[] = [];
  for (let year = 2020; year <= 2035; year += 3) {
    for (let month = 1; month <= 12; month++) {
      dates.push(`${year}-${String(month).padStart(2, '0')}-${month % 2 ? '01' : '15'}`);
    }
  }
  return dates;
}

const TOLERANCE_MIN = 1;
const KEYS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

function expectWithin(actual: PrayerSchedule, expected: ReturnType<typeof oracle>, ctx: string) {
  for (const key of KEYS) {
    const diffMin = Math.abs(actual[key] - expected[key]) / MINUTE;
    expect(diffMin, `${ctx} ${key} off by ${diffMin} min`).toBeLessThanOrEqual(TOLERANCE_MIN);
  }
}

beforeEach(() => clearPrayerTimesCache());

describe('getPrayerTimes — accuracy against adhan-js', () => {
  it.each(CITIES)('$name, MWL + Hanafi (legacy default), 2020–2035', ({ name, lat, lng }) => {
    if (Math.abs(lat) > 48) return; // high latitudes use different fallback rules; covered below
    for (const date of sampleDates()) {
      const actual = getPrayerTimes({ date, lat, lng });
      expect(actual.fallbacks).toEqual([]);
      expectWithin(actual, oracle(date, lat, lng, 'MWL', 'hanafi'), `${name} ${date}`);
    }
  });

  it('London outside the summer twilight season', () => {
    for (const date of ['2026-01-15', '2026-03-01', '2026-10-15', '2026-12-21']) {
      const { lat, lng } = CITIES[3]!;
      expectWithin(
        getPrayerTimes({ date, lat, lng }),
        oracle(date, lat, lng, 'MWL', 'hanafi'),
        date,
      );
    }
  });

  it.each(Object.keys(CALCULATION_METHODS) as CalculationMethod[])(
    'method %s with both Asr schools (Dhaka, New York)',
    (method) => {
      for (const asr of ['hanafi', 'standard'] as const) {
        for (const city of [CITIES[0]!, CITIES[4]!]) {
          for (const date of ['2026-01-10', '2026-06-21', '2026-11-21']) {
            const actual = getPrayerTimes({ date, lat: city.lat, lng: city.lng, method, asr });
            expectWithin(
              actual,
              oracle(date, city.lat, city.lng, method, asr),
              `${city.name} ${method} ${asr} ${date}`,
            );
          }
        }
      }
    },
  );

  it('Hanafi Asr is later than standard Asr', () => {
    const hanafi = getPrayerTimes({ date: '2026-11-21', ...DHAKA, asr: 'hanafi' });
    const standard = getPrayerTimes({ date: '2026-11-21', ...DHAKA, asr: 'standard' });
    expect(hanafi.asr).toBeGreaterThan(standard.asr);
  });

  it('returns minute-aligned UTC instants for the requested date', () => {
    const t = getPrayerTimes({ date: '2026-11-21', ...DHAKA });
    for (const key of KEYS) expect(t[key] % MINUTE).toBe(0);
    // Dhaka Dhuhr ≈ 11:45 local (05:45 UTC) in late November.
    const dhuhrUtc = new Date(t.dhuhr);
    expect(dhuhrUtc.getUTCDate()).toBe(21);
    expect(dhuhrUtc.getUTCHours()).toBe(5);
  });

  it('handles longitudes near the date line (dhuhr stays on the requested date)', () => {
    for (const lng of [179.9, -179.9]) {
      const t = getPrayerTimes({ date: '2026-06-21', lat: 0, lng });
      expect(new Date(t.dhuhr).getUTCDate()).toBeGreaterThanOrEqual(20);
      expect(t.fajr).toBeLessThan(t.isha);
    }
  });
});

describe('getPrayerTimes — high-latitude fallbacks', () => {
  const ordered = (t: PrayerSchedule) => {
    expect(t.fajr).toBeLessThan(t.sunrise);
    expect(t.sunrise).toBeLessThan(t.dhuhr);
    expect(t.dhuhr).toBeLessThan(t.asr);
    expect(t.asr).toBeLessThan(t.maghrib);
    expect(t.maghrib).toBeLessThan(t.isha);
  };

  it('London midsummer: Fajr/Isha use the 1/7-night rule', () => {
    const t = getPrayerTimes({ date: '2026-06-21', lat: 51.5074, lng: -0.1278 });
    expect(t.fallbacks).toEqual(expect.arrayContaining(['fajr', 'isha']));
    expect(t.fallbacks).not.toContain('sunrise');
    ordered(t);
  });

  it('Tromsø midnight sun: sunrise/sunset clamp to 48.5°', () => {
    const t = getPrayerTimes({ date: '2026-06-21', lat: 69.6492, lng: 18.9553 });
    expect(t.fallbacks).toEqual(expect.arrayContaining(['sunrise', 'maghrib', 'fajr', 'isha']));
    ordered(t);
  });

  it('Tromsø polar night still yields an ordered schedule', () => {
    const t = getPrayerTimes({ date: '2026-12-21', lat: 69.6492, lng: 18.9553 });
    expect(t.fallbacks).toContain('sunrise');
    ordered(t);
  });

  it('southern hemisphere polar latitude', () => {
    ordered(getPrayerTimes({ date: '2026-12-21', lat: -70, lng: 0 }));
  });

  it('poles do not throw', () => {
    expect(() => getPrayerTimes({ date: '2026-06-21', lat: 90, lng: 0 })).not.toThrow();
    expect(() => getPrayerTimes({ date: '2026-06-21', lat: -90, lng: 0 })).not.toThrow();
  });
});

describe('getPrayerTimes — validation', () => {
  it.each([
    { lat: 91, lng: 0 },
    { lat: -90.1, lng: 0 },
    { lat: Number.NaN, lng: 0 },
    { lat: 0, lng: 180.5 },
    { lat: 0, lng: Number.POSITIVE_INFINITY },
  ])('rejects coordinates %o', (coords) => {
    expect(() => getPrayerTimes({ date: '2026-11-21', ...coords })).toThrow(RangeError);
  });

  it('rejects unknown methods and bad dates', () => {
    expect(() =>
      getPrayerTimes({ date: '2026-11-21', ...DHAKA, method: 'Nope' as CalculationMethod }),
    ).toThrow(RangeError);
    expect(() => getPrayerTimes({ date: '2026-11-31', ...DHAKA })).toThrow(RangeError);
  });
});

describe('getPrayerTimes — memoization', () => {
  it('returns the identical frozen object for the same key', () => {
    const a = getPrayerTimes({ date: '2026-11-21', ...DHAKA });
    const b = getPrayerTimes({ date: '2026-11-21', ...DHAKA, method: 'MWL', asr: 'hanafi' });
    expect(b).toBe(a);
    expect(Object.isFrozen(a)).toBe(true);
    expect(prayerTimesCacheSize()).toBe(1);
  });

  it('keys on date, coordinates, method and Asr school', () => {
    const base = getPrayerTimes({ date: '2026-11-21', ...DHAKA });
    expect(getPrayerTimes({ date: '2026-11-22', ...DHAKA })).not.toBe(base);
    expect(getPrayerTimes({ date: '2026-11-21', lat: 23.9, lng: DHAKA.lng })).not.toBe(base);
    expect(getPrayerTimes({ date: '2026-11-21', ...DHAKA, method: 'Karachi' })).not.toBe(base);
    expect(getPrayerTimes({ date: '2026-11-21', ...DHAKA, asr: 'standard' })).not.toBe(base);
    expect(prayerTimesCacheSize()).toBe(5);
  });

  it('treats sub-metre coordinate jitter as the same location', () => {
    const a = getPrayerTimes({ date: '2026-11-21', lat: 23.810300001, lng: 90.412500001 });
    expect(getPrayerTimes({ date: '2026-11-21', ...DHAKA })).toBe(a);
  });

  it('is bounded (LRU) and clearable', () => {
    let date = '2026-01-01';
    for (let i = 0; i < 200; i++) {
      getPrayerTimes({ date, ...DHAKA });
      date = addDays(date, 1);
    }
    expect(prayerTimesCacheSize()).toBe(64);
    clearPrayerTimesCache();
    expect(prayerTimesCacheSize()).toBe(0);
  });

  it('LRU keeps recently used entries', () => {
    const hot = getPrayerTimes({ date: '2025-01-01', ...DHAKA });
    let date = '2026-01-01';
    for (let i = 0; i < 100; i++) {
      getPrayerTimes({ date: '2025-01-01', ...DHAKA }); // touch
      getPrayerTimes({ date, ...DHAKA });
      date = addDays(date, 1);
    }
    expect(getPrayerTimes({ date: '2025-01-01', ...DHAKA })).toBe(hot);
  });
});

describe('getNextPrayer / getCurrentPrayer', () => {
  const input = { date: '2026-11-21', ...DHAKA };

  it('walks through the day in order', () => {
    const t = getPrayerTimes(input);
    expect(getNextPrayer(input, t.fajr - 1)).toEqual({
      name: 'fajr',
      at: t.fajr,
      isTomorrow: false,
    });
    expect(getNextPrayer(input, t.fajr).name).toBe('dhuhr'); // strictly after
    expect(getNextPrayer(input, t.dhuhr + 1).name).toBe('asr');
    expect(getNextPrayer(input, t.asr).name).toBe('maghrib');
    expect(getNextPrayer(input, t.maghrib).name).toBe('isha');
  });

  it("after Isha returns tomorrow's actual Fajr", () => {
    const t = getPrayerTimes(input);
    const tomorrow = getPrayerTimes({ ...input, date: '2026-11-22' });
    expect(getNextPrayer(input, t.isha)).toEqual({
      name: 'fajr',
      at: tomorrow.fajr,
      isTomorrow: true,
    });
  });

  it('getCurrentPrayer', () => {
    const t = getPrayerTimes(input);
    expect(getCurrentPrayer(t, t.fajr - 1)).toBeNull();
    expect(getCurrentPrayer(t, t.fajr)).toBe('fajr');
    expect(getCurrentPrayer(t, t.asr + MINUTE)).toBe('asr');
    expect(getCurrentPrayer(t, t.isha + 3 * 3_600_000)).toBe('isha');
  });
});

describe('countdown', () => {
  it.each([
    [0, '00:00:00'],
    [-5000, '00:00:00'],
    [1, '00:00:01'],
    [999, '00:00:01'],
    [1000, '00:00:01'],
    [1001, '00:00:02'],
    [59_000, '00:00:59'],
    [3_661_000, '01:01:01'],
    [23 * 3_600_000 + 59 * 60_000 + 59_000, '23:59:59'],
  ])('%i ms → %s', (ms, expected) => {
    expect(formatCountdown(countdown(ms, 0))).toBe(expected);
  });

  it('exposes the raw remaining time', () => {
    expect(countdown(10_500, 500)).toMatchObject({
      totalMs: 10_000,
      hours: 0,
      minutes: 0,
      seconds: 10,
    });
  });
});

describe('createCountdownTicker', () => {
  function fakeEnv(start = 0) {
    let now = start;
    const queue: { at: number; fn: () => void; id: number }[] = [];
    let nextId = 1;
    return {
      now: () => now,
      timers: {
        setTimeout: (fn: () => void, ms: number) => {
          const id = nextId++;
          queue.push({ at: now + ms, fn, id });
          return id;
        },
        clearTimeout: (id: unknown) => {
          const i = queue.findIndex((q) => q.id === id);
          if (i >= 0) queue.splice(i, 1);
        },
      },
      runAll() {
        while (queue.length) {
          queue.sort((a, b) => a.at - b.at);
          const next = queue.shift()!;
          now = next.at;
          next.fn();
        }
      },
      pending: () => queue.length,
    };
  }

  it('ticks once per displayed second, aligned to boundaries, then completes', () => {
    const env = fakeEnv();
    const ticks: string[] = [];
    let completed = 0;
    createCountdownTicker({
      target: 3_500,
      now: env.now,
      timers: env.timers,
      onTick: (c) => ticks.push(formatCountdown(c)),
      onComplete: () => completed++,
    });
    env.runAll();
    expect(ticks).toEqual(['00:00:04', '00:00:03', '00:00:02', '00:00:01', '00:00:00']);
    expect(completed).toBe(1);
    expect(env.pending()).toBe(0);
  });

  it('completes immediately when the target is in the past', () => {
    const env = fakeEnv(10_000);
    let completed = false;
    createCountdownTicker({
      target: 5_000,
      now: env.now,
      timers: env.timers,
      onTick: () => {},
      onComplete: () => (completed = true),
    });
    expect(completed).toBe(true);
    expect(env.pending()).toBe(0);
  });

  it('stop() cancels pending ticks', () => {
    const env = fakeEnv();
    let ticks = 0;
    const ticker = createCountdownTicker({
      target: 60_000,
      now: env.now,
      timers: env.timers,
      onTick: () => ticks++,
    });
    expect(ticks).toBe(1);
    ticker.stop();
    env.runAll();
    expect(ticks).toBe(1);
  });

  it('uses real timers by default', async () => {
    const seen: number[] = [];
    await new Promise<void>((resolve) => {
      createCountdownTicker({
        target: Date.now() + 20,
        onTick: (c) => seen.push(c.totalMs),
        onComplete: resolve,
      });
    });
    expect(seen.at(-1)).toBe(0);
  });
});
