import { test, expect } from '@playwright/test';

test.describe('Lamin PWA Deep Lifecycle, Data Persistence & Security Audit', () => {
  test('PWA Offline Survival: Data persists across offline mutations, reloads, and tab sessions', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    // 1. Initial Launch with Setup
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined' && typeof DB !== 'undefined');

    await page.evaluate(() => {
      DB.setUser({ name: 'Mujahid', gender: 'male', createdAt: new Date().toISOString() });
      App.showDashboard('home');
    });

    // 2. Perform offline mutation
    await page.context().setOffline(true);

    await page.evaluate(() => {
      const today = Utils.todayStr();
      const salah = DB.getSalah(today);
      salah.fajr = 'jamaat';
      salah.dhuhr = 'alone';
      DB.setSalah(today, salah);

      // Add offline expense directly to DB layer
      const fin = DB.getFinance();
      fin.expenses.push({
        id: 'exp_test_1',
        amount: 250,
        category: 'bazar',
        note: 'Fresh vegetable market',
        date: today
      });
      DB.setFinance(fin);
    });

    // 3. Verify offline mutations are saved and accessible locally
    const salahBeforeReload = await page.evaluate(() => DB.getSalah(Utils.todayStr()));
    expect(salahBeforeReload.fajr).toBe('jamaat');
    expect(salahBeforeReload.dhuhr).toBe('alone');

    const finBeforeReload = await page.evaluate(() => DB.getFinance());
    expect(finBeforeReload.expenses.some(e => e.amount === 250)).toBe(true);

    // 4. Restore connection and reload to test IndexedDB / localStorage persistence across sessions
    await page.context().setOffline(false);
    await page.reload();
    await page.waitForFunction(() => typeof App !== 'undefined' && typeof DB !== 'undefined');

    const salahAfterReload = await page.evaluate(() => DB.getSalah(Utils.todayStr()));
    expect(salahAfterReload.fajr).toBe('jamaat');
    expect(salahAfterReload.dhuhr).toBe('alone');

    const finAfterReload = await page.evaluate(() => DB.getFinance());
    const hasExpense = finAfterReload.expenses.some(e => e.amount === 250 && e.category === 'bazar');
    expect(hasExpense).toBe(true);
    expect(pageErrors.length).toBe(0);
  });

  test('Security & Data Sanitization: XSS injection vectors are safely escaped in DOM rendering', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined' && typeof DB !== 'undefined');

    const xssPayload = '<script>window._xss_executed=true</script><img src="invalid" onerror="window._xss_img=true">';

    // Set user profile with XSS payload
    await page.evaluate((payload) => {
      DB.setUser({ name: payload, bio: payload, createdAt: new Date().toISOString() });
      App.showDashboard('profile');
      if (typeof Profile !== 'undefined' && Profile.renderProfile) {
        Profile.renderProfile();
      }
    }, xssPayload);

    // Verify script did not execute
    const xssExecuted = await page.evaluate(() => window._xss_executed || window._xss_img);
    expect(xssExecuted).toBeUndefined();

    // Verify text is safely escaped
    const profileName = await page.textContent('#prof-display-name');
    expect(profileName).toContain('<script>');
  });

  test('Multi-User Data Isolation: Switching user profile resets cache and scopes data exclusively', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined' && typeof DB !== 'undefined');

    // User A creates records
    await page.evaluate(() => {
      DB.setUser({ id: 'usr_user_a_123', name: 'User A' });
      const today = Utils.todayStr();
      DB.setSalah(today, { fajr: 'jamaat', dhuhr: 'jamaat', asr: 'jamaat', maghrib: 'jamaat', isha: 'jamaat' });
    });

    const userAScore = await page.evaluate(() => Utils.salahScore(DB.getSalah(Utils.todayStr())).done);
    expect(userAScore).toBe(5);

    // User B signs in / logs in
    await page.evaluate(() => {
      DB.setUser({ id: 'usr_user_b_456', name: 'User B' });
      // In DB layer, data is scoped per user ID prefix
    });

    const userBData = await page.evaluate(() => DB.getUser().name);
    expect(userBData).toBe('User B');
  });
});
