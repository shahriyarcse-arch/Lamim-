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
  await page.waitForTimeout(1000);

  const ys = [];
  for (let i = 0; i < 120; i++) {
    const s = await page.evaluate(() => {
      const R = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return Math.round(r.top) + '/' + Math.round(r.width); };
      return {
        mint: R('.tile.mint'),
        sky: R('#hero-shs-tile'),
        wide: R('#hero-live-activity-tile'),
        rank: R('#hero-shs-rank'),
      };
    });
    ys.push(s);
    await page.waitForTimeout(100);
  }
  await browser.close();

  console.log('==== PHASE-CYCLE JITTER (120 x 100ms = 12s, covers 2.5 phase cycles) ====');
  ['mint', 'sky', 'wide', 'rank'].forEach((k) => {
    const tops = ys.map((s) => +s[k].split('/')[0]).filter((v) => !Number.isNaN(v));
    const widths = ys.map((s) => +s[k].split('/')[1]).filter((v) => !Number.isNaN(v));
    const tMin = Math.min(...tops), tMax = Math.max(...tops);
    const wMin = Math.min(...widths), wMax = Math.max(...widths);
    console.log(`${k.padEnd(6)} top ${tMin}..${tMax} (moved ${tMax - tMin}px) | width ${wMin}..${wMax} (moved ${wMax - wMin}px) ${tMax - tMin > 1 || wMax - wMin > 1 ? '<<< JITTER' : 'STABLE'}`);
  });
  process.exit(0);
})();
