const { chromium } = require('playwright-core');
const path = require('path');

async function snap() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 750 } });
  
  await page.goto('file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(500);

  // Take screenshot of hero section
  const hero = await page.$('.gh-hero-nature');
  if (hero) {
    await hero.screenshot({ path: path.resolve(__dirname, 'hero_mobile_375.png') });
    console.log('Saved hero_mobile_375.png');
  }

  // Also full page screenshot
  await page.screenshot({ path: path.resolve(__dirname, 'index_mobile_375.png'), fullPage: false });
  console.log('Saved index_mobile_375.png');

  await browser.close();
}

snap().catch(console.error);
