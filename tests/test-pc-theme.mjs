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
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
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
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto(`http://127.0.0.1:${port}/app/index.html`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });

// Wait for splash screen to complete (2 seconds)
await page.waitForTimeout(2200);

const defaultTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
console.log(`=== PC DESKTOP THEME AUDIT ===`);
console.log(`Default PC Theme on Fresh Boot: "${defaultTheme}" (Expected: "light") | Pass: ${defaultTheme === 'light' ? 'YES ✅' : 'NO ❌'}`);

const sidebarToggleBtn = await page.$('.sidebar-theme-row .topbar-theme-toggle');
console.log(`PC Sidebar Theme Toggle Visible: ${!!sidebarToggleBtn ? 'YES ✅' : 'NO ❌'}`);

if (sidebarToggleBtn) {
  await sidebarToggleBtn.click();
  await page.waitForTimeout(400);
  const darkTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`Theme after clicking Sidebar Toggle: "${darkTheme}" (Expected: "dark") | Pass: ${darkTheme === 'dark' ? 'YES ✅' : 'NO ❌'}`);

  await sidebarToggleBtn.click();
  await page.waitForTimeout(400);
  const lightTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`Theme after clicking Sidebar Toggle again: "${lightTheme}" (Expected: "light") | Pass: ${lightTheme === 'light' ? 'YES ✅' : 'NO ❌'}`);
}

const artifactPath = path.join('C:', 'Users', 'ASUS', '.gemini', 'antigravity-ide', 'brain', '8c61b40a-572c-43d3-a2cb-60d82108864f', 'pc_light_theme_desktop.png');
await page.screenshot({ path: artifactPath, fullPage: false });
console.log('Saved PC Light Theme desktop screenshot to:', artifactPath);

await browser.close();
server.close();
