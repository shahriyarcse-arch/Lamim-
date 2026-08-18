import { test, expect } from '@playwright/test';

test('Robot Mascot in PWA with Online & Offline States', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });

  await page.addInitScript(() => {
    localStorage.setItem('lamim_user', JSON.stringify({
      name: 'Test User',
      created_at: new Date().toISOString()
    }));
    localStorage.setItem('lamim_lang', 'bn');
  });

  await page.goto('/app/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // 1. Check Floating AI Launcher with Robot Mascot
  const launcher = page.locator('#lamim-ai-launcher');
  await expect(launcher).toBeVisible();
  const launcherRobot = page.locator('.lamim-ai-launcher-robot-img');
  await expect(launcherRobot).toBeVisible();

  // Screenshot floating launcher
  await page.screenshot({ path: 'test-results/pwa-robot-launcher.png' });

  // 2. Open AI Assistant Drawer
  await launcher.click();
  await page.waitForTimeout(800);

  const drawer = page.locator('#lamim-ai-drawer');
  await expect(drawer).toBeVisible();

  // 3. Verify 3D Hero Mascot Stage
  const heroStage = page.locator('#lamim-ai-hero-stage');
  await expect(heroStage).toBeVisible();
  const robotHeroImg = page.locator('.lamim-ai-robot-3d-img');
  await expect(robotHeroImg).toBeVisible();

  // Screenshot Online Mode Hero Stage
  await page.screenshot({ path: 'test-results/pwa-robot-online-mode.png' });

  // 4. Test Offline State Switch
  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await page.waitForTimeout(500);

  const offlineBadge = page.locator('#lamim-ai-badge');
  await expect(offlineBadge).toHaveClass(/offline/);

  // Screenshot Offline Mode Hero Stage
  await page.screenshot({ path: 'test-results/pwa-robot-offline-mode.png' });

  // 5. Query in Offline Mode
  const input = page.locator('#lamim-ai-input');
  const sendBtn = page.locator('#lamim-ai-send');
  await input.fill('সালাত ট্র্যাকার কীভাবে কাজ করে?');
  await sendBtn.click();
  await page.waitForTimeout(1200);

  const msgAvatar = page.locator('.lamim-ai-msg.assistant .lamim-ai-msg-avatar').first();
  await expect(msgAvatar).toBeVisible();

  // Screenshot Complete Robot Conversation
  await page.screenshot({ path: 'test-results/pwa-robot-conversation.png' });
  console.log('Robot mascot in PWA verified successfully in all states!');
});
