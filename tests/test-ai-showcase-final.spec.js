import { test } from '@playwright/test';

test('Verify AI Companion Showcase on Pristine Website', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Trigger reveal elements
  await page.evaluate(() => {
    document.querySelectorAll('.reveal, .hero-art, .float, .nav').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
  await page.waitForTimeout(400);

  // 1. Capture AI Showcase
  const aiShowcase = page.locator('#ai-companion');
  await aiShowcase.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/final-ai-companion-showcase.png' });

  // 2. Click a chip query
  const secondChip = page.locator('.ai-sim-chip[data-index="1"]');
  await secondChip.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'test-results/final-ai-interactive-query.png' });

  console.log('Successfully captured final AI showcase screenshots.');
});
