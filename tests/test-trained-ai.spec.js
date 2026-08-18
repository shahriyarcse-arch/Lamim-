import { test, expect } from '@playwright/test';

test('Verify Master Knowledge Base in AI Agent Engine', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/app/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check that AI agent is ready
  const aiLauncher = page.locator('#ai-agent-launcher');
  if (await aiLauncher.isVisible()) {
    await aiLauncher.click();
    await page.waitForTimeout(500);

    // Ask about LSS score
    const input = page.locator('#ai-chat-input');
    await input.fill('LSS score kivabe hisab hoi?');
    await page.locator('#ai-chat-send').click();
    await page.waitForTimeout(2000);

    const lastMsg = await page.locator('.ai-chat-msg.ai').last().textContent();
    console.log('AI Response to LSS query:', lastMsg);

    // Verify accurate keywords in response
    expect(lastMsg).toContain('৫০%');
    expect(lastMsg).toContain('সালাত');
  }

  await page.screenshot({ path: 'test-results/trained-ai-response.png' });
  console.log('Captured trained AI response screenshot.');
});
