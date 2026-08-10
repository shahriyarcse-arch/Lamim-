import mod from 'file:///C:/Users/ASUS/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright/index.mjs';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { chromium } = mod;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const pageErrors = [];
const consoleErrors = [];

page.on('pageerror', e => pageErrors.push(e.message));
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

const targetUrl = `http://127.0.0.1:${port}/index.html`;
console.log('--- STARTING A-TO-Z FUNCTIONALITY AUDIT (LANDING PAGE + PWA APP) ---');

await page.goto(targetUrl, { waitUntil: 'networkidle' });

// 1. Audit Landing Page Href Links
const links = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('a[href]')).map(a => ({
    text: a.innerText.trim(),
    href: a.getAttribute('href')
  }));
});

console.log(`✓ Found ${links.length} anchor links on landing page.`);

// Verify all internal href targets exist in HTML
const deadLinks = [];
for (const link of links) {
  if (link.href.startsWith('#') && link.href !== '#') {
    const targetExists = await page.$eval(link.href, () => true).catch(() => false);
    if (!targetExists) deadLinks.push(link);
  }
}

console.log(`✓ Target verification complete. Dead links found: ${deadLinks.length}`);

// 2. Audit Interactive Demo Tabs
const demoTabs = await page.$$('.tabs .tab');
console.log(`✓ Found ${demoTabs.length} demo mode tabs.`);

for (const tab of demoTabs) {
  const modeText = await tab.innerText();
  await tab.evaluate(el => el.click());
  await page.waitForTimeout(100);
  const currentMode = await page.$eval('#mode', el => el.innerText);
  console.log(`  Tab [${modeText}] clicked -> Live Mode Updated: "${currentMode}"`);
}

// 3. Audit Mobile Menu Toggle
const menuToggle = await page.$('#menuToggle');
if (menuToggle) {
  await menuToggle.evaluate(el => el.click());
  await page.waitForTimeout(100);
  const isMobileActive = await page.$eval('.nav', el => el.classList.contains('mobile-active'));
  console.log(`✓ Mobile menu toggle clicked -> Menu Active: ${isMobileActive}`);
}

// 4. Audit FAQ Accordion Details
const faqItems = await page.$$('.faq-list details');
console.log(`✓ Found ${faqItems.length} FAQ accordion items.`);
for (let i = 0; i < faqItems.length; i++) {
  const summary = await faqItems[i].$('summary');
  if (summary) {
    await summary.evaluate(el => el.click());
    await page.waitForTimeout(50);
  }
}

// 5. Audit PWA Web App Navigation & Buttons
const appUrl = `http://127.0.0.1:${port}/app/index.html`;
console.log(`\n--- NAVIGATING TO PWA APP WITH ONBOARDED STATE (${appUrl}) ---`);

// Set onboarded state in localStorage
await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  localStorage.setItem('lamim_settings', JSON.stringify({
    name: 'User',
    gender: 'male',
    city: 'Dhaka',
    method: 1,
    onboarded: true
  }));
});

await page.goto(appUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const appNavButtons = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('.bottom-nav-item, .nav-item, [data-section]')).map(btn => ({
    section: btn.getAttribute('data-section') || btn.getAttribute('data-tab') || btn.innerText.trim(),
    text: btn.innerText.trim()
  }));
});

console.log(`✓ Found ${appNavButtons.length} main PWA navigation buttons.`);

console.log(`\nTotal Page Errors: ${pageErrors.length}`);
console.log(`Total Console Errors: ${consoleErrors.length}`);

if (pageErrors.length > 0) {
  console.log('Page Errors:', pageErrors);
}
if (consoleErrors.length > 0) {
  console.log('Console Errors:', consoleErrors);
}

await browser.close();
server.close();
console.log('--- A-TO-Z FUNCTIONALITY AUDIT COMPLETE ---');
