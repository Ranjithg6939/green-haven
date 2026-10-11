const { chromium } = require('playwright-core');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkBlogAlignment() {
  const browser = await chromium.launch({ executablePath, headless: true });
  const viewports = [
    { name: 'desktop_1440', width: 1440, height: 900 },
    { name: 'laptop_1200', width: 1200, height: 800 },
    { name: 'tablet_992', width: 992, height: 800 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'mobile_375', width: 375, height: 667 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('file:///' + path.resolve(__dirname, '..', 'blog.html').replace(/\\/g, '/'), { waitUntil: 'load' });

    console.log(`\n================== VIEWPORT: ${vp.name} ==================`);

    // Check containers
    const containers = await page.evaluate(() => {
      const list = Array.from(document.querySelectorAll('.container'));
      return list.map((c, i) => {
        const rect = c.getBoundingClientRect();
        const parent = c.parentElement ? c.parentElement.tagName.toLowerCase() + (c.parentElement.className ? '.' + c.parentElement.className.replace(/\s+/g, '.') : '') : '';
        return {
          i,
          parent,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          centerX: Math.round(rect.left + rect.width / 2)
        };
      });
    });
    console.log('Containers:', containers);

    // Check featured article card alignment
    const featuredCard = await page.evaluate(() => {
      const card = document.getElementById('blogFeaturedCard');
      if (!card) return null;
      const rect = card.getBoundingClientRect();
      const img = card.querySelector('.featured-img-wrap');
      const textCol = card.querySelector('.col-lg-5');
      const footer = card.querySelector('.featured-card-footer');
      return {
        card: { left: Math.round(rect.left), width: Math.round(rect.width) },
        img: img ? { left: Math.round(img.getBoundingClientRect().left), width: Math.round(img.getBoundingClientRect().width) } : null,
        text: textCol ? { left: Math.round(textCol.getBoundingClientRect().left), width: Math.round(textCol.getBoundingClientRect().width) } : null,
        footer: footer ? { top: Math.round(footer.getBoundingClientRect().top) } : null
      };
    });
    console.log('Featured card:', featuredCard);

    // Check grid cards alignment
    const gridCards = await page.evaluate(() => {
      const cols = Array.from(document.querySelectorAll('.blog-item-col')).filter(c => c.style.display !== 'none');
      return cols.map((c, i) => {
        const card = c.querySelector('.user-model-card');
        const title = c.querySelector('.blog-title');
        const desc = c.querySelector('.dish-desc');
        const hr = c.querySelector('hr');
        const btn = c.querySelector('.read-article-pill-btn');
        return {
          i,
          cardRect: { x: Math.round(card.getBoundingClientRect().x), y: Math.round(card.getBoundingClientRect().y), w: Math.round(card.getBoundingClientRect().width), h: Math.round(card.getBoundingClientRect().height) },
          titleH: Math.round(title.getBoundingClientRect().height),
          descH: Math.round(desc.getBoundingClientRect().height),
          hrY: Math.round(hr.getBoundingClientRect().y),
          btnY: Math.round(btn.getBoundingClientRect().y),
          btnBottom: Math.round(btn.getBoundingClientRect().bottom)
        };
      });
    });
    console.log('Visible grid cards (count=' + gridCards.length + '):');
    gridCards.forEach(g => {
      console.log(`  Card ${g.i}: x=${g.cardRect.x}, y=${g.cardRect.y}, w=${g.cardRect.w}, h=${g.cardRect.h}, titleH=${g.titleH}, descH=${g.descH}, hrY=${g.hrY}, btnBottom=${g.btnBottom}`);
    });

    await page.close();
  }

  await browser.close();
}

checkBlogAlignment().catch(console.error);
