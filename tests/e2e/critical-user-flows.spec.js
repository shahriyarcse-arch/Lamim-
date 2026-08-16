import { test, expect } from '@playwright/test';

test.describe('Critical User Flow E2E Tests', () => {
  test('App boots without runtime JS exceptions and navigates between core modules', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined' && typeof DB !== 'undefined');

    const modules = ['salah', 'dhikr', 'nafl', 'habits', 'gym', 'career', 'finance', 'analysis', 'profile'];
    for (const mod of modules) {
      const isRendered = await page.evaluate((m) => {
        App.navigateTo(m);
        return App.currentSection === m;
      }, mod);
      expect(isRendered).toBe(true);
    }

    expect(pageErrors.length).toBe(0);
  });
});
