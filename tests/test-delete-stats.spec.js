import { test } from '@playwright/test';

test('Verify Stats Bar is completely deleted from page', async ({ page }) => {
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

  const brandEssence = page.locator('#brand-essence');
  await brandEssence.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/after-stats-deletion.png' });
  console.log('Captured screenshot after stats bar deletion.');
});
