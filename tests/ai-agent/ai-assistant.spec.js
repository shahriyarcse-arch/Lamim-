import { test, expect } from '@playwright/test';

test.describe('Lamim Hybrid AI Assistant Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock user profile to bypass onboarding setup wizard
    await page.addInitScript(() => {
      localStorage.setItem('lamim_user', JSON.stringify({
        name: 'Test User',
        created_at: new Date().toISOString()
      }));
      localStorage.setItem('lamim_lang', 'bn');
    });

    await page.goto('/app/index.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Floating AI launcher is rendered and visible', async ({ page }) => {
    const launcher = page.locator('#lamim-ai-launcher');
    await expect(launcher).toBeVisible({ timeout: 5000 });
  });

  test('Clicking launcher opens AI chat drawer and shows welcome message', async ({ page }) => {
    const launcher = page.locator('#lamim-ai-launcher');
    await launcher.click();

    const overlay = page.locator('#lamim-ai-overlay');
    await expect(overlay).toHaveClass(/open/);

    const drawer = page.locator('#lamim-ai-drawer');
    await expect(drawer).toBeVisible();

    // Verify welcome message is present
    const greeting = page.locator('#lamim-ai-greeting-text');
    await expect(greeting).toBeVisible();
    await expect(greeting).toContainText('লামিম এআই সহকারী');
  });

  test('Querying via suggestion chips or text returns offline knowledge with deep action link', async ({ page }) => {
    // Set offline to test local deterministic engine and action button
    await page.context().setOffline(true);

    const launcher = page.locator('#lamim-ai-launcher');
    await launcher.click();

    const input = page.locator('#lamim-ai-input');
    await input.fill('হালাল ফাইন্যান্স');
    await page.locator('#lamim-ai-send').click();

    // Verify user bubble appears
    await expect(page.locator('.lamim-ai-msg.user')).toContainText('হালাল ফাইন্যান্স');

    // Verify assistant responds with knowledge and deep link action button
    const assistantBubble = page.locator('.lamim-ai-msg.assistant').last();
    await expect(assistantBubble).toContainText('যাকাত', { timeout: 6000 });

    const actionBtn = assistantBubble.locator('.lamim-ai-action-btn');
    await expect(actionBtn).toBeVisible();
    await expect(actionBtn).toHaveAttribute('data-section', 'finance');

    // Click action link to verify navigation
    await actionBtn.click();
    await expect(page.locator('#section-finance')).toHaveClass(/active/, { timeout: 6000 });
    await expect(page.locator('#section-finance')).toBeVisible();
  });

  test('Escape key and close button smoothly close the assistant drawer', async ({ page }) => {
    const launcher = page.locator('#lamim-ai-launcher');
    await launcher.click();

    const overlay = page.locator('#lamim-ai-overlay');
    await expect(overlay).toHaveClass(/open/);

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(overlay).not.toHaveClass(/open/);
  });

  test('Banglish queries like "namaj" and conversational queries like "ki koro" respond intelligently', async ({ page }) => {
    await page.context().setOffline(true);

    const launcher = page.locator('#lamim-ai-launcher');
    await launcher.click();

    const input = page.locator('#lamim-ai-input');
    const sendBtn = page.locator('#lamim-ai-send');

    // Test 1: Banglish query "namaj"
    await input.fill('namaj');
    await sendBtn.click();

    const assistantMsg1 = page.locator('.lamim-ai-msg.assistant').last();
    await expect(assistantMsg1).toContainText('সালাত ট্র্যাকার', { timeout: 6000 });

    // Test 2: Conversational query "ki koro"
    await input.fill('ki koro');
    await sendBtn.click();

    const assistantMsg2 = page.locator('.lamim-ai-msg.assistant').last();
    await expect(assistantMsg2).toContainText('লামিম', { timeout: 6000 });
  });
});

