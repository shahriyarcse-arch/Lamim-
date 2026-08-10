// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Responsive Viewport & Overflow Suite', () => {
  const viewports = [
    { name: 'Desktop 1920x1080', width: 1920, height: 1080 },
    { name: 'Laptop 1366x768', width: 1366, height: 768 },
    { name: 'Tablet 768x1024', width: 768, height: 1024 },
    { name: 'Mobile 390x844', width: 390, height: 844 },
    { name: 'Small Mobile 320x568', width: 320, height: 568 }
  ];

  for (const vp of viewports) {
    test(`app layout renders without horizontal scroll overflow on ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/app/index.html', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  }
});
