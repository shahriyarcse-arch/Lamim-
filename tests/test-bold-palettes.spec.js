import { test } from '@playwright/test';

test('Capture AI Showcase and Bold Distinct Section Palettes', async ({ page }) => {
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

  // 1. AI Companion Showcase
  const aiShowcase = page.locator('#ai-companion');
  await aiShowcase.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/showcase-ai-restored.png' });

  // 2. Section 04 & 05 (Nafl Gold & Dhikr Lavender)
  const nafl = page.locator('#feature-nafl');
  await nafl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/showcase-nafl-dhikr.png' });

  // 3. Section 07, 08 & 09 (Gym Ice Blue, Career Coral & Finance Jade Mint)
  const gym = page.locator('#feature-gym');
  await gym.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/showcase-gym-career-finance.png' });

  console.log('Captured all bold palette & AI showcase screenshots.');
});
