import { test, expect } from '@playwright/test';

test.describe('PWA Installability Tests', () => {
  test('Landing page renders launch choice modal when clicking Open app', async ({ page }) => {
    await page.goto('/index.html');
    const modal = page.locator('#app-launch-modal');
    await expect(modal).not.toHaveClass(/active/);

    await page.click('.navcta');
    await expect(modal).toHaveClass(/active/);

    // Verify option 1 (Install) and option 2 (Web)
    const installBtn = page.locator('#launchModalInstallBtn');
    const webBtn = page.locator('#launchModalWebBtn');
    await expect(installBtn).toBeVisible();
    await expect(webBtn).toBeVisible();

    // Verify Escape dismisses modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/active/);
  });

  test('Main app displays in-app install buttons in browser mode', async ({ page }) => {
    await page.goto('/app/index.html');
    const topbarBtn = page.locator('#pwa-install-btn');
    const sidebarBtn = page.locator('#sidebar-pwa-install-btn');
    await expect(topbarBtn).toBeAttached();
    await expect(sidebarBtn).toBeAttached();
  });
});
