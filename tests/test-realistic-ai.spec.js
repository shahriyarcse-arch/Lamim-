import { test } from '@playwright/test';

test('Capture Realistic Humanized AI Companion Showcase', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Trigger reveal
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });

  const aiShowcase = page.locator('#ai-companion');
  await aiShowcase.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/realistic-ai-fajr.png' });

  // Click 2nd query (Zakat)
  await page.locator('.ai-sim-chip[data-index="1"]').click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'test-results/realistic-ai-zakat.png' });

  // Click 3rd query (Mon shanto)
  await page.locator('.ai-sim-chip[data-index="2"]').click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'test-results/realistic-ai-peace.png' });

  console.log('Captured all realistic AI dialogue screenshots.');
});
