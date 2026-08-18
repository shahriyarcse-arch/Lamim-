import { test } from '@playwright/test';

test('Verify Clean Original Landing Page with Hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  await page.screenshot({ path: 'test-results/landing-page-restored.png', fullPage: false });
  console.log('Captured restored landing page screenshot.');
});
