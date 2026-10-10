const { chromium } = require('playwright-core');
const path = require('path');

async function testBadge() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });
  
  const viewports = [
    { name: 'mobile_360', width: 360, height: 740 },
    { name: 'mobile_375', width: 375, height: 667 },
    { name: 'mobile_390', width: 390, height: 844 },
    { name: 'mobile_412', width: 412, height: 915 },
    { name: 'tablet_768', width: 768, height: 1024 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const htmlPath = 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/');
    await page.goto(htmlPath, { waitUntil: 'load' });
    
    const badge = await page.$('.gh-hero-badge');
    if (badge) {
      const box = await badge.boundingBox();
      console.log(`Viewport ${vp.name} (${vp.width}px): badge width=${box ? box.width : 'N/A'}, height=${box ? box.height : 'N/A'}`);
      await badge.screenshot({ path: path.resolve(__dirname, `badge_${vp.name}.png`) });
    }
    await page.close();
  }

  await browser.close();
  console.log('Done testing badge.');
}

testBadge().catch(console.error);
