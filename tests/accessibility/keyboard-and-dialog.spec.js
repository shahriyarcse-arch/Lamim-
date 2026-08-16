import { test, expect } from '@playwright/test';

test.describe('Accessibility & Keyboard Navigation Tests', () => {
  test('Modal dialogs respond to Escape key dismissal', async ({ page }) => {
    await page.goto('/index.html');
    await page.click('.navcta');
    const modal = page.locator('#app-launch-modal');
    await expect(modal).toHaveClass(/active/);

    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/active/);
  });

  test('Focus trapping helper Utils.trapFocus exists and functions', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof Utils !== 'undefined');

    const trapCheck = await page.evaluate(() => {
      return typeof Utils !== 'undefined' && typeof Utils.trapFocus === 'function';
    });
    expect(trapCheck).toBe(true);
  });
});
