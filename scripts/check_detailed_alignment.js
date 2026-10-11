const { chromium } = require('playwright-core');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkDetailedAlignment() {
  const browser = await chromium.launch({ executablePath, headless: true });
  for (const w of [1440, 1200, 992, 768, 576, 375]) {
    const page = await browser.newPage({ viewport: { width: w, height: 800 } });
    await page.goto('file:///' + path.resolve(__dirname, '..', 'blog.html').replace(/\\/g, '/'), { waitUntil: 'load' });
    const info = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      
      // Check containers alignment with viewport center
      const containers = Array.from(document.querySelectorAll('.container')).map((c, idx) => {
        const r = c.getBoundingClientRect();
        return {
          idx,
          tag: c.closest('header, section, footer')?.tagName.toLowerCase() || 'unknown',
          cls: c.closest('header, section, footer')?.className || '',
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          center: Math.round(r.left + r.width / 2)
        };
      });

      // Check featured card inside container
      const featured = document.getElementById('blogFeaturedCard');
      const featuredRect = featured ? featured.getBoundingClientRect() : null;
      const blogContainer = featured ? featured.closest('.container').getBoundingClientRect() : null;

      // Check grid row inside container
      const grid = document.getElementById('blogGrid');
      const gridRect = grid ? grid.getBoundingClientRect() : null;

      return {
        hasOverflow: scrollWidth > clientWidth,
        scrollWidth,
        clientWidth,
        containers,
        featuredVsContainer: featuredRect && blogContainer ? {
          featuredLeft: Math.round(featuredRect.left),
          featuredRight: Math.round(featuredRect.right),
          containerLeft: Math.round(blogContainer.left),
          containerRight: Math.round(blogContainer.right),
          containerWidth: Math.round(blogContainer.width),
          featuredWidth: Math.round(featuredRect.width)
        } : null,
        gridVsContainer: gridRect && blogContainer ? {
          gridLeft: Math.round(gridRect.left),
          gridRight: Math.round(gridRect.right),
          gridWidth: Math.round(gridRect.width)
        } : null
      };
    });
    console.log(`\n--- Viewport width: ${w} ---`);
    console.log(`Overflow: ${info.hasOverflow} (scroll: ${info.scrollWidth}, client: ${info.clientWidth})`);
    console.log(`Featured:`, info.featuredVsContainer);
    console.log(`Grid:`, info.gridVsContainer);
    console.log(`Containers:`, info.containers);
    await page.close();
  }
  await browser.close();
}

checkDetailedAlignment().catch(console.error);
