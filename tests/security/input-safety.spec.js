import { test, expect } from '@playwright/test';

test.describe('Security & Input Safety Tests', () => {
  test('Utils.escapeHTML properly neutralizes script tags and malicious attributes', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof Utils !== 'undefined');

    const escapeResults = await page.evaluate(() => {
      const payload1 = '<script>alert("xss")</script>';
      const payload2 = '<img src=x onerror=alert(1)>';
      const payload3 = '"><svg onload=alert(1)>';

      const esc1 = Utils.escapeHTML(payload1);
      const esc2 = Utils.escapeHTML(payload2);
      const esc3 = Utils.escapeHTML(payload3);

      return {
        esc1Safe: !esc1.includes('<script>') && esc1.includes('&lt;script&gt;'),
        esc2Safe: !esc2.includes('<img') && esc2.includes('&lt;img'),
        esc3Safe: !esc3.includes('<svg') && esc3.includes('&lt;svg')
      };
    });

    expect(escapeResults.esc1Safe).toBe(true);
    expect(escapeResults.esc2Safe).toBe(true);
    expect(escapeResults.esc3Safe).toBe(true);
  });
});
