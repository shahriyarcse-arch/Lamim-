import mod from 'file:///C:/Users/ASUS/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright/index.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const { chromium } = mod;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target landing page file path
const fileUrl = 'http://localhost:9090/index.html';

const artifactDir = "C:/Users/ASUS/.gemini/antigravity-ide/brain/d79a633e-9305-459a-b649-2e3fbe31e259";

async function runTest(viewport, isMobile, screenshotName) {
  console.log(`Running test for ${screenshotName} (${viewport.width}x${viewport.height})...`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });
  
  const consoleErrors = [];
  const pageErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });
  
  // Go to local index.html URL
  await page.goto(fileUrl, { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(1000); // Wait for entrance animations
  
  // Slowly scroll to the bottom of the page
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const scrollStep = 150; // pixels
  let currentScroll = 0;
  
  while (currentScroll < scrollHeight) {
    currentScroll += scrollStep;
    await page.evaluate((y) => window.scrollTo(0, y), currentScroll);
    await page.waitForTimeout(80); // Sleep 80ms to simulate natural scrolling
  }
  
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // 1. Test Interactive Demo Tabs
  console.log("  Testing Interactive Demo tabs...");
  const tabAnalysis = page.locator('#tab-analysis');
  if (await tabAnalysis.count() > 0) {
    await tabAnalysis.click();
    await page.waitForTimeout(200);
    const modeText = await page.locator('#mode').textContent();
    console.log(`  Demo Tab switched to: ${modeText}`);
    
    // Switch to Profile tab
    const tabProfile = page.locator('#tab-profile');
    await tabProfile.click();
    await page.waitForTimeout(200);
  }

  // 2. Test Mobile Menu Overlay (if viewport is mobile)
  if (isMobile) {
    console.log("  Testing Mobile Menu Toggle...");
    const menuBtn = page.locator('#menuToggle');
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await page.waitForTimeout(200);
      const isMobileActive = await page.evaluate(() => document.querySelector('.nav').classList.contains('mobile-active'));
      console.log(`  Mobile Nav active: ${isMobileActive}`);
      // Close it again
      await menuBtn.click();
      await page.waitForTimeout(200);
    }
  }

  // 3. Test FAQ details accordion
  console.log("  Testing FAQ Accordion...");
  const firstFaqSummary = page.locator('details summary').first();
  if (await firstFaqSummary.count() > 0) {
    await firstFaqSummary.click();
    await page.waitForTimeout(200);
  }
  
  // Capture full page screenshot
  const screenshotPath = path.join(artifactDir, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Saved screenshot to: ${screenshotPath}`);
  
  await browser.close();
  
  return {
    consoleErrors,
    pageErrors
  };
}

try {
  // 1. Desktop Test
  const desktopResult = await runTest(
    { width: 1280, height: 800 },
    false,
    'scrolling_test_desktop.png'
  );
  
  // 2. Mobile Test
  const mobileResult = await runTest(
    { width: 375, height: 812 },
    true,
    'scrolling_test_mobile.png'
  );
  
  console.log('--- TEST RESULTS ---');
  console.log('Desktop Console Errors:', desktopResult.consoleErrors);
  console.log('Desktop Page Errors:', desktopResult.pageErrors);
  console.log('Mobile Console Errors:', mobileResult.consoleErrors);
  console.log('Mobile Page Errors:', mobileResult.pageErrors);
  
  if (desktopResult.pageErrors.length || mobileResult.pageErrors.length) {
    console.log('STATUS: FAILED');
  } else {
    console.log('STATUS: PASSED');
  }
} catch (e) {
  console.error('Test execution failed:', e);
}
