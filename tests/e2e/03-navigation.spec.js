// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('PWA 9-Section Navigation Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/index.html');
    const splash = page.locator('#splash-screen, .splash-screen, .splash');
    if (await splash.count() > 0) {
      await splash.first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
    }

    // Bypass setup wizard if visible
    await page.evaluate(() => {
      const nameInput = document.getElementById('setup-name');
      if (nameInput) nameInput.value = 'Playwright Tester';
      if (typeof Auth !== 'undefined') {
        Auth.selectedGender = 'male';
        if (typeof Auth.submitSetup === 'function') Auth.submitSetup();
      }
      const authScreen = document.getElementById('auth-screen');
      if (authScreen) authScreen.classList.add('hidden');
    });
  });

  const sections = ['home', 'salah', 'dhikr', 'gym', 'career', 'finance', 'nafl', 'analysis', 'profile'];

  for (const sec of sections) {
    test(`user can navigate to section: ${sec}`, async ({ page }) => {
      const navSuccess = await page.evaluate((s) => {
        if (typeof App !== 'undefined' && typeof App.navigateTo === 'function') {
          App.navigateTo(s);
          return true;
        }
        return false;
      }, sec);

      expect(navSuccess).toBe(true);

      const activePanel = page.locator('#section-' + sec);
      await expect(activePanel).toHaveClass(/active/);
    });
  }
});
