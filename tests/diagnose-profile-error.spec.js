const { test, expect } = require('@playwright/test');

test('Diagnose Profile Render Error', async ({ page }) => {
  const errors = [];
  const consoleMessages = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  // Inject user data BEFORE navigating
  await page.goto('http://127.0.0.1:3901/app/index.html', { waitUntil: 'commit' });
  await page.evaluate(() => {
    localStorage.setItem('lamim_user', JSON.stringify({
      name: 'Shahriyar',
      createdAt: Date.now(),
      spirit_score: 0,
      spirit_level: 'Awakening'
    }));
    localStorage.setItem('lamim_settings', JSON.stringify({ theme: 'light', lang: 'en' }));
  });

  await page.goto('http://127.0.0.1:3901/app/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('=== PAGE ERRORS ===');
  errors.forEach(e => console.log('ERROR:', e));

  console.log('=== CONSOLE MESSAGES ===');
  consoleMessages.filter(m => m.type !== 'log').forEach(m => console.log(m.type.toUpperCase(), m.text));

  // Now navigate to profile tab
  await page.evaluate(() => {
    if (typeof App !== 'undefined') App.navigate('profile');
  });
  await page.waitForTimeout(500);

  const moreErrors = [];
  page.on('pageerror', e => moreErrors.push(e.message));

  console.log('=== AFTER PROFILE NAVIGATE ===');
  moreErrors.forEach(e => console.log('ERROR:', e));

  // Capture screenshot of the profile page before the version modal
  await page.screenshot({ path: 'C:/Users/ASUS/.gemini/antigravity-ide/brain/429234f0-fd7a-4fd2-bea4-10c37763799a/profile_page.png' });

  // Check if toast is visible and what text it has
  const toastText = await page.evaluate(() => {
    const toast = document.querySelector('.toast, [class*="toast"]');
    return toast ? toast.textContent.trim() : 'No toast found';
  });
  console.log('TOAST:', toastText);

  // Get all JS errors from the window
  const jsErrors = await page.evaluate(() => window.__jsErrors || []);
  console.log('JS ERRORS:', JSON.stringify(jsErrors));
});
