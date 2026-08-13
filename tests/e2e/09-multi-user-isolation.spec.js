// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Multi-User Profile Isolation & Logout Suite', () => {
  test('user A data stays isolated from user B during logout and profile switch', async ({ page }) => {
    // 1. Open app
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof App !== 'undefined' && typeof App.showDashboard === 'function').catch(() => {});

    // 2. Setup User A ("User Alpha")
    await page.evaluate(() => {
      DB.wipeAll();
      const userA = { id: 'usr_alpha_123', name: 'User Alpha', avatar: '', gender: 'male', spirit_score: 85, spirit_level: 'Awakening' };
      DB.setUser(userA);
      DB.saveProfileVault(userA);
      // Log 1000ml water for User Alpha
      DB.setGym(Utils.todayStr(), { exercises: [], sleep: {}, diet: {}, water: { amount: 1000, goal: 3000 } });
    });

    // 3. Verify User Alpha's water log is 1000ml
    const userAWater = await page.evaluate(() => {
      const g = DB.getGym(Utils.todayStr());
      return g.water.amount;
    });
    expect(userAWater).toBe(1000);

    // 4. Switch to User B ("User Beta")
    await page.evaluate(() => {
      const userB = { id: 'usr_beta_456', name: 'User Beta', avatar: '', gender: 'female', spirit_score: 95, spirit_level: 'Luminous' };
      DB.setUser(userB);
      DB.saveProfileVault(userB);
      // Log 2500ml water for User Beta
      DB.setGym(Utils.todayStr(), { exercises: [], sleep: {}, diet: {}, water: { amount: 2500, goal: 3000 } });
    });

    // 5. Verify User Beta's water log is 2500ml
    const userBWater = await page.evaluate(() => {
      const g = DB.getGym(Utils.todayStr());
      return g.water.amount;
    });
    expect(userBWater).toBe(2500);

    // 6. Switch BACK to User Alpha and verify User Alpha's 1000ml is 1000ml (NOT overwritten by 2500ml!)
    await page.evaluate(() => DB.switchProfile('usr_alpha_123'));

    const userARestoredWater = await page.evaluate(() => {
      const g = DB.getGym(Utils.todayStr());
      return g.water.amount;
    });
    expect(userARestoredWater).toBe(1000);

    // 7. Verify Profiles Vault contains BOTH profiles intact
    const profiles = await page.evaluate(() => DB.getProfiles());
    expect(profiles.length).toBe(2);
    expect(profiles.some(p => p.name === 'User Alpha')).toBe(true);
    expect(profiles.some(p => p.name === 'User Beta')).toBe(true);
  });
});
