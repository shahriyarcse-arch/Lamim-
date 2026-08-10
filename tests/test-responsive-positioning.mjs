import mod from 'file:///C:/Users/ASUS/AppData/Roaming/npm/node_modules/omniroute/node_modules/playwright/index.mjs';
const { chromium } = mod;

const browser = await chromium.launch({ headless: true });

const viewports = [
  { name: 'Mobile-SE (375x667)', width: 375, height: 667 },
  { name: 'Mobile-XR (414x896)', width: 414, height: 896 },
  { name: 'Tablet (768x1024)', width: 768, height: 1024 },
  { name: 'Laptop (1280x800)', width: 1280, height: 800 },
  { name: 'Desktop FHD (1920x1080)', width: 1920, height: 1080 }
];

const targetUrl = new URL('../index.html', import.meta.url).href;

console.log('--- STARTING RESPONSIVE POSITIONING AUDIT ---');

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 });

  // Scroll down to trigger all scroll reveals
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 30);
    });
  });

  await page.waitForTimeout(1000);

  // Check layout overflow
  const metrics = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const bodyWidth = document.body.scrollWidth;
    
    // Check specific critical elements for clipping or unintended overflow
    const overflowElements = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > winWidth + 5 && !el.classList.contains('track') && !el.closest('.ribbon') && !el.closest('.marquee')) {
        overflowElements.push(el.tagName + (el.className ? '.' + el.className.toString().split(' ')[0] : ''));
      }
    });

    return {
      docWidth,
      winWidth,
      bodyWidth,
      hasHorizontalOverflow: docWidth > winWidth,
      overflowCount: overflowElements.length,
      overflowSamples: overflowElements.slice(0, 5)
    };
  });

  console.log(`✓ [${vp.name}] WinWidth: ${metrics.winWidth}px | DocWidth: ${metrics.docWidth}px | Overflow: ${metrics.hasHorizontalOverflow} | Errors: ${pageErrors.length}`);
  if (metrics.overflowSamples.length > 0) {
    console.log(`  Overflow elements: ${metrics.overflowSamples.join(', ')}`);
  }
  await page.close();
}

await browser.close();
console.log('--- RESPONSIVE POSITIONING AUDIT COMPLETE ---');
