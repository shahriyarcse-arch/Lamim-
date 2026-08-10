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
    if (err) { res.writeHead(404); res.end('Not found'); }
    else { res.writeHead(200, { 'Content-Type': contentType }); res.end(content); }
  });
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;

const browser = await chromium.launch({ headless: true });

console.log('=== VERIFYING LOGO & WORDMARK CONSISTENCY ===\n');

// 1. Check Landing Page Brand Logo
const landingPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await landingPage.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });

const landingLogoInfo = await landingPage.evaluate(() => {
  const brand = document.querySelector('nav .brand');
  const img = brand.querySelector('img');
  const dot = brand.querySelector('.i-green-dot');
  const dotStyle = getComputedStyle(dot, '::after');
  return {
    imgSrc: img.getAttribute('src'),
    text: brand.innerText.trim(),
    dotColor: dotStyle.backgroundColor,
    hasImg: !!img && img.naturalWidth > 0
  };
});

console.log('1. LANDING PAGE BRAND LOGO:');
console.log(`   Image Src: ${landingLogoInfo.imgSrc} (Loaded: ${landingLogoInfo.hasImg})`);
console.log(`   Wordmark Text: "${landingLogoInfo.text}"`);
console.log(`   Green Dot Color: ${landingLogoInfo.dotColor}`);

// 2. Check PWA App Topbar Logo
const appPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await appPage.goto(`http://127.0.0.1:${port}/app/index.html`, { waitUntil: 'domcontentloaded' });
await appPage.evaluate(() => {
  localStorage.setItem('lamim_settings', JSON.stringify({
    name: 'Logo Test',
    gender: 'male',
    city: 'Dhaka',
    method: 1,
    onboarded: true
  }));
});
await appPage.goto(`http://127.0.0.1:${port}/app/index.html`, { waitUntil: 'networkidle' });

const appTopbarInfo = await appPage.evaluate(() => {
  const brand = document.querySelector('.topbar-brand');
  const img = brand.querySelector('img');
  const dot = brand.querySelector('.i-green-dot');
  const dotStyle = getComputedStyle(dot, '::after');
  return {
    imgSrc: img.getAttribute('src'),
    text: brand.innerText.trim(),
    dotColor: dotStyle.backgroundColor,
    hasImg: !!img && img.naturalWidth > 0
  };
});

console.log('\n2. PWA APP TOPBAR BRAND LOGO:');
console.log(`   Image Src: ${appTopbarInfo.imgSrc} (Loaded: ${appTopbarInfo.hasImg})`);
console.log(`   Wordmark Text: "${appTopbarInfo.text}"`);
console.log(`   Green Dot Color: ${appTopbarInfo.dotColor}`);

// 3. Check PWA Splash Screen Logo
const splashPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await splashPage.goto(`http://127.0.0.1:${port}/app/index.html`, { waitUntil: 'domcontentloaded' });

const splashInfo = await splashPage.evaluate(() => {
  const splash = document.querySelector('.splash');
  const img = splash.querySelector('.splash-logo-img');
  const dot = splash.querySelector('.i-green-dot');
  const dotStyle = getComputedStyle(dot, '::after');
  return {
    imgSrc: img.getAttribute('src'),
    text: splash.querySelector('.splash-wordmark').innerText.trim(),
    dotColor: dotStyle.backgroundColor,
    hasImg: !!img && img.naturalWidth > 0
  };
});

console.log('\n3. PWA SPLASH SCREEN BRAND LOGO:');
console.log(`   Image Src: ${splashInfo.imgSrc} (Loaded: ${splashInfo.hasImg})`);
console.log(`   Wordmark Text: "${splashInfo.text}"`);
console.log(`   Green Dot Color: ${splashInfo.dotColor}`);

const allMatch = landingLogoInfo.hasImg && appTopbarInfo.hasImg && splashInfo.hasImg &&
  landingLogoInfo.text === appTopbarInfo.text && appTopbarInfo.text === splashInfo.text;

console.log(`\n=== RESULT: BRAND LOGO CONSISTENCY IS ${allMatch ? '100% PERFECT & MATCHED ✅' : 'MISMATCHED ❌'} ===`);

await browser.close();
server.close();
