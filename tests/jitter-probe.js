// @ts-check
const { webkit } = require('@playwright/test');

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true, isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  await page.goto('http://localhost:9090/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6500);

  const ys = [];
  for (let i = 0; i < 30; i++) {
    const s = await page.evaluate(() => {
      const R = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return Math.round(r.top); };
      return {
        tile1: R('.hero-art .tile.mint'),
        tile2: R('.hero-art .tile.sky'),
        tile3: R('#hero-live-activity-tile'),
        float: R('.hero .float'),
      };
    });
    ys.push(s);
    await page.waitForTimeout(100);
  }
  await browser.close();

  console.log('==== FINAL FULL-CARD JITTER CHECK (30 x 100ms after 6.5s) ====');
  ['tile1', 'tile2', 'tile3', 'float'].forEach((k) => {
    const vals = ys.map((s) => s[k]).filter((v) => v !== null);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    console.log(`${k.padEnd(7)} min=${min} max=${max} moved=${max - min}px ${max - min > 1 ? '<<< JITTER' : 'STABLE'}`);
  });
  process.exit(0);
})();
