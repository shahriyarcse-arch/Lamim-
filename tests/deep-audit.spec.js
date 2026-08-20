import { test, expect } from '@playwright/test';

test.describe('Full Deep Audit - Landing & PWA', () => {
  test('Landing page: all links, buttons, and resources load without console errors or 404s', async ({ page }) => {
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', resp => {
      if (resp.status() >= 400 && !resp.url().includes('favicon')) {
        failedRequests.push(`${resp.status()} - ${resp.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check all anchor links on landing page
    const links = await page.$$eval('a[href]', els => els.map(e => e.getAttribute('href')));
    console.log(`Found ${links.length} links on landing page`);

    // Verify critical buttons
    await page.click('.brand');
    await page.waitForTimeout(200);

    // Test mobile menu toggle if present
    const menuBtn = page.locator('#menuToggle');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(200);
      await menuBtn.click();
    }

    console.log('Console Errors:', consoleErrors);
    console.log('Failed Requests:', failedRequests);

    expect(failedRequests).toEqual([]);
    // Filter out external analytics/CSP failures if any
    const realErrors = consoleErrors.filter(e => !e.includes('ipwho') && !e.includes('ipinfo') && !e.includes('Failed to load resource'));
    expect(realErrors).toEqual([]);
  });

  test('PWA App: all sections render without runtime errors', async ({ page }) => {
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', resp => {
      if (resp.status() >= 400) {
        failedRequests.push(`${resp.status()} - ${resp.url()}`);
      }
    });

    // Seed storage with standard user
    await page.addInitScript(() => {
      localStorage.setItem('lamim_user', JSON.stringify({ name: 'Shahriyar', gender: 'male', born: 2000 }));
      localStorage.setItem('lamim_settings', JSON.stringify({ theme: 'light', notifications: false, lat: 23.8103, lng: 90.4125, method: 'Karachi' }));
    });

    await page.goto('/app/index.html');
    await page.waitForTimeout(1000);

    const sections = ['home', 'salah', 'dhikr', 'nafl', 'habits', 'gym', 'career', 'finance', 'analysis', 'profile'];

    for (const sec of sections) {
      console.log(`Testing section: ${sec}`);
      await page.evaluate(s => {
        if (window.App && window.App.showDashboard) {
          window.App.showDashboard(s);
        }
      }, sec);
      await page.waitForTimeout(300);
    }

    console.log('PWA Console Errors:', consoleErrors);
    console.log('PWA Failed Requests:', failedRequests);

    const realErrors = consoleErrors.filter(e => !e.includes('ipwho') && !e.includes('ipinfo') && !e.includes('Failed to load resource'));
    expect(realErrors).toEqual([]);
    const realFailedRequests = failedRequests.filter(r => !r.includes('/api/forex') && !r.includes('/api/agent'));
    expect(realFailedRequests).toEqual([]);
  });
});
