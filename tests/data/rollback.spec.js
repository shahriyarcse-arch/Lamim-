import { test, expect } from '@playwright/test';

test.describe('Cache Rollback on Write Failure Tests', () => {
  test('In-memory cache rolls back to previous value if transaction rejects', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof DB !== 'undefined');

    const rollbackResult = await page.evaluate(async () => {
      // 1. Initial valid write
      DB.set('rollback_test_key', { step: 'initial' });
      await DB._writeChain;
      const initialVal = DB.get('rollback_test_key');

      // 2. Simulate transaction write failure by mocking closed/errored DB store
      const origDb = DB._db;
      const fakeStore = {
        put: () => {
          const req = {};
          setTimeout(() => {
            if (req.onerror) req.onerror({ target: { error: new Error('Simulated QuotaExceededError') } });
          }, 10);
          return req;
        }
      };
      DB._db = {
        transaction: () => ({
          objectStore: () => fakeStore
        })
      };

      // 3. Attempt write which will fail
      DB.set('rollback_test_key', { step: 'corrupted' });
      await DB._writeChain;

      // 4. Verify cache was restored to initial value
      const rolledBackVal = DB.get('rollback_test_key');

      // Restore real DB connection
      DB._db = origDb;

      return {
        initialCorrect: initialVal && initialVal.step === 'initial',
        rolledBackCorrect: rolledBackVal && rolledBackVal.step === 'initial'
      };
    });

    expect(rollbackResult.initialCorrect).toBe(true);
    expect(rollbackResult.rolledBackCorrect).toBe(true);
  });
});
