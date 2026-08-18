import { test, expect } from '@playwright/test';

test('Hero Card Live Pulsing Green Dot', async ({ page }) => {
  await page.goto('/index.html');
  await page.waitForTimeout(1000);

  const heroLiveDate = page.locator('#hero-live-date');
  await expect(heroLiveDate).toBeVisible();

  const pingDot = page.locator('.hero-live-dot-ping');
  await expect(pingDot).toBeVisible();

  const coreDot = page.locator('.hero-live-dot-core');
  await expect(coreDot).toBeVisible();

  const heroApp = page.locator('.hero-art .app');
  await heroApp.screenshot({ path: 'test-results/hero-live-card.png' });
  console.log('Hero live card screenshot captured!');
});
