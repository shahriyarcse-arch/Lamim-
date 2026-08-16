import { test, expect } from '@playwright/test';

test.describe('Service Worker Lifecycle Tests', () => {
  test('Service worker script sw.js is accessible with 200 OK', async ({ page }) => {
    const res = await page.goto('/app/sw.js');
    expect(res.status()).toBe(200);
    const content = await res.text();
    expect(content).toContain('CACHE_NAME');
    expect(content).toContain('SKIP_WAITING');
  });

  test('Root sw.js is accessible with 200 OK', async ({ page }) => {
    const res = await page.goto('/sw.js');
    expect(res.status()).toBe(200);
    const content = await res.text();
    expect(content).toContain('CACHE_NAME');
  });
});
