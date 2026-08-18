import { test } from '@playwright/test';

test('Verify Dhikr & Tasbeeh in-app question', async ({ page }) => {
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
  await page.waitForTimeout(500);

  // Click 2nd chip (Tasbeeh / Dhikr)
  await page.locator('.ai-sim-chip[data-index="1"]').click();
  await page.waitForTimeout(700);

  await page.screenshot({ path: 'test-results/realistic-ai-dhikr-inapp.png' });
  console.log('Captured Dhikr & Tasbeeh query screenshot.');
});
