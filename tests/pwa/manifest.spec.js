import { test, expect } from '@playwright/test';

test.describe('PWA Manifest & AssetLinks Tests', () => {
  test('Root manifest.json is valid and contains standard fields', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.name).toContain('Lamim');
    expect(json.short_name).toBe('Lamim');
    expect(json.display).toBe('standalone');
    expect(json.icons.length).toBeGreaterThan(0);
    expect(json.icons.some(i => i.purpose && i.purpose.includes('maskable'))).toBe(true);
  });

  test('App manifest.json is valid and contains standard metadata', async ({ page }) => {
    const response = await page.goto('/app/manifest.json');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.name).toContain('Lamim');
    expect(json.scope).toBe('/');
    expect(json.start_url).toBe('/app/index.html');
  });

  test('Digital AssetLinks is present and valid JSON', async ({ page }) => {
    const response = await page.goto('/.well-known/assetlinks.json');
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].relation).toBeDefined();
    expect(json[0].target.namespace).toBe('android_app');
  });
});
