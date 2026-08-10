// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Theme System Suite', () => {
  test('user can toggle theme between Light and Dark mode', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForTimeout(2000);

    const initialTheme = await page.getAttribute('html', 'data-theme');
    
    // Toggle Theme
    await page.evaluate(() => Profile.toggleTheme());
    await page.waitForTimeout(400);

    const toggledTheme = await page.getAttribute('html', 'data-theme');
    expect(toggledTheme).not.toBe(initialTheme);
    expect(['light', 'dark']).toContain(toggledTheme);

    // Toggle Back
    await page.evaluate(() => Profile.toggleTheme());
    await page.waitForTimeout(400);

    const restoredTheme = await page.getAttribute('html', 'data-theme');
    expect(restoredTheme).toBe(initialTheme);
  });
});
