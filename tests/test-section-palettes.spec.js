import { test } from '@playwright/test';

test('Capture Multiple Landing Page Sections to Verify Distinct Colors & Pure White', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Hero & Brand Essence
  await page.screenshot({ path: 'test-results/section-hero-white.png' });

  // 2. Section 01 & 02 (Difference & System)
  const diff = page.locator('#difference');
  await diff.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-results/section-diff-system.png' });

  // 3. Section 04 & 05 (Nafl & Dhikr)
  const nafl = page.locator('#feature-nafl');
  await nafl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-results/section-nafl-dhikr.png' });

  // 4. Section 07, 08 & 09 (Gym, Career & Finance)
  const gym = page.locator('#feature-gym');
  await gym.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-results/section-gym-career-finance.png' });

  console.log('Captured all section screenshots successfully.');
});
