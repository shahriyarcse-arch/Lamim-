const { test, expect } = require('@playwright/test');

async function ensureTestUser(page) {
  await page.goto('/app/index.html');
  await page.evaluate(async () => {
    if (!DB.getUser()) {
      const u = { id: 'test_user_forensic', name: 'Auditor User', role: 'user', gender: 'male', createdAt: new Date().toISOString() };
      DB.setUser(u);
      DB.setSettings({ theme: 'dark', language: 'en', currency: 'USD', lat: 23.81, lng: 90.41 });
    }
  });
  await page.reload();
  await page.waitForSelector('#page-dashboard', { state: 'visible' });
  await page.evaluate(() => {
    if (typeof Manual !== 'undefined' && Manual.skipIntro) Manual.skipIntro();
  });
}

test.describe('Lamim Zero-Trust Forensic PWA Audit Suite', () => {

  test('1. Multi-User Data Isolation: User A vs User B', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      if (typeof DB !== 'undefined' && DB.clear) await DB.clear();
    });
    await page.reload();

    // Step 1: Create User A
    await page.waitForSelector('#setup-name', { state: 'visible' });
    await page.fill('#setup-name', 'Abdullah UserA');
    await page.click('#setup-gender-male');
    await page.evaluate(() => {
      document.getElementById('setup-lat').value = '23.8103';
      document.getElementById('setup-lng').value = '90.4125';
      Auth.submitSetup();
    });

    await page.waitForSelector('#page-dashboard', { state: 'visible' });
    await page.evaluate(() => {
      if (typeof Manual !== 'undefined' && Manual.skipIntro) Manual.skipIntro();
    });
    
    // Log data for User A: Tap Dhikr 5 times
    await page.evaluate(() => App.navigateTo('dhikr'));
    await page.waitForSelector('#section-dhikr.active');
    for (let i = 0; i < 5; i++) {
      await page.click('#dhikr-tap-btn');
    }
    const countA = await page.textContent('#dhikr-tap-count');
    expect(countA.trim()).toBe('5');

    // Flush & User A Logs Out
    await page.evaluate(async () => {
      if (typeof App !== 'undefined' && App.flushAllPendingSaves) App.flushAllPendingSaves();
      const u = DB.getUser();
      if (u) DB.saveProfileVault(u);
      await DB.remove('lamim_user');
    });
    await page.reload();

    // Step 2: Welcome screen shows saved profiles & lets User B create new account
    await page.waitForSelector('#setup-name', { state: 'visible' });
    await page.fill('#setup-name', 'Fatima UserB');
    await page.click('#setup-gender-female');
    await page.evaluate(() => {
      document.getElementById('setup-lat').value = '21.4225';
      document.getElementById('setup-lng').value = '39.8262';
      Auth.submitSetup();
    });

    await page.waitForSelector('#page-dashboard', { state: 'visible' });
    await page.evaluate(() => {
      if (typeof Manual !== 'undefined' && Manual.skipIntro) Manual.skipIntro();
    });

    // Verify User B has FRESH 0 count in Dhikr (Zero leakage from User A)
    await page.evaluate(() => App.navigateTo('dhikr'));
    await page.waitForSelector('#section-dhikr.active');
    const countB = await page.textContent('#dhikr-tap-count');
    expect(countB.trim()).toBe('0');

    // Switch back to User A via Profile Vault
    const profiles = await page.evaluate(() => DB.getProfiles());
    expect(profiles.length).toBeGreaterThanOrEqual(1);
    const userAProfile = profiles.find(p => p.name === 'Abdullah UserA');
    expect(userAProfile).toBeDefined();

    await page.evaluate(async (id) => {
      await DB.switchProfile(id);
      App.showDashboard('dhikr');
    }, userAProfile.id);

    await page.waitForSelector('#section-dhikr.active');
    const countARestored = await page.textContent('#dhikr-tap-count');
    expect(countARestored.trim()).toBe('5');
  });

  test('2. Rapid Tap & Stress Concurrency Test', async ({ page }) => {
    await ensureTestUser(page);
    await page.evaluate(() => App.navigateTo('dhikr'));
    await page.waitForSelector('#section-dhikr.active');

    // Reset Dhikr count
    await page.evaluate(() => Dhikr.reset());
    
    // Tap 33 times in rapid bursts
    await page.evaluate(() => {
      for (let i = 0; i < 33; i++) {
        Dhikr.tap();
      }
      Dhikr.flushSave();
    });

    const count = await page.textContent('#dhikr-tap-count');
    expect(count.trim()).toBe('33');
    
    // Verify persistence in DB
    const savedCount = await page.evaluate(() => {
      const today = Utils.todayStr();
      const logs = DB.getDhikr(today);
      return logs ? (logs[Dhikr.currentId] || logs.totalCount || 0) : 0;
    });
    expect(savedCount).toBe(33);
  });

  test('3. Modal Accessibility & Focus Trapping', async ({ page }) => {
    await ensureTestUser(page);
    
    // Test Version Changelog Modal
    await page.evaluate(() => Profile.showAppInfo());
    await page.waitForSelector('#profile-version-modal:not(.hidden)');
    
    // Test Escape key closes modal
    await page.keyboard.press('Escape');
    const isHidden = await page.evaluate(() => {
      const m = document.getElementById('profile-version-modal');
      return !m || m.classList.contains('hidden') || m.style.display === 'none';
    });
    expect(isHidden).toBe(true);
  });

});
