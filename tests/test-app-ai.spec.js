import { test } from '@playwright/test';

test('Test and screenshot AI Assistant in Web App', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/app/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click on the AI Assistant floating launcher
  const launcher = page.locator('#lamim-ai-launcher');
  await launcher.click();
  await page.waitForTimeout(800);

  // Capture screenshot of AI Assistant Drawer in App
  await page.screenshot({ path: 'test-results/app-ai-assistant.png' });
  console.log('Captured app AI assistant screenshot.');
});
