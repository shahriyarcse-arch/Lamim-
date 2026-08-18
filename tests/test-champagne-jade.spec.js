import { test } from '@playwright/test';

test('Capture Champagne Silk Brand Essence & Royal Jade Stats Bar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Trigger reveal
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
  await page.waitForTimeout(400);

  const stats = page.locator('.app-grid');
  await stats.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'test-results/brand-essence-stats-champagne-jade.png' });
  console.log('Captured Brand Essence and Stats Bar screenshot.');
});
