const { chromium } = require('playwright-core');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkAllViewports() {
  const browser = await chromium.launch({ executablePath, headless: true });
  for (const w of [1200, 992, 768]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto('file:///' + path.resolve(__dirname, '..', 'blog.html').replace(/\\/g, '/'), { waitUntil: 'load' });

    const cardDetails = await page.evaluate(() => {
      const cols = Array.from(document.querySelectorAll('.blog-item-col')).filter(c => c.style.display !== 'none');
      return cols.map((col, idx) => {
        const card = col.querySelector('.user-model-card');
        const meta = col.querySelector('.text-muted.extra-small');
        const title = col.querySelector('.blog-title');
        const desc = col.querySelector('.dish-desc');
        const hr = col.querySelector('hr');
        const btn = col.querySelector('.read-article-pill-btn');
        const cardRect = card.getBoundingClientRect();

        return {
          idx,
          metaTop: Math.round(meta.getBoundingClientRect().top - cardRect.top),
          titleTop: Math.round(title.getBoundingClientRect().top - cardRect.top),
          titleHeight: Math.round(title.getBoundingClientRect().height),
          descTop: Math.round(desc.getBoundingClientRect().top - cardRect.top),
          descHeight: Math.round(desc.getBoundingClientRect().height),
          hrTop: Math.round(hr.getBoundingClientRect().top - cardRect.top),
          btnTop: Math.round(btn.getBoundingClientRect().top - cardRect.top),
          cardHeight: Math.round(cardRect.height)
        };
      });
    });

    console.log(`\n=== VIEWPORT ${w} ===`);
    console.log('Row 1 (0, 1, 2):', cardDetails.slice(0, 3));
    console.log('Row 2 (3, 4, 5):', cardDetails.slice(3, 6));

    await page.close();
  }
  await browser.close();
}

checkAllViewports().catch(console.error);
