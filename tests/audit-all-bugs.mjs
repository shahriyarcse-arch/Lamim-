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

console.log('=== STARTING EXHAUSTIVE BUG AUDIT ===\n');

// 1. Audit Landing Page Pointer Events & Clickability
await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const unclickableLandingElements = await page.evaluate(() => {
  const interactives = Array.from(document.querySelectorAll('a, button, details, input, select, textarea'));
  const blocked = [];
  interactives.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      if (x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight) {
        const topEl = document.elementFromPoint(x, y);
        if (topEl && topEl !== el && !el.contains(topEl) && !topEl.contains(el)) {
          blocked.push({
            element: el.tagName + (el.className ? '.' + el.className.toString().split(' ')[0] : ''),
            text: el.innerText ? el.innerText.trim().slice(0, 20) : '',
            blockedBy: topEl.tagName + (topEl.className ? '.' + topEl.className.toString().split(' ')[0] : '')
          });
        }
      }
    }
  });
  return blocked;
});

console.log(`[Landing Page] Tested ${await page.$$eval('a, button, details', els => els.length)} interactive controls.`);
console.log(`  Blocked / Unclickable Elements: ${unclickableLandingElements.length}`);
if (unclickableLandingElements.length > 0) {
  console.log('  Details:', unclickableLandingElements);
}

// 2. Audit PWA Web App Pointer Events & Clickability Across All Views
const appUrl = `http://127.0.0.1:${port}/app/index.html`;
await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => {
  localStorage.setItem('lamim_settings', JSON.stringify({
    name: 'Audit User',
    gender: 'male',
    city: 'Dhaka',
    method: 1,
    onboarded: true
  }));
});

await page.goto(appUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const unclickableAppElements = await page.evaluate(() => {
  const interactives = Array.from(document.querySelectorAll('a, button, input, select, textarea, [onclick], [data-section]'));
  const blocked = [];
  interactives.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      if (x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight) {
        const topEl = document.elementFromPoint(x, y);
        if (topEl && topEl !== el && !el.contains(topEl) && !topEl.contains(el)) {
          // Check if topEl or its parent has pointer-events: none
          const cs = getComputedStyle(topEl);
          if (cs.pointerEvents !== 'none') {
            blocked.push({
              element: el.tagName + (el.className ? '.' + el.className.toString().split(' ')[0] : ''),
              text: el.innerText ? el.innerText.trim().slice(0, 20) : '',
              blockedBy: topEl.tagName + (topEl.className ? '.' + topEl.className.toString().split(' ')[0] : '')
            });
          }
        }
      }
    }
  });
  return blocked;
});

console.log(`\n[PWA App] Tested ${await page.$$eval('a, button, input, select, textarea, [onclick], [data-section]', els => els.length)} interactive controls.`);
console.log(`  Blocked / Unclickable Elements: ${unclickableAppElements.length}`);
if (unclickableAppElements.length > 0) {
  console.log('  Details:', unclickableAppElements);
}

console.log(`\n=== AUDIT SUMMARY ===`);
console.log(`Page Errors: ${pageErrors.length}`);
console.log(`Console Errors: ${consoleErrors.length}`);

if (pageErrors.length > 0) console.log('Page Errors:', pageErrors);
if (consoleErrors.length > 0) console.log('Console Errors:', consoleErrors);

await browser.close();
server.close();
console.log('\n=== EXHAUSTIVE BUG AUDIT COMPLETE ===');
