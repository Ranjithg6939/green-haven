const { chromium } = require('playwright-core');
const path = require('path');

async function testH2() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 750 } });
  await page.goto('file:///' + path.resolve(__dirname, '../home-2.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const heroBox = await page.$('.h2-hero-img-box');
  if (heroBox) {
    await heroBox.screenshot({ path: path.resolve(__dirname, 'verify_h2_leaf_375px.png') });
  }

  await browser.close();
  console.log('Saved verify_h2_leaf_375px.png');
}

testH2().catch(console.error);
