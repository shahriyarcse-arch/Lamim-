import { test, expect } from '@playwright/test';

test.describe('Multi-Tab Synchronization Tests', () => {
  test('BroadcastChannel propagates real-time updates between two pages', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('/app/index.html');
    await page2.goto('/app/index.html');
    await page1.waitForFunction(() => typeof DB !== 'undefined');
    await page2.waitForFunction(() => typeof DB !== 'undefined');

    // Write from Page 1
    await page1.evaluate(async () => {
      DB.set('multi_tab_sync_key', { synced: true, timestamp: Date.now() });
      await DB._writeChain;
    });

    await page2.waitForTimeout(500);

    // Read from Page 2
    const page2Read = await page2.evaluate(() => {
      return DB.get('multi_tab_sync_key');
    });

    expect(page2Read).not.toBeNull();
    expect(page2Read.synced).toBe(true);

    await page1.close();
    await page2.close();
  });
});
