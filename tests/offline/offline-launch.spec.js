import { test, expect } from '@playwright/test';

test.describe('Offline Behavior Tests', () => {
  test('App shell and core modules render offline', async ({ page, context }) => {
    // 1. Initial warm visit
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined');

    // 2. Go offline
    await context.setOffline(true);

    // 3. Navigate within app offline
    const navSuccess = await page.evaluate(() => {
      App.navigateTo('salah');
      return App.currentSection === 'salah';
    });
    expect(navSuccess).toBe(true);

    // 4. Restore online state
    await context.setOffline(false);
  });

  test('IndexedDB operations function without network', async ({ page, context }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof DB !== 'undefined');
    await context.setOffline(true);

    const writeReadOffline = await page.evaluate(async () => {
      DB.set('offline_test_key', { offlineStatus: 'operational', timestamp: Date.now() });
      await DB._writeChain;
      const read = DB.get('offline_test_key');
      return read && read.offlineStatus === 'operational';
    });

    expect(writeReadOffline).toBe(true);
    await context.setOffline(false);
  });
});
