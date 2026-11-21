/**
 * UUID v7 (RFC 9562): 48-bit Unix ms timestamp + 74 random bits.
 * Time-ordered, so ids sort by creation and index locality stays good.
 * Monotonic within one millisecond via a 12-bit counter in rand_a.
 */

let lastMs = -1;
let counter = 0;

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

export function uuidv7(nowMs: number = Date.now()): string {
  let ms = Math.max(0, Math.floor(nowMs));
  if (ms <= lastMs) {
    counter++;
    if (counter > 0xfff) {
      // Counter exhausted inside one ms: borrow the next millisecond.
      lastMs++;
      counter = 0;
    }
    ms = lastMs;
  } else {
    lastMs = ms;
    counter = randomBytes(2).reduce((a, b) => (a << 8) | b, 0) & 0x7ff; // leave headroom
  }

  const b = randomBytes(16);
  // 48-bit big-endian timestamp
  let t = ms;
  for (let i = 5; i >= 0; i--) {
    b[i] = t % 256;
    t = Math.floor(t / 256);
  }
  b[6] = 0x70 | ((counter >> 8) & 0x0f); // version 7 + counter high nibble
  b[7] = counter & 0xff;
  b[8] = 0x80 | (b[8]! & 0x3f); // RFC 4122 variant

  const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const UUID_V7_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function uuidv7Timestamp(id: string): number {
  return Number.parseInt(id.replace(/-/g, '').slice(0, 12), 16);
}
