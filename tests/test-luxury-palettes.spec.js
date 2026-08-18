import { test } from '@playwright/test';

test('Verify High-Contrast Luxury Palettes Across Sections', async ({ page }) => {
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
  await page.waitForTimeout(500);

  // 1. Brand Essence
  const brand = page.locator('#brand-essence');
  await brand.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/section-brand-essence.png' });

  // 2. Section 03 Salah
  const salah = page.locator('#feature-salah');
  await salah.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/section-salah.png' });

  // 3. Section 06 Habits
  const habits = page.locator('#feature-habits');
  await habits.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/section-habits.png' });

  // 4. Section 10 Insights (Spiritual Analysis)
  const insights = page.locator('#insights');
  await insights.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/section-insights-contrast.png' });

  // 5. Section 13 FAQ
  const faq = page.locator('#faq');
  await faq.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/section-faq.png' });

  console.log('All verification screenshots captured!');
});
