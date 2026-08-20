import { test, expect } from '@playwright/test';

test('Verify Automatic English to Bangla Name Transliteration on Language Toggle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/app/index.html', { waitUntil: 'networkidle' });

  // 1. User registers with English Name "Shahriyar"
  await page.evaluate(() => {
    const defaultUser = {
      id: 'usr_test_lang',
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

  // 2. In English Mode, verify Home greeting has English Name
  const greetingEl = page.locator('#home-greeting');
  await expect(greetingEl).toContainText('Shahriyar');
  console.log('English Greeting:', await greetingEl.innerText());

  // 3. Switch language to Bangla
  await page.evaluate(() => {
    if (window.App && App.setLang) App.setLang('bn');
  });
  await page.waitForTimeout(600);

  // 4. In Bangla Mode, verify Home greeting has Bengali Name "শাহরিয়ার"
  await expect(greetingEl).toContainText('শাহরিয়ার');
  console.log('Bangla Greeting:', await greetingEl.innerText());

  // 5. Navigate to Profile and check display name in Bangla
  await page.evaluate(() => {
    if (window.App && App.showSection) App.showSection('profile');
  });
  await page.waitForTimeout(600);

  const profNameEl = page.locator('#prof-display-name');
  await expect(profNameEl).toContainText('শাহরিয়ার');
  console.log('Profile Display Name (Bangla):', await profNameEl.innerText());

  // 6. Switch back to English and check that it restores "Shahriyar"
  await page.evaluate(() => {
    if (window.App && App.setLang) App.setLang('en');
  });
  await page.waitForTimeout(600);

  await expect(profNameEl).toContainText('Shahriyar');
  console.log('Profile Display Name (English Restored):', await profNameEl.innerText());
});
