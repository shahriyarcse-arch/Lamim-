import { test, expect } from '@playwright/test';

test('Diagnose Profile Render Error', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message + '\n' + err.stack));

  await page.goto('/app/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('Detected Browser Errors:', errors);
});
