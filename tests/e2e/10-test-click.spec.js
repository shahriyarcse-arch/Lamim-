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
  await page.waitForTimeout(1000);

  // Click Jamaat button on Fajr
  console.log('Testing Salah Fajr Jamaat click...');
  const fajrCard = page.locator('#salah-card-fajr');
  await expect(fajrCard).toBeVisible();

  const fajrJamaatBtn = fajrCard.locator('.salah-option-btn.jamaat');
  await expect(fajrJamaatBtn).toBeVisible();
  await fajrJamaatBtn.click({ force: true });
  await page.waitForTimeout(500);

  // Verify status is locked and shows Jamaat
  const fajrLocked = fajrCard.locator('.salah-locked-status');
  const lockedText = await fajrLocked.textContent();
  console.log('Fajr locked status text:', lockedText);
  expect(lockedText).toContain('Jama');

  // Test Correct button
  const correctBtn = fajrCard.locator('.salah-correct-btn');
  await expect(correctBtn).toBeVisible();
  await correctBtn.click({ force: true });
  await page.waitForTimeout(500);

  // Verify selector is back
  await expect(fajrCard.locator('.salah-option-btn.alone')).toBeVisible();
  await fajrCard.locator('.salah-option-btn.alone').click({ force: true });
  await page.waitForTimeout(500);
  console.log('Fajr Alone click verified');

  // 2. Navigate to Nafl
  await page.evaluate(() => App.navigateTo('nafl'));
  await page.waitForTimeout(500);

  const fajrSunnahCard = page.locator('#sunnah-card-fajr_s');
  await expect(fajrSunnahCard).toBeVisible();

  const sunnahPrayedBtn = fajrSunnahCard.locator('.salah-option-btn').first();
  await expect(sunnahPrayedBtn).toBeVisible();
  await sunnahPrayedBtn.click({ force: true });
  await page.waitForTimeout(500);

  const sunnahStatus = await fajrSunnahCard.locator('.salah-locked-status').textContent();
  console.log('Fajr Sunnah locked text:', sunnahStatus);
  expect(sunnahStatus).toContain('Prayed');

  // Test Tahajjud
  const tahajjudCard = page.locator('#tahajjud-salah-card');
  const tahajjud2RkBtn = tahajjudCard.locator('.salah-option-btn').first();
  await expect(tahajjud2RkBtn).toBeVisible();
  await tahajjud2RkBtn.click({ force: true });
  await page.waitForTimeout(500);

  const tahajjudStatus = await tahajjudCard.locator('.salah-locked-status').textContent();
  console.log('Tahajjud locked text:', tahajjudStatus);
  expect(tahajjudStatus).toContain('Tahajjud Prayed');

  // Test Witr
  const witrCard = page.locator('#witr-salah-card');
  const witrPrayedBtn = witrCard.locator('.salah-option-btn').first();
  await expect(witrPrayedBtn).toBeVisible();
  await witrPrayedBtn.click({ force: true });
  await page.waitForTimeout(500);

  const witrStatus = await witrCard.locator('.salah-locked-status').textContent();
  console.log('Witr locked text:', witrStatus);
  expect(witrStatus).toContain('Witr Prayed');
});
