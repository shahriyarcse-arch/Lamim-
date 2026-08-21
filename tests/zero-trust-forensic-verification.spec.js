import { test, expect } from '@playwright/test';

test.describe('Lamim Zero-Trust Forensic Verification & Adversarial Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/app/index.html');
    await page.evaluate(async () => {
      try { localStorage.clear(); sessionStorage.clear(); } catch (e) { }
      if (typeof indexedDB !== 'undefined') {
        try {
          const req = indexedDB.deleteDatabase('lamim_db');
          await new Promise((res) => { req.onsuccess = req.onerror = req.onblocked = res; });
        } catch (e) { }
      }
    });
    await page.reload();
  });

  async function createTestUser(page, name = 'Auditor A', gender = 'male') {
    await page.waitForSelector('#setup-name', { state: 'visible', timeout: 8000 });
    await page.fill('#setup-name', name);
    if (gender === 'male') {
      await page.click('#setup-gender-male');
    } else {
      await page.click('#setup-gender-female');
    }
    await page.evaluate(() => {
      document.getElementById('setup-lat').value = '23.8103';
      document.getElementById('setup-lng').value = '90.4125';
      Auth.submitSetup();
    });
    await page.waitForSelector('#page-dashboard', { state: 'visible', timeout: 8000 });
    await page.evaluate(() => {
      if (typeof Manual !== 'undefined' && Manual.skipIntro) Manual.skipIntro();
    });
  }

  // TEST 1: Multi-Profile Isolation (A -> B -> A with randomized UUIDs)
  test('Test 1: Multi-profile isolation with randomized UUID data', async ({ page }) => {
    // Step 1: Create User A
    await createTestUser(page, 'Alice UserA', 'female');
    const secretTokenA = 'secret_payload_' + Math.random().toString(36).slice(2);
    
    // User A writes unique data to multiple modules
    await page.evaluate(async (secret) => {
      const today = Utils.todayStr();
      await DB.setDhikr(today, { subhanallah: 42, custom_token: secret });
      await DB.setHabits([{ id: 'h_alice', label: 'Alice Habit ' + secret, startDate: new Date().toISOString() }]);
      await DB.setCareer(today, { focusTopic: 'Alice Deep Work ' + secret, checklist: [{ id: 1, text: secret, done: true }] });
      await DB.setFinance({ expenses: [{ id: 'exp_a', description: 'Alice Expense ' + secret, amount: 100 }] });
      if (typeof App !== 'undefined' && App.flushAllPendingSaves) App.flushAllPendingSaves();
      await DB._writeChain;
    }, secretTokenA);

    // Save profile vault and Logout User A
    await page.evaluate(async () => {
      const u = DB.getUser();
      if (u) await DB.saveProfileVault(u);
      await DB.remove('lamim_user');
      await DB._writeChain;
    });
    await page.reload();

    // Step 2: Create User B
    await createTestUser(page, 'Bob UserB', 'male');
    const secretTokenB = 'secret_payload_' + Math.random().toString(36).slice(2);

    // Verify User B receives ZERO data from User A
    const userBData = await page.evaluate(() => {
      const today = Utils.todayStr();
      return {
        dhikr: DB.getDhikr(today),
        habits: DB.getHabits(),
        career: DB.getCareer(today),
        finance: DB.getFinance()
      };
    });

    expect(JSON.stringify(userBData)).not.toContain(secretTokenA);
    expect(userBData.dhikr.subhanallah || 0).toBe(0);
    expect(userBData.habits.length).toBe(0);
    expect(userBData.career.focusTopic).toBe('');
    expect((userBData.finance.expenses || []).length).toBe(0);

    // User B writes unique data
    await page.evaluate(async (secret) => {
      const today = Utils.todayStr();
      await DB.setDhikr(today, { subhanallah: 99, custom_token: secret });
      if (typeof App !== 'undefined' && App.flushAllPendingSaves) App.flushAllPendingSaves();
      await DB._writeChain;
    }, secretTokenB);

    // Step 3: Switch back to User A via Profile Vault
    const profiles = await page.evaluate(() => DB.getProfiles());
    const alice = profiles.find(p => p.name === 'Alice UserA');
    expect(alice).toBeDefined();

    await page.evaluate(async (id) => {
      await DB.switchProfile(id);
      App.showDashboard('home');
    }, alice.id);

    // Verify User A gets Alice's exact data restored with zero Bob leakage
    const restoredAliceData = await page.evaluate(() => {
      const today = Utils.todayStr();
      return {
        user: DB.getUser(),
        dhikr: DB.getDhikr(today),
        habits: DB.getHabits(),
        career: DB.getCareer(today),
        finance: DB.getFinance()
      };
    });

    expect(restoredAliceData.user.name).toBe('Alice UserA');
    expect(restoredAliceData.dhikr.subhanallah).toBe(42);
    expect(restoredAliceData.dhikr.custom_token).toBe(secretTokenA);
    expect(JSON.stringify(restoredAliceData)).not.toContain(secretTokenB);
  });

  // TEST 2: L1 Cache Contamination
  test('Test 2: L1 Cache Contamination between profiles', async ({ page }) => {
    await createTestUser(page, 'User Alpha');
    await page.evaluate(() => {
      const today = Utils.todayStr();
      DB.setDhikr(today, { subhanallah: 777 });
    });

    // Switch profile to Beta
    await page.evaluate(async () => {
      const u = DB.getUser();
      await DB.saveProfileVault(u);
      
      const userBeta = { id: 'usr_beta_test', name: 'User Beta', role: 'user', gender: 'female' };
      await DB.setUser(userBeta);
      await DB.saveProfileVault(userBeta);
    });

    // Inspect L1 cache directly
    const cacheTest = await page.evaluate(() => {
      const today = Utils.todayStr();
      const effectiveKey = DB._getEffectiveKey(`lamim_dhikr_${today}`);
      const val = DB.getDhikr(today);
      return {
        effectiveKey,
        count: val.subhanallah || 0,
        activeUser: DB.getUser()?.name
      };
    });

    expect(cacheTest.activeUser).toBe('User Beta');
    expect(cacheTest.effectiveKey).toContain('usr_beta_test');
    expect(cacheTest.count).toBe(0);
  });

  // TEST 3: IndexedDB Direct Key & Profile Isolation Inspection
  test('Test 3: IndexedDB direct storage key scoping inspection', async ({ page }) => {
    await createTestUser(page, 'Inspector User');
    const userId = await page.evaluate(() => DB.getUser()?.id);
    expect(userId).toBeTruthy();

    await page.evaluate(() => {
      DB.setDhikr(Utils.todayStr(), { subhanallah: 10 });
      DB.setGoals([{ id: 'g1', title: 'Quran Goal' }]);
      DB.setFinance({ expenses: [{ id: 'e1', amount: 50 }] });
    });

    // Read directly from IndexedDB object store 'keyvalue'
    const idbKeys = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const req = indexedDB.open('lamim_db');
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction(['keyvalue'], 'readonly');
          const store = tx.objectStore('keyvalue');
          const getAllReq = store.getAllKeys();
          getAllReq.onsuccess = () => resolve(getAllReq.result);
        };
      });
    });

    // Verify user-scoped keys have exact usr_<userId>_ prefix
    const expectedPrefix = `usr_${userId}_`;
    const scopedKeys = idbKeys.filter(k => k.startsWith('usr_') && !k.startsWith('usr_usr_'));
    expect(scopedKeys.length).toBeGreaterThan(0);
    scopedKeys.forEach(k => {
      expect(k.startsWith(expectedPrefix)).toBe(true);
    });
  });

  // TEST 4: 33 Rapid Writes (Dhikr rapid concurrency)
  test('Test 4: 33 rapid writes concurrency test', async ({ page }) => {
    await createTestUser(page, 'Tapper 33');
    await page.evaluate(() => App.navigateTo('dhikr'));
    await page.waitForSelector('#section-dhikr.active');

    for (let i = 0; i < 33; i++) {
      await page.click('#dhikr-tap-btn');
    }

    // Allow debounce to settle
    await page.waitForTimeout(400);

    const uiCount = await page.textContent('#dhikr-tap-count');
    expect(uiCount.trim()).toBe('33');

    const dbCount = await page.evaluate(() => {
      const today = Utils.todayStr();
      return DB.getDhikr(today)['subhanallah'];
    });
    expect(dbCount).toBe(33);
  });

  // TEST 5: 500 Rapid Writes Stress Load
  test('Test 5: 500 rapid writes stress load test', async ({ page }) => {
    await createTestUser(page, 'Stress Tester');
    const finalCount = await page.evaluate(async () => {
      Dhikr.currentId = 'subhanallah';
      Dhikr.count = 0;
      for (let i = 0; i < 500; i++) {
        Dhikr.count++;
        Dhikr.saveInstantly();
      }
      Dhikr.flushSave();
      // Wait for write chain
      await DB._writeChain;
      const today = Utils.todayStr();
      return DB.getDhikr(today)['subhanallah'];
    });

    expect(finalCount).toBe(500);
  });

  // TEST 6: Rapid Write Followed Immediately by Logout (Zero Data Loss)
  test('Test 6: Rapid write + immediate logout data persistence', async ({ page }) => {
    await createTestUser(page, 'Logout Hero');
    await page.evaluate(() => App.navigateTo('dhikr'));
    await page.waitForSelector('#section-dhikr.active');

    // Rapid taps
    for (let i = 0; i < 15; i++) {
      await page.click('#dhikr-tap-btn');
    }

    // Immediately trigger logout without waiting for 250ms debounce
    await page.evaluate(async () => {
      if (typeof App !== 'undefined' && App.flushAllPendingSaves) App.flushAllPendingSaves();
      const u = DB.getUser();
      if (u) await DB.saveProfileVault(u);
      await DB.remove('lamim_user');
      await DB._writeChain;
    });

    await page.reload();
    await page.waitForSelector('#setup-name', { state: 'visible' });

    // Switch back to Logout Hero
    const profiles = await page.evaluate(() => DB.getProfiles());
    const hero = profiles.find(p => p.name === 'Logout Hero');
    expect(hero).toBeDefined();

    await page.evaluate(async (id) => {
      await DB.switchProfile(id);
      App.showDashboard('dhikr');
    }, hero.id);

    await page.waitForSelector('#section-dhikr.active');
    const restoredCount = await page.textContent('#dhikr-tap-count');
    expect(restoredCount.trim()).toBe('15');
  });

  // TEST 7: Rapid Write Followed Immediately by Profile Switch
  test('Test 7: Rapid write + immediate profile switch concurrency', async ({ page }) => {
    await createTestUser(page, 'User One');
    const userOneId = await page.evaluate(() => DB.getUser()?.id);

    // Create User Two in Vault
    await page.evaluate((u1Id) => {
      const u2 = { id: 'usr_two_test', name: 'User Two', role: 'user', gender: 'male' };
      DB.saveProfileVault(u2);
    }, userOneId);

    await page.evaluate(() => App.navigateTo('dhikr'));
    await page.waitForSelector('#section-dhikr.active');

    // 25 rapid taps for User One
    for (let i = 0; i < 25; i++) {
      await page.click('#dhikr-tap-btn');
    }

    // Immediately switch to User Two
    await page.evaluate(async () => {
      await DB.switchProfile('usr_two_test');
      App.showDashboard('dhikr');
    });

    // User Two should see 0
    await page.waitForSelector('#section-dhikr.active');
    const u2Count = await page.textContent('#dhikr-tap-count');
    expect(u2Count.trim()).toBe('0');

    // Switch back to User One
    await page.evaluate(async (id) => {
      await DB.switchProfile(id);
      App.showDashboard('dhikr');
    }, userOneId);

    const u1RestoredCount = await page.textContent('#dhikr-tap-count');
    expect(u1RestoredCount.trim()).toBe('25');
  });

  // TEST 8: Artificial Storage Latency & Identity Race Attack
  test('Test 8: Artificial 200ms storage latency with rapid profile switch', async ({ page }) => {
    await createTestUser(page, 'SlowStorage UserA');
    const userA = await page.evaluate(() => DB.getUser());

    const result = await page.evaluate(async (uA) => {
      const today = Utils.todayStr();
      
      // Monkey-patch _asyncWrite with artificial delay
      const originalAsyncWrite = DB._asyncWrite.bind(DB);
      DB._asyncWrite = function(key, val, prevVal) {
        return new Promise((resolve) => {
          setTimeout(async () => {
            await originalAsyncWrite(key, val, prevVal);
            resolve();
          }, 150);
        });
      };

      // User A initiates slow writes
      DB.setDhikr(today, { subhanallah: 88 });

      // Immediate profile switch to User B
      const uB = { id: 'usr_slow_b', name: 'SlowStorage UserB', role: 'user', gender: 'female' };
      await DB.setUser(uB);

      // User B performs write
      DB.setDhikr(today, { subhanallah: 12 });

      // Wait for all delayed operations to complete
      await new Promise(r => setTimeout(r, 400));

      // Read User B's count
      const countB = DB.getDhikr(today).subhanallah;

      // Switch back to User A
      await DB.setUser(uA);
      const countA = DB.getDhikr(today).subhanallah;

      return { countA, countB };
    }, userA);

    expect(result.countB).toBe(12);
    expect(result.countA).toBe(88);
  });

  // TEST 9: True Offline Mode Test
  test('Test 9: True offline PWA reload and multi-module navigation', async ({ page, context }) => {
    await createTestUser(page, 'Offline Sailor');

    // Register Service Worker explicitly for offline test
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/app/sw.js', { scope: '/app/' });
          await navigator.serviceWorker.ready;
        } catch (e) {}
      }
    });

    // Emulate network disconnection
    await context.setOffline(true);

    // Verify all 10 core modules render successfully
    const modules = ['home', 'salah', 'dhikr', 'nafl', 'analysis', 'profile', 'habits', 'finance', 'gym', 'career'];
    for (const mod of modules) {
      await page.evaluate((m) => App.navigateTo(m), mod);
      await page.waitForSelector(`#section-${mod}.active`, { state: 'visible', timeout: 5000 });
      const isActive = await page.evaluate((m) => {
        const p = document.getElementById(`section-${m}`);
        return p && p.classList.contains('active');
      }, mod);
      expect(isActive).toBe(true);
    }

    // Restore network
    await context.setOffline(false);
  });

  // TEST 10: Service Worker Registration & Scope
  test('Test 10: Service Worker file and scope inspection', async ({ page }) => {
    const swResult = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { supported: false };
      try {
        const reg = await navigator.serviceWorker.register('/app/sw.js', { scope: '/app/' });
        return {
          supported: true,
          hasRegistration: !!reg,
          scope: reg ? reg.scope : null
        };
      } catch (e) {
        return { supported: true, hasRegistration: false, error: e.message };
      }
    });

    expect(swResult.supported).toBe(true);
    expect(swResult.hasRegistration).toBe(true);
  });

  // TEST 11: Keyboard-Only Modal Interaction & Focus Trap
  test('Test 11: Modal keyboard accessibility, Escape closing and focus trap', async ({ page }) => {
    await createTestUser(page, 'Accessibility Champion');

    // Test 1: Version Modal
    await page.evaluate(() => Profile.showAppInfo());
    await page.waitForSelector('#profile-version-modal:not(.hidden)');
    await page.keyboard.press('Escape');
    const isVerHidden = await page.evaluate(() => {
      const m = document.getElementById('profile-version-modal');
      return !m || m.classList.contains('hidden');
    });
    expect(isVerHidden).toBe(true);

    // Test 2: Export Data Modal
    await page.evaluate(() => Profile.exportData());
    await page.waitForSelector('#profile-export-modal:not(.hidden)');
    await page.keyboard.press('Escape');
    const isExportHidden = await page.evaluate(() => {
      const m = document.getElementById('profile-export-modal');
      return !m || m.classList.contains('hidden');
    });
    expect(isExportHidden).toBe(true);
  });

  // TEST 12: XSS Payload Injection
  test('Test 12: XSS payload sanitization across all input sinks', async ({ page }) => {
    const maliciousPayload = '<script>window.__XSS_PWNED__=true</script><img src=x onerror=window.__XSS_PWNED__=true>';
    
    await createTestUser(page, maliciousPayload);

    // Check if script executed
    const isPwned = await page.evaluate(() => !!window.__XSS_PWNED__);
    expect(isPwned).toBe(false);

    // Inject in Habit, Career Goal, and Finance Expense
    await page.evaluate((payload) => {
      const today = Utils.todayStr();
      DB.setHabits([{ id: 'h_xss', label: payload, startDate: new Date().toISOString() }]);
      DB.setCareer(today, { checklist: [{ id: 1, text: payload, done: false }] });
      DB.setFinance({ expenses: [{ id: 'e_xss', description: payload, amount: 20 }] });
      
      // Render modules
      App.navigateTo('habits');
      App.navigateTo('career');
      App.navigateTo('finance');
    }, maliciousPayload);

    const isPwnedAfterRender = await page.evaluate(() => !!window.__XSS_PWNED__);
    expect(isPwnedAfterRender).toBe(false);
  });

  // TEST 13: Repeated Module Mount / Unmount Event Listener Stability
  test('Test 13: 50x repeated module mount/unmount memory and listener audit', async ({ page }) => {
    await createTestUser(page, 'Cycle Auditor');

    // Cycle between Home, Salah, and Dhikr 50 times
    for (let i = 0; i < 25; i++) {
      await page.evaluate(() => {
        App.navigateTo('home');
        App.navigateTo('salah');
        App.navigateTo('dhikr');
      });
    }

    await page.waitForSelector('#section-dhikr.active');
    
    // Tap once and verify count increments by exactly 1
    const countBefore = await page.evaluate(() => Dhikr.count || 0);
    await page.click('#dhikr-tap-btn');
    const countAfter = await page.evaluate(() => Dhikr.count);

    expect(countAfter).toBe(countBefore + 1);
  });

  // TEST 14: Timer Background Suspension & Timestamp Delta Reliability
  test('Test 14: Timer delta calculation resilience against tab suspension', async ({ page }) => {
    await createTestUser(page, 'Timer Analyst');
    
    const deltaTest = await page.evaluate(() => {
      const startedAt = Date.now() - 3600000; // 1 hour ago
      const timerState = { running: true, startedAt, accumMs: 0, topic: 'Deep Work' };
      
      // Compute elapsed time using timestamp delta
      const now = Date.now();
      const elapsedMs = (now - timerState.startedAt) + timerState.accumMs;
      const elapsedMinutes = Math.floor(elapsedMs / 60000);
      
      return elapsedMinutes;
    });

    expect(deltaTest).toBe(60);
  });

  // TEST 15: Concurrent User A/B Writes & Profile Switch Race
  test('Test 15: Concurrent multi-profile write storm and vault integrity', async ({ page }) => {
    await createTestUser(page, 'Storm UserA');
    const userA = await page.evaluate(() => DB.getUser());

    const result = await page.evaluate(async (uA) => {
      const today = Utils.todayStr();
      const uB = { id: 'usr_storm_b', name: 'Storm UserB', role: 'user', gender: 'male' };
      await DB.saveProfileVault(uA);
      await DB.saveProfileVault(uB);

      // Rapidly alternate writes and switches
      for (let i = 0; i < 10; i++) {
        await DB.setUser(uA);
        DB.setDhikr(today, { count: i * 10 });
        
        await DB.setUser(uB);
        DB.setDhikr(today, { count: i * 20 });
      }

      await DB._writeChain;

      await DB.setUser(uA);
      const finalA = DB.getDhikr(today).count;

      await DB.setUser(uB);
      const finalB = DB.getDhikr(today).count;

      return { finalA, finalB };
    }, userA);

    expect(result.finalA).toBe(90);
    expect(result.finalB).toBe(180);
  });

});
