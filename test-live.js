const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, 'test-screenshots');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  console.log('1. Opening app...');
  await page.goto('http://localhost:8080/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Wait for splash to finish

  console.log('2. Screenshot: Home page (initial)');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-home-initial.png') });

  // Find theme toggle
  console.log('3. Looking for theme toggle...');
  let toggled = false;
  try {
    const toggle = page.locator('.topbar-theme-toggle').first();
    await toggle.waitFor({ state: 'visible', timeout: 3000 });
    
    console.log('4. Clicking theme toggle (1st)...');
    await toggle.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-theme-toggled.png') });
    console.log('   Theme toggled! Screenshot taken.');

    console.log('5. Clicking theme toggle (2nd - back)...');
    await toggle.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-theme-restored.png') });
    console.log('   Theme restored! Screenshot taken.');
    toggled = true;
  } catch (e) {
    console.log('   Theme toggle not found or not clickable: ' + e.message);
  }

  // Scroll test
  console.log('6. Scrolling down...');
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-scrolled.png') });
  console.log('   Scrolled! Screenshot taken.');

  // Navigate via bottom nav
  console.log('7. Looking for bottom nav...');
  try {
    const navItems = page.locator('.nav-item, .bottom-nav-item, [data-section]');
    const count = await navItems.count();
    console.log(`   Found ${count} nav items`);
    
    if (count > 2) {
      // Click 3rd nav item (likely Gym or similar)
      await navItems.nth(2).click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-section-3.png') });
      console.log('   Section 3 screenshot taken.');
    }
  } catch (e) {
    console.log('   Nav error: ' + e.message);
  }

  console.log('\n=== ALL TESTS COMPLETE ===');
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
  
  await page.waitForTimeout(2000);
  await browser.close();
})();
