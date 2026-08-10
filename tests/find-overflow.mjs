import mod from 'file:///C:/Users/ASUS/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright/index.mjs';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { chromium } = mod;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); res.end('Not found'); }
    else { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(content); }
  });
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });

for (const width of [320, 1024, 1280]) {
  await page.setViewportSize({ width, height: 800 });
  const overflowingElements = await page.evaluate(() => {
    const vpWidth = window.innerWidth;
    const overflowers = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > vpWidth + 1) {
        overflowers.push({
          tag: el.tagName,
          className: el.className ? el.className.toString() : '',
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        });
      }
    });
    return overflowers.slice(0, 5);
  });
  console.log(`Overflow elements at ${width}px:`, overflowingElements);
}

await browser.close();
server.close();
