// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('PWA & Offline Capability Suite', () => {
  test('manifest.json loads and contains valid PWA metadata', async ({ page }) => {
    const response = await page.goto('/app/manifest.json');
    expect(response?.status()).toBe(200);

    const json = await response?.json();
    expect(json.name).toBeTruthy();
    expect(json.short_name).toBeTruthy();
    expect(json.start_url).toBeTruthy();
    expect(json.display).toBe('standalone');
    expect(Array.isArray(json.icons)).toBe(true);
    expect(json.icons.length).toBeGreaterThan(0);
  });

  test('sw.js Service Worker script loads with valid HTTP 200 status', async ({ page }) => {
    const response = await page.goto('/app/sw.js');
    expect(response?.status()).toBe(200);

    const text = await response?.text();
    expect(text).toContain('CACHE_NAME');
    expect(text).toContain('install');
    expect(text).toContain('fetch');
  });
});
