// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Features & Data Persistence (CRUD) Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const nameInput = document.getElementById('setup-name');
      if (nameInput) nameInput.value = 'Playwright Tester';
      if (typeof Auth !== 'undefined') {
        Auth.selectedGender = 'male';
        if (typeof Auth.submitSetup === 'function') Auth.submitSetup();
      }
      const authScreen = document.getElementById('auth-screen');
      if (authScreen) authScreen.classList.add('hidden');
    });
  });

  test('user can log water in Gym section and verify persistence', async ({ page }) => {
    // 1. Navigate to Gym
    await page.evaluate(() => App.navigateTo('gym'));
    await page.waitForTimeout(400);

    // 2. Log +250ml Water
    const initialAmount = await page.evaluate(() => {
      const date = Gym.selectedDate || Utils.todayStr();
      const data = DB.getGym(date);
      return (data && data.water) ? (data.water.amount || 0) : 0;
    });

    await page.evaluate(() => Gym.addWater(250));

    const updatedAmount = await page.evaluate(() => {
      const date = Gym.selectedDate || Utils.todayStr();
      const data = DB.getGym(date);
      return (data && data.water) ? (data.water.amount || 0) : 0;
    });

    expect(updatedAmount).toBe(initialAmount + 250);

    // 3. Reload page and verify persistent state
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const reloadedAmount = await page.evaluate(() => {
      const date = Utils.todayStr();
      const data = DB.getGym(date);
      return (data && data.water) ? (data.water.amount || 0) : 0;
    });

    expect(reloadedAmount).toBe(updatedAmount);
  });
});
