import { test, expect } from '@playwright/test';

test.describe('IndexedDB & Data Integrity Tests', () => {
  test('CRUD operations on IndexedDB keyvalue store', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof DB !== 'undefined');

    const result = await page.evaluate(async () => {
      // 1. Create / Write
      DB.set('crud_test_key', { value: 42, label: 'test' });
      await DB._writeChain;

      // 2. Read
      const val1 = DB.get('crud_test_key');

      // 3. Update
      DB.set('crud_test_key', { value: 99, label: 'updated' });
      await DB._writeChain;
      const val2 = DB.get('crud_test_key');

      // 4. Delete
      DB.remove('crud_test_key');
      await DB._writeChain;
      const val3 = DB.get('crud_test_key');

      return {
        writeSuccess: val1 && val1.value === 42,
        updateSuccess: val2 && val2.value === 99,
        deleteSuccess: val3 === null
      };
    });

    expect(result.writeSuccess).toBe(true);
    expect(result.updateSuccess).toBe(true);
    expect(result.deleteSuccess).toBe(true);
  });

  test('Data persists across page reload (Cold boot)', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof DB !== 'undefined');

    // Write key
    await page.evaluate(async () => {
      DB.set('persistent_cold_boot_key', { persisted: true, date: '2026-08-16' });
      await DB._writeChain;
    });

    // Reload page to purge RAM cache
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => typeof DB !== 'undefined');

    // Read back after cold reload
    const readAfterReload = await page.evaluate(() => {
      return DB.get('persistent_cold_boot_key');
    });

    expect(readAfterReload).not.toBeNull();
    expect(readAfterReload.persisted).toBe(true);
  });
});
