import { test, expect } from '@playwright/test';

test('Verify Habits Collapsible Accordion UI', async ({ page }) => {
  await page.goto('http://127.0.0.1:3901/app/index.html');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => {
    DB.setUser({ name: 'Tester', email: 'test@example.com' });
    const habits = [
      { id: 'social_media', label: 'Social Media', color: '#3b82f6', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>', startDate: new Date().toISOString() },
      { id: 'gaming', label: 'Excessive Gaming', color: '#8b5cf6', icon: '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>', startDate: new Date().toISOString() }
    ];
    DB.setHabits(habits);
    App.showDashboard('habits');
    Habits.loadHabits();
    Habits.render();
  });

  await page.waitForTimeout(800);

  // Take screenshot of collapsed state
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-ide/brain/429234f0-fd7a-4fd2-bea4-10c37763799a/habits_collapsed.png' });

  const firstHeader = page.locator('.iw-collapsed-header').first();
  await expect(firstHeader).toBeVisible();
  await firstHeader.click();
  await page.waitForTimeout(500);

  // Take screenshot of expanded state
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-ide/brain/429234f0-fd7a-4fd2-bea4-10c37763799a/habits_expanded.png' });

  console.log('Accordion verified and screenshots captured successfully');
});
