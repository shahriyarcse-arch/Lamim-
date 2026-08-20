import { test, expect } from '@playwright/test';

test('Verify Restored Original Light Mode Contrast', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/app/index.html', { waitUntil: 'networkidle' });

  // Mock user logged in
  await page.evaluate(() => {
    const defaultUser = {
      id: 'usr_test_1',
      name: 'shahriyar',
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

  // Set theme to light
  await page.evaluate(() => {
    if (window.Profile && Profile.setTheme) {
      Profile.setTheme('light');
    }
  });
  await page.waitForTimeout(600);

  // Capture Home
  await page.screenshot({ path: 'test-results/restored-home-light.png', fullPage: false });

  // Switch to Nafl Salah
  await page.evaluate(() => {
    if (window.App && App.showSection) App.showSection('nafl');
  });
  await page.waitForTimeout(600);

  // Capture Nafl Salah
  await page.screenshot({ path: 'test-results/restored-nafl-light.png', fullPage: false });
});
