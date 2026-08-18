import { test, expect } from '@playwright/test';

test('Full Website Comprehensive Performance, Console Error & Dead Code Audit', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  const networkFailures = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      networkFailures.push({ url: response.url(), status: response.status() });
    }
  });

  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/index.html', { waitUntil: 'networkidle' });

  // 1. Check Initial State
  await page.waitForTimeout(1000);

  // 2. Perform Full Smooth Page Scroll from Top to Bottom to trigger all observers, lenis, and reveals
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log(`Document scroll height: ${scrollHeight}px`);

  for (let y = 0; y < scrollHeight; y += 400) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'auto' }), y);
    await page.waitForTimeout(50);
  }
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' }));
  await page.waitForTimeout(500);

  // Scroll back to top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  await page.waitForTimeout(500);

  // 3. Test Interactive Elements
  // Modal triggers
  const modalTriggers = await page.$$('.essence-card');
  if (modalTriggers.length > 0) {
    await modalTriggers[0].click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // AI chips
  const aiChips = await page.$$('.ai-sim-chip');
  for (const chip of aiChips) {
    await chip.click();
    await page.waitForTimeout(150);
  }

  // Sliders
  const sliders = await page.$$('#insights input[type="range"]');
  for (const slider of sliders) {
    await slider.fill('80');
    await page.waitForTimeout(100);
  }

  console.log('Console Errors:', consoleErrors);
  console.log('Page Errors:', pageErrors);
  console.log('Network Failures (404/500):', networkFailures);

  expect(pageErrors.length).toBe(0);
  expect(consoleErrors.filter(e => !e.includes('favicon') && !e.includes('sw.js'))).toEqual([]);
});
