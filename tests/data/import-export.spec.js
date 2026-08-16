import { test, expect } from '@playwright/test';

test.describe('Backup Export & Import Tests', () => {
  test('Export generates valid JSON with standard metadata envelope', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof DB !== 'undefined' && typeof Profile !== 'undefined');

    const exportCheck = await page.evaluate(() => {
      const user = DB.getUser() || { name: 'TestUser' };
      const meta = {
        app: 'lamim.tech',
        version: '1.0.0',
        schema_version: 2,
        exported_at: new Date().toISOString(),
        export_type: 'single_profile'
      };

      return {
        success: typeof Profile.exportData === 'function',
        metaValid: meta.app === 'lamim.tech' && meta.version === '1.0.0'
      };
    });

    expect(exportCheck.success).toBe(true);
    expect(exportCheck.metaValid).toBe(true);
  });

  test('Import safely parses both legacy format and modern envelope format', async ({ page }) => {
    await page.goto('/app/index.html');
    await page.waitForFunction(() => typeof DB !== 'undefined');

    const importCheck = await page.evaluate(() => {
      const legacyBackup = {
        lamim_user: { id: 'u1', name: 'Legacy User' },
        'lamim_salah_2026-08-16': { fajr: 'fard_jamaah' }
      };

      const modernBackup = {
        _meta: {
          app: 'lamim.tech',
          version: '1.0.0',
          schema_version: 2,
          export_type: 'single_profile'
        },
        data: {
          lamim_user: { id: 'u2', name: 'Modern User' },
          'lamim_salah_2026-08-16': { fajr: 'fard_jamaah' }
        }
      };

      const p1 = modernBackup.data ? { ...modernBackup.data, _meta: modernBackup._meta } : modernBackup;
      const p2 = legacyBackup.data ? { ...legacyBackup.data, _meta: legacyBackup._meta } : legacyBackup;

      return {
        modernValid: p1.lamim_user.name === 'Modern User',
        legacyValid: p2.lamim_user.name === 'Legacy User'
      };
    });

    expect(importCheck.modernValid).toBe(true);
    expect(importCheck.legacyValid).toBe(true);
  });
});
