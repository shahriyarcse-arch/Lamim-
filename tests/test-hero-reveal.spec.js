import { test } from '@playwright/test';

test('Capture Hero & Sections with Motion Triggered', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Trigger motion reveal
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
  await page.waitForTimeout(500);

  // 1. Hero & Brand Essence
  await page.screenshot({ path: 'test-results/section-hero-white.png' });
  console.log('Captured Hero screenshot.');
});
