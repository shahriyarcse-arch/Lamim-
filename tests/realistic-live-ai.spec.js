import { test, expect } from '@playwright/test';
import handler from '../api/agent.js';

test('Realistic User Interactive E2E Test on Live PWA AI Assistant', async ({ page }) => {
  // Route /api/agent to the real backend handler with Gemini
  await page.route('**/api/agent', async route => {
    const postData = route.request().postDataJSON();
    const req = { method: 'POST', body: postData, headers: {} };
    let responseData = null;
    const res = {
      setHeader: () => {},
      status: () => ({
        json: (d) => { responseData = d; }
      })
    };
    await handler(req, res);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(responseData || { fallback: true })
    });
  });

  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto('/app/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Find and click Floating AI Launcher
  const launcher = page.locator('#lamim-ai-launcher');
  await expect(launcher).toBeVisible();
  await launcher.click();
  await page.waitForTimeout(600);

  const overlay = page.locator('#lamim-ai-overlay');
  await expect(overlay).toHaveClass(/open/);

  // 2. Realistic Question 1: Specific PWA Sub-Feature (Qaza Omri)
  const input = page.locator('#lamim-ai-input');
  const sendBtn = page.locator('#lamim-ai-send');
  
  console.log('Sending Question 1: অতীতের কাজা নামাজ...');
  await input.fill('আমি কীভাবে আমার অতীতের কাজা নামাজ আদায় ও হিসাব করব?');
  await sendBtn.click();

  // Wait until loading dots disappear and actual reply is rendered
  await page.waitForSelector('#lamim-ai-messages .lamim-ai-msg.assistant:not([id^="loader-"])', { timeout: 30000 });
  await page.waitForTimeout(1500);

  const bubble1 = page.locator('.lamim-ai-msg.assistant:not([id^="loader-"]) .lamim-ai-bubble').first();
  const text1 = await bubble1.innerText();
  console.log('\n================ REALISTIC TEST 1 (PWA Feature) ================\n', text1);

  // Capture screenshot of Qaza answer
  await page.screenshot({ path: 'test-results/realistic-pwa-qaza-answer.png', fullPage: false });

  // 3. Realistic Question 2: Outside General Programming / Knowledge
  console.log('Sending Question 2: React useMemo vs useCallback...');
  await input.fill('React এ useMemo এবং useCallback এর মধ্যে মূল পার্থক্য কী?');
  await sendBtn.click();

  // Wait until 2nd assistant message is fully rendered and loader is removed
  await page.waitForFunction(() => {
    const msgs = document.querySelectorAll('#lamim-ai-messages .lamim-ai-msg.assistant:not([id^="loader-"])');
    return msgs.length >= 2;
  }, { timeout: 30000 });
  await page.waitForTimeout(1500);

  const bubble2 = page.locator('.lamim-ai-msg.assistant:not([id^="loader-"]) .lamim-ai-bubble').last();
  const text2 = await bubble2.innerText();
  console.log('\n================ REALISTIC TEST 2 (Universal Coding) ================\n', text2);

  // Capture final screenshot
  await page.screenshot({ path: 'test-results/realistic-coding-answer.png', fullPage: false });
});
