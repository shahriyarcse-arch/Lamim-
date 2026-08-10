// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Landing Page Suite', () => {
  test('user can open landing page and verify title & CTA', async ({ page }) => {
    // 1. Open Landing Page
    const response = await page.goto('/index.html');
    expect(response?.status()).toBe(200);

    // 2. Verify Page Title
    await expect(page).toHaveTitle(/Lamim/i);

    // 3. Verify Hero Section Header
    const heroHeader = page.locator('h1').first();
    await expect(heroHeader).toBeVisible();

    // 4. Verify Launch App CTA link exists and points to /app/
    const appCta = page.locator('a[href*="app"]').first();
    await expect(appCta).toBeVisible();
    await expect(appCta).toHaveAttribute('href', /app/);
  });
});
