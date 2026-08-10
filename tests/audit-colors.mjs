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
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });

const lowContrastItems = await page.evaluate(() => {
  function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function parseRgb(colorStr) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return [0, 0, 0];
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }

  function getContrastRatio(rgb1, rgb2) {
    const lum1 = getLuminance(...rgb1);
    const lum2 = getLuminance(...rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  const elements = Array.from(document.querySelectorAll('h1, h2, h3, p, a, span, b, button'));
  const results = [];

  elements.forEach(el => {
    const style = getComputedStyle(el);
    const fg = style.color;
    const bg = style.backgroundColor !== 'rgba(0, 0, 0, 0)' ? style.backgroundColor : 'rgb(241, 240, 233)';
    const fgRgb = parseRgb(fg);
    const bgRgb = parseRgb(bg);
    const ratio = getContrastRatio(fgRgb, bgRgb);

    if (el.innerText && el.innerText.trim().length > 0 && el.offsetHeight > 0 && ratio < 4.5) {
      results.push({
        text: el.innerText.trim().slice(0, 30),
        tag: el.tagName,
        className: el.className ? el.className.toString() : '',
        fg,
        bg,
        ratio: ratio.toFixed(2)
      });
    }
  });

  return results;
});

console.log('Low Contrast Elements (< 4.5:1):', JSON.stringify(lowContrastItems, null, 2));

await browser.close();
server.close();
