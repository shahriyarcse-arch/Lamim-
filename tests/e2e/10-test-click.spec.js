// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('lamim_user', JSON.stringify({
      name: 'Playwright Tester',
      gender: 'male',
      setupComplete: true
    }));
  });
  await page.goto('/app/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
});

test('test click functionality on salah and nafl cards', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.waitForFunction(() => typeof App !== 'undefined' && typeof App.navigateTo === 'function');
  const splash = page.locator('#splash-screen, .splash-screen, .splash');
  if (await splash.count() > 0) {
    await splash.first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
  }

  // 1. Navigate to Salah
  await page.evaluate(() => App.navigateTo('salah'));
  await page.waitForTimeout(600);

  // Click Jamaat button on Fajr
  console.log('Testing Salah Fajr Jamaat click...');
  const fajrCard = page.locator('#salah-card-fajr');
  await expect(fajrCard).toBeVisible();

  const fajrJamaatBtn = fajrCard.locator('.salah-option-btn.jamaat');
  await expect(fajrJamaatBtn).toBeVisible();
  await fajrJamaatBtn.dispatchEvent('click');

  // Verify status is locked and shows Jamaat
  const fajrLocked = fajrCard.locator('.salah-locked-status');
  await expect(fajrLocked).toContainText('Jama');
  console.log('Fajr Jamaat click verified');

  // Test Correct button
  const correctBtn = fajrCard.locator('.salah-correct-btn');
  await expect(correctBtn).toBeVisible();
  await correctBtn.dispatchEvent('click');

  // Verify selector is back
  const fajrAloneBtn = fajrCard.locator('.salah-option-btn.alone');
  await expect(fajrAloneBtn).toBeVisible();
  await fajrAloneBtn.dispatchEvent('click');
  await expect(fajrLocked).toContainText('Alone');
  console.log('Fajr Alone click verified');

  // 2. Navigate to Nafl
  console.log('Navigating to Nafl...');
  await page.evaluate(() => App.navigateTo('nafl'));
  await page.waitForTimeout(800);

  const fajrSunnahCard = page.locator('#sunnah-card-fajr_s');
  await expect(fajrSunnahCard).toBeVisible();

  console.log('Testing Sunnah Prayed click...');
  const sunnahPrayedBtn = fajrSunnahCard.locator('.salah-option-btn').first();
  await expect(sunnahPrayedBtn).toBeVisible();
  await sunnahPrayedBtn.dispatchEvent('click');

  const sunnahStatus = fajrSunnahCard.locator('.salah-locked-status');
  await expect(sunnahStatus).toContainText('Prayed');
  console.log('Sunnah Prayed click verified');

  // Test Tahajjud
  console.log('Testing Tahajjud click...');
  const tahajjudCard = page.locator('#tahajjud-salah-card');
  await expect(tahajjudCard).toBeVisible();
  const tahajjud2RkBtn = tahajjudCard.locator('.salah-option-btn').first();
  await expect(tahajjud2RkBtn).toBeVisible();
  await tahajjud2RkBtn.dispatchEvent('click');

  const tahajjudStatus = tahajjudCard.locator('.salah-locked-status');
  await expect(tahajjudStatus).toContainText('Tahajjud Prayed');
  console.log('Tahajjud click verified');

  // Test Witr
  console.log('Testing Witr click...');
  const witrCard = page.locator('#witr-salah-card');
  await expect(witrCard).toBeVisible();
  const witrPrayedBtn = witrCard.locator('.salah-option-btn').first();
  await expect(witrPrayedBtn).toBeVisible();
  await witrPrayedBtn.dispatchEvent('click');

  const witrStatus = witrCard.locator('.salah-locked-status');
  await expect(witrStatus).toContainText('Witr Prayed');
  console.log('Witr click verified');
});
