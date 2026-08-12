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

  test('app shell renders and runs fully offline once the service worker has cached it', async ({ context, page }) => {
    const errors = [];
    // Offline font/CDN fetches are expected to fail; ignore that network noise.
    const isResourceNoise = (m) => /Failed to load resource|net::ERR|ERR_INTERNET_DISCONNECTED|fonts\.g/i.test(m);
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

    // Online load: register the SW and let it precache the full app shell.
    await page.goto('/app/');
    const hasController = () =>
      page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
    try {
      await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 });
    } catch (_) { /* not yet controlling */ }
    if (!(await hasController())) {
      await page.reload();
      await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 });
    }
    expect(await hasController()).toBe(true);

    // Go offline and reload — the SW must serve the cached shell with no live dependency.
    await context.setOffline(true);
    try {
      await page.reload();
    } catch (e) {
      // WebKit can throw an internal error on an offline reload even when the SW serves the cached shell.
      await page.goto('/app/').catch(() => {});
    }

    await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
    // Content rendered into the shell (nav labels are present even when the sidebar is collapsed).
    await expect(page.locator('#app')).toContainText('Salah', { timeout: 15000 });
    await expect(hasController()).resolves.toBe(true);

    await context.setOffline(false);
    const realErrors = errors.filter((e) => !isResourceNoise(e));
    expect(realErrors, 'Unexpected console/page errors while running offline: ' + realErrors.join(' | ')).toEqual([]);
  });
});
