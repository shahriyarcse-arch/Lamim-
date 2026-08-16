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

  test('Bottom navigation bar items are properly translated in Bengali mode', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined' && typeof DB !== 'undefined');

    // Switch to Bengali
    await page.evaluate(() => {
      App.setLang('bn');
    });

    const gymNavText = await page.textContent('.bottom-nav-item[data-section="gym"]');
    const careerNavText = await page.textContent('.bottom-nav-item[data-section="career"]');
    const habitsNavText = await page.textContent('.bottom-nav-item[data-section="habits"]');
    const financeNavText = await page.textContent('.bottom-nav-item[data-section="finance"]');
    const analysisNavText = await page.textContent('.bottom-nav-item[data-section="analysis"]');

    expect(gymNavText?.trim()).toBe('জিম');
    expect(careerNavText?.trim()).toBe('ক্যারিয়ার');
    expect(habitsNavText?.trim()).toBe('হ্যাবিটস');
    expect(financeNavText?.trim()).toBe('ফাইন্যান্স');
    expect(analysisNavText?.trim()).toBe('বিশ্লেষণ');
  });
});
