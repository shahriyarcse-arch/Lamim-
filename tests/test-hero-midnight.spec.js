import { test } from '@playwright/test';

test('Capture Midnight Velvet Obsidian Hero Screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Trigger reveal animations
  await page.evaluate(() => {
    document.querySelectorAll('.reveal, .hero-art, .float, .nav').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/hero-midnight-obsidian.png' });
  console.log('Captured Midnight Velvet Obsidian Hero screenshot.');
});
