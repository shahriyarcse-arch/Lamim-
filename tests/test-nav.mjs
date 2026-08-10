import mod from 'file:///C:/Users/ASUS/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright/index.mjs';
import path from 'path';

const { chromium } = mod;

const artifactDir = "C:/Users/ASUS/.gemini/antigravity-ide/brain/d79a633e-9305-459a-b649-2e3fbe31e259";

async function verifyNavigation() {
  console.log("Starting Navigation Link Alignment Audit...");
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  // Navigate to local server
  await page.goto('http://localhost:9090/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // Helper to check if element is in view/scrolled to
  const checkSectionInViewport = async (selector) => {
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }, selector);
  };

  // Header Nav Links mapping
  const headerLinks = [
    { text: 'Why Lamim', target: '#difference' },
    { text: 'Features', target: '#system' },
    { text: 'Preview', target: '#insights' },
    { text: 'FAQ', target: '#faq' }
  ];

  console.log("\n--- AUDITING HEADER NAV LINKS ---");
  for (const link of headerLinks) {
    // Click the nav link
    console.log(`Clicking Header Nav Link: "${link.text}"...`);
    await page.locator(`.links a:has-text("${link.text}")`).click();
    await page.waitForTimeout(600); // wait for Lenis smooth scroll
    
    const isActive = await checkSectionInViewport(link.target);
    console.log(`  Target section "${link.target}" is active in view: ${isActive}`);
  }

  // Footer Nav Links mapping
  const footerLinks = [
    { text: 'The system', target: '#system' },
    { text: 'Insights', target: '#insights' },
    { text: 'FAQ', target: '#faq' },
    { text: 'Difference', target: '#difference' }
  ];

  console.log("\n--- AUDITING FOOTER LINKS ---");
  for (const link of footerLinks) {
    // Scroll to footer first so we can click
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);

    console.log(`Clicking Footer Link: "${link.text}"...`);
    await page.locator(`.footer-links a:has-text("${link.text}")`).click();
    await page.waitForTimeout(600); // wait for Lenis smooth scroll
    
    const isActive = await checkSectionInViewport(link.target);
    console.log(`  Target section "${link.target}" is active in view: ${isActive}`);
  }

  await browser.close();
}

try {
  await verifyNavigation();
} catch (e) {
  console.error("Navigation audit failed:", e);
}
