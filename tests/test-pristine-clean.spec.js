import { test } from '@playwright/test';

test('Capture full pristine website', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Trigger opacity reveal
  await page.evaluate(() => {
    document.querySelectorAll('.reveal, .hero-art, .float, .nav').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/pristine-clean-landing.png' });
  console.log('Captured pristine clean landing screenshot.');
});
