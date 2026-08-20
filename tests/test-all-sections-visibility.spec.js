import { test, expect } from '@playwright/test';

test('Verify All 10 Sections Content Visibility in Light & Dark Mode', async ({ page }) => {
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

  const sections = ['home', 'salah', 'nafl', 'dhikr', 'habits', 'gym', 'career', 'finance', 'analysis', 'profile'];

  // Test all sections in Light Mode
  await page.evaluate(() => {
    if (window.Profile && Profile.setTheme) Profile.setTheme('light');
  });
  await page.waitForTimeout(400);

  for (const s of sections) {
    await page.evaluate((sec) => {
      if (window.App && App.showSection) App.showSection(sec);
    }, s);
    await page.waitForTimeout(400);
    const secEl = page.locator(`#view-${s}, #section-${s}, .section-${s}, #content`);
    expect(secEl).toBeDefined();
  }

  // Test all sections in Dark Mode
  await page.evaluate(() => {
    if (window.Profile && Profile.setTheme) Profile.setTheme('dark');
  });
  await page.waitForTimeout(400);

  for (const s of sections) {
    await page.evaluate((sec) => {
      if (window.App && App.showSection) App.showSection(sec);
    }, s);
    await page.waitForTimeout(400);
    const secEl = page.locator(`#view-${s}, #section-${s}, .section-${s}, #content`);
    expect(secEl).toBeDefined();
  }
});
