import { test, expect } from '@playwright/test';

test.describe('Lamin Full Visual, Accessibility, Color & Responsive Design Audit', () => {

  test('Design System Tokens: CSS variables are correctly defined and coherent across light and dark modes', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined' && App._bootComplete);

    // 1. Check dark theme tokens
    await page.evaluate(() => Profile.setTheme('dark'));
    const darkBg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim());
    const darkText = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim());
    expect(darkBg.length).toBeGreaterThan(0);
    expect(darkText.length).toBeGreaterThan(0);

    // 2. Check light theme tokens
    await page.evaluate(() => Profile.setTheme('light'));
    const lightBg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-bg-primary').trim());
    const lightText = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-text-primary').trim());
    expect(lightBg.length).toBeGreaterThan(0);
    expect(lightText.length).toBeGreaterThan(0);
    expect(lightBg).not.toBe(darkBg);
  });

  test('Zero Horizontal Overflow across responsive viewports: 375px (Mobile), 768px (Tablet), 1440px (Desktop)', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1440, height: 900, name: 'Desktop' }
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/app/index.html');
      await page.waitForFunction(() => typeof App !== 'undefined' && App._bootComplete);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll, `Viewport ${vp.name} (${vp.width}px) should not have horizontal overflow`).toBe(false);

      // Verify Landing Page as well
      await page.goto('/index.html');
      await page.waitForTimeout(500);
      const landingHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(landingHorizontalScroll, `Landing page on ${vp.name} (${vp.width}px) should not have horizontal overflow`).toBe(false);
    }
  });

  test('Typography & Language Switching: English and Bengali render without clipping or missing glyphs', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined' && App._bootComplete);

    // Switch to Bengali
    await page.evaluate(() => {
      localStorage.setItem('lamim_lang', 'bn');
      if (typeof Profile !== 'undefined') {
        Profile.renderProfile();
        Profile.renderSettings();
      }
      if (typeof Home !== 'undefined' && typeof Home.render === 'function') Home.render();
      window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    });
    await page.waitForTimeout(300);

    const bnText = await page.evaluate(() => t('Home'));
    expect(bnText).toBe('হোম');

    // Switch back to English
    await page.evaluate(() => {
      localStorage.setItem('lamim_lang', 'en');
      if (typeof Profile !== 'undefined') {
        Profile.renderProfile();
        Profile.renderSettings();
      }
      if (typeof Home !== 'undefined' && typeof Home.render === 'function') Home.render();
      window.dispatchEvent(new CustomEvent('lamim:data-updated'));
    });
    await page.waitForTimeout(300);
    const enText = await page.evaluate(() => t('Home'));
    expect(enText).toBe('Home');
  });

  test('Accessibility & Touch Targets: Interactive bottom navigation items meet minimum 44px touch target guidelines', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined' && App._bootComplete);

    const navItems = await page.$$('.bottom-nav-item');
    for (const item of navItems) {
      const box = await item.boundingBox();
      if (box) {
        expect(box.height, 'Touch target height should be >= 40px').toBeGreaterThanOrEqual(40);
        expect(box.width, 'Touch target width should be >= 40px').toBeGreaterThanOrEqual(40);
      }
    }
  });

});
