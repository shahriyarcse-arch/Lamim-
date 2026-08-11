// @ts-check
const { chromium, webkit, firefox } = require('@playwright/test');

const viewports = [
  { name: 'Desktop 1920x1080', width: 1920, height: 1080 },
  { name: 'Laptop 1366x768', width: 1366, height: 768 },
  { name: 'Laptop 1280x800', width: 1280, height: 800 },
  { name: 'Tablet 1024x768', width: 1024, height: 768 },
  { name: 'iPad 768x1024', width: 768, height: 1024 },
  { name: 'iPad landscape 1024x768', width: 1024, height: 768 },
  { name: 'Large phone 430x932', width: 430, height: 932 },
  { name: 'iPhone 414x896', width: 414, height: 896 },
  { name: 'iPhone 390x844', width: 390, height: 844 },
  { name: 'iPhone 375x667', width: 375, height: 667 },
  { name: 'iPhone SE 320x568', width: 320, height: 568 },
  { name: 'Phone landscape 844x390', width: 844, height: 390 },
  { name: 'Ultrawide 2560x1080', width: 2560, height: 1080 },
];

const pages = [
  { name: 'landing', path: '/', checkHero: true },
  { name: 'app', path: '/app/index.html', checkHero: false },
];

(async () => {
  const browser = await chromium.launch();
  let failures = 0;
  const results = [];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    for (const p of pages) {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));

      const label = `${p.name}/${vp.name}`;
      try {
        await page.goto(`http://localhost:9090${p.path}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        const probe = await page.evaluate(({ checkHero }) => {
          const root = document.documentElement;
          const body = document.body;
          const overflowX = root.scrollWidth > root.clientWidth || body.scrollWidth > root.clientWidth;

          const offenders = [];
          const all = document.querySelectorAll('body *');
          for (const el of all) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && (r.left < -1 || r.right > root.clientWidth + 1)) {
              const cs = getComputedStyle(el);
              if (cs.position === 'fixed' || cs.overflowX === 'hidden') continue;
              let clipped = false;
              let a = el.parentElement;
              while (a) {
                const acs = getComputedStyle(a);
                if (acs.overflowX === 'hidden' || acs.overflow === 'hidden') { clipped = true; break; }
                a = a.parentElement;
              }
              if (clipped) continue;
              const cls = (el.className && typeof el.className === 'string') ? el.className.slice(0, 60) : el.tagName;
              offenders.push(`${el.tagName}.${cls.split(' ').join('.')} [${Math.round(r.left)},${Math.round(r.right)}]`);
            }
          }

          let hero = null;
          if (checkHero) {
            const art = document.querySelector('.hero-art');
            const floatEl = document.querySelector('.hero .float');
            const appCard = document.querySelector('.hero .app');
            hero = {
              artVisible: art ? art.getBoundingClientRect().width > 0 && getComputedStyle(art).opacity !== '0' : false,
              floatVisible: floatEl ? getComputedStyle(floatEl).opacity !== '0' : false,
              appVisible: appCard ? appCard.getBoundingClientRect().width > 0 : false,
              floatInViewport: floatEl ? floatEl.getBoundingClientRect().left >= -1 && floatEl.getBoundingClientRect().right <= root.clientWidth + 1 : true,
              appInViewport: appCard ? appCard.getBoundingClientRect().left >= -1 && appCard.getBoundingClientRect().right <= root.clientWidth + 1 : true,
            };
          }

          return { overflowX, offenders: offenders.slice(0, 5), hero };
        }, { checkHero: p.checkHero });

        const problems = [];
        if (probe.overflowX) problems.push(`HORIZONTAL OVERFLOW (scrollWidth=${probe.overflowX})`);
        if (probe.offenders.length) problems.push(`OFF-CANVAS: ${probe.offenders.join(' | ')}`);
        if (p.checkHero && probe.hero) {
          if (!probe.hero.artVisible) problems.push('hero-art not visible');
          if (!probe.hero.appVisible) problems.push('hero app card not visible');
          if (!probe.hero.floatVisible) problems.push('hero float not visible (opacity 0)');
          if (!probe.hero.floatInViewport) problems.push('float extends beyond viewport');
          if (!probe.hero.appInViewport) problems.push('app card extends beyond viewport');
        }
        const consoleErrors = errors.filter((e) => !e.includes('favicon') && !e.includes('navigator.vibrate'));
        if (consoleErrors.length) problems.push(`CONSOLE ERRORS: ${consoleErrors.slice(0, 2).join(' | ')}`);

        const status = problems.length ? 'FAIL' : 'OK';
        if (problems.length) failures++;
        results.push(`${status.padEnd(4)} ${label.padEnd(52)} ${problems.length ? problems.join(' ; ') : 'clean'}`);
      } catch (err) {
        failures++;
        results.push(`FAIL ${label.padEnd(49)} EXCEPTION: ${err.message}`);
      }
    }
    await page.close();
  }
  await browser.close();

  console.log('\n==== RESPONSIVE SWEEP RESULTS ====');
  results.forEach((r) => console.log(r));
  console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
  process.exit(failures === 0 ? 0 : 1);
})();
