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
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(rootDir, req.url === '/' ? 'app/index.html' : req.url.split('?')[0]);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); }
    else { res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/html' }); res.end(content); }
  });
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const browser = await chromium.launch({ headless: true });

const sections = ['home', 'salah', 'dhikr', 'nafl', 'mujahid', 'gym', 'career', 'finance', 'analysis', 'profile'];
const auditResults = { mobile: {}, desktop: {} };

// Test Mobile (390x844)
const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobileContext.newPage();
await mobilePage.goto(`http://127.0.0.1:${port}/app/index.html`, { waitUntil: 'networkidle' });
await mobilePage.waitForTimeout(1500);

for (const s of sections) {
  const result = await mobilePage.evaluate((sec) => {
    App.navigateTo(sec);
    const bodyWidth = document.body.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const hasHorizontalOverflow = scrollWidth > bodyWidth + 2;
    return { ok: true, overflow: hasHorizontalOverflow };
  }, s);
  auditResults.mobile[s] = result;
}

// Test PC Desktop (1280x800)
const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const desktopPage = await desktopContext.newPage();
await desktopPage.goto(`http://127.0.0.1:${port}/app/index.html`, { waitUntil: 'networkidle' });
await desktopPage.waitForTimeout(1500);

for (const s of sections) {
  const result = await desktopPage.evaluate((sec) => {
    App.navigateTo(sec);
    const bodyWidth = document.body.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    const hasHorizontalOverflow = scrollWidth > bodyWidth + 2;
    return { ok: true, overflow: hasHorizontalOverflow };
  }, s);
  auditResults.desktop[s] = result;
}

console.log('FINAL PWA RESPONSIVE RECHECK RESULTS:', JSON.stringify(auditResults, null, 2));

await browser.close();
server.close();
