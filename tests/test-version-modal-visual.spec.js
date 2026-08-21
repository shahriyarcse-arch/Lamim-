const { test, expect } = require('@playwright/test');

test('Capture Upgraded Version Modal Visuals', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3901/app/index.html', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('lamim_user', JSON.stringify({ name: 'Shahriyar', created: Date.now() }));
    localStorage.setItem('lamim_settings', JSON.stringify({ theme: 'light', lang: 'en' }));
  });

  await page.goto('http://127.0.0.1:3901/app/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1400);

  // Trigger Profile -> App Info
  await page.evaluate(() => {
    if (typeof Profile !== 'undefined') Profile.showAppInfo();
  });

  await page.waitForTimeout(300);
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-ide/brain/429234f0-fd7a-4fd2-bea4-10c37763799a/version_modal_light.png' });

  // Test Dark Mode
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (typeof Profile !== 'undefined') Profile.showAppInfo();
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-ide/brain/429234f0-fd7a-4fd2-bea4-10c37763799a/version_modal_dark.png' });
});
