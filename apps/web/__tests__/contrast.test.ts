/**
 * WCAG contrast gate for the design tokens in app/globals.css.
 * Fails the build if any text/background pairing drops below AA.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(fileURLToPath(new URL('../app/globals.css', import.meta.url)), 'utf8');

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3; // WCAG 1.4.11 — icons, borders, focus rings, fills
const BRANDS = ['terracotta', 'raspberry', 'violet', 'iris', 'azure', 'cerulean'] as const;

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`Block not found: ${selector}`);
  return css.slice(start, css.indexOf('\n}', start));
}

function tokens(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of source.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g))
    out[m[1]!] = m[2]!.toUpperCase();
  return out;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const theme = tokens(block('@theme'));
const light = tokens(block(':root'));
const dark = tokens(block("[data-theme='dark']"));

// Landing tones (warm palette): same token names, same AA gates.
const night = tokens(block('.tone-night'));
const cream = tokens(block('.tone-cream'));

const themes = { light, dark, night, cream };
const backgrounds = (t: Record<string, string>) => ({
  app: t['bg-app']!,
  surface: t['bg-surface']!,
  'surface-subtle': t['bg-surface-subtle']!,
});

describe('brand palette', () => {
  it('matches the 6 official hex codes exactly', () => {
    expect(BRANDS.map((b) => theme[`color-${b}`])).toEqual([
      '#C25E5E',
      '#C05683',
      '#A45EAA',
      '#656EC9',
      '#007CD3',
      '#0085C1',
    ]);
  });
});

describe.each(Object.entries(themes))('%s theme', (_name, t) => {
  const bgs = backgrounds(t);

  it('defines every background', () => {
    for (const v of Object.values(bgs)) expect(v).toMatch(/^#[0-9A-F]{6}$/);
  });

  it.each(['text-primary', 'text-secondary', 'text-tertiary'])(
    '%s ≥ 4.5:1 on every surface',
    (token) => {
      for (const [bg, value] of Object.entries(bgs)) {
        expect(contrast(t[token]!, value), `${token} on ${bg}`).toBeGreaterThanOrEqual(AA_TEXT);
      }
    },
  );

  it.each(BRANDS)('%s text color ≥ 4.5:1 on every surface', (brand) => {
    for (const [bg, value] of Object.entries(bgs)) {
      expect(
        contrast(t[`brand-text-${brand}`]!, value),
        `${brand} text on ${bg}`,
      ).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });

  it.each(BRANDS)('%s brand fill ≥ 3:1 against every surface (non-text)', (brand) => {
    for (const [bg, value] of Object.entries(bgs)) {
      expect(contrast(theme[`color-${brand}`]!, value), `${brand} on ${bg}`).toBeGreaterThanOrEqual(
        AA_NON_TEXT,
      );
    }
  });

  it('focus ring ≥ 3:1 on every surface', () => {
    for (const [bg, value] of Object.entries(bgs)) {
      expect(contrast(t['border-focus']!, value), `focus on ${bg}`).toBeGreaterThanOrEqual(
        AA_NON_TEXT,
      );
    }
  });
});

describe('strong brand fills', () => {
  it.each(BRANDS)('white body text on bg-%s-strong ≥ 4.5:1', (brand) => {
    expect(contrast('#FFFFFF', theme[`color-${brand}-strong`]!)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  it('documents why: raw brand hexes fail white body text (except iris)', () => {
    const failing = BRANDS.filter((b) => contrast('#FFFFFF', theme[`color-${b}`]!) < AA_TEXT);
    expect(failing).toEqual(['terracotta', 'raspberry', 'violet', 'azure', 'cerulean']);
  });
});
