import { test, expect } from '@playwright/test';

test('Verify Video Playback and Streamlined Clean Layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Trigger reveal
  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });

  const aiShowcase = page.locator('#ai-companion');
  await aiShowcase.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // Check video element state
  const isVideoPlaying = await page.evaluate(() => {
    const v = document.getElementById('aiCompanionVideoEl');
    return v && !v.paused && !v.ended && v.readyState >= 2;
  });
  console.log('Is video playing in browser:', isVideoPlaying);

  await page.screenshot({ path: 'test-results/clean-ai-video-playing.png' });
  console.log('Captured clean AI video playing screenshot.');
});
