import { test, expect } from '@playwright/test';

test('Verify Enhanced Visibility in Light and Dark Modes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/app/index.html', { waitUntil: 'networkidle' });

  // Mock user logged in
  await page.evaluate(() => {
    const defaultUser = {
      id: 'usr_test_1',
      name: 'Shahriyar',
      gender: 'male',
      madhab: 'hanafi',
      createdAt: new Date().toISOString(),
      dob: '2000-01-01',
      spirit_score: 10,
      spirit_level: 'Awakening'
    };
    localStorage.setItem('lamim_user', JSON.stringify(defaultUser));
    localStorage.setItem('lamim_settings', JSON.stringify({
      theme: 'light',
      lang: 'en',
      notifications: true,
      jumuahMode: true
    }));
    localStorage.setItem('lamim_manual_seen', 'true');
    if (window.DB && DB.setUser) {
      DB.setUser(defaultUser);
      DB.setSettings({ theme: 'light', lang: 'en', jumuahMode: true });
    }
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const skipBtn = page.locator('button:has-text("Skip for now")');
  if (await skipBtn.isVisible()) {
    await skipBtn.click();
    await page.waitForTimeout(400);
  }

  // 1. LIGHT MODE - Home
  await page.evaluate(() => {
    if (window.Profile && Profile.setTheme) Profile.setTheme('light');
    if (window.App && App.showSection) App.showSection('home');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/enhanced-home-light.png', fullPage: false });

  // 2. LIGHT MODE - Nafl Salah
  await page.evaluate(() => {
    if (window.App && App.showSection) App.showSection('nafl');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/enhanced-nafl-light.png', fullPage: false });

  // 3. DARK MODE - Home
  await page.evaluate(() => {
    if (window.Profile && Profile.setTheme) Profile.setTheme('dark');
    if (window.App && App.showSection) App.showSection('home');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/enhanced-home-dark.png', fullPage: false });

  // 4. DARK MODE - Nafl Salah
  await page.evaluate(() => {
    if (window.App && App.showSection) App.showSection('nafl');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/enhanced-nafl-dark.png', fullPage: false });
});
