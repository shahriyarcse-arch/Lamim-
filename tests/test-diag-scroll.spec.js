import { test } from '@playwright/test';

test('Diagnose scrollbar thumb resize during page load', async ({ page }) => {
  const heightSnapshots = [];

  // Track document scroll height over time
  await page.addInitScript(() => {
    window.__heightLog = [];
    const logHeight = (phase) => {
      window.__heightLog.push({
        phase,
        time: performance.now(),
        scrollHeight: document.documentElement.scrollHeight,
        bodyHeight: document.body ? document.body.scrollHeight : 0,
        lenisClass: document.documentElement.classList.contains('lenis'),
        styleCount: document.styleSheets.length
      });
    };

    logHeight('init');
    document.addEventListener('DOMContentLoaded', () => logHeight('DOMContentLoaded'));
    window.addEventListener('load', () => logHeight('window.load'));
  });

  await page.goto('/index.html', { waitUntil: 'commit' });
  for (let i = 0; i < 15; i++) {
    const data = await page.evaluate(() => {
      return {
        time: performance.now(),
        scrollHeight: document.documentElement.scrollHeight,
        bodyHeight: document.body ? document.body.scrollHeight : 0,
        hasLenis: document.documentElement.classList.contains('lenis'),
        styleSheets: document.styleSheets.length
      };
    });
    heightSnapshots.push(data);
    await page.waitForTimeout(100);
  }

  const logs = await page.evaluate(() => window.__heightLog);
  console.log('--- EVENT LOGS ---', logs);
  console.log('--- TIME SNAPSHOTS ---', heightSnapshots);
});
