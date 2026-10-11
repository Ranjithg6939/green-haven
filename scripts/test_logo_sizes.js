const { chromium } = require('playwright-core');
const path = require('path');

const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testLogoSizes() {
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/'), { waitUntil: 'load' });

  for (const s of [52, 46, 42, 38]) {
    await page.evaluate((size) => {
      document.querySelectorAll('.gh-navbar .gh-logo-wrapper').forEach(el => {
        el.style.setProperty('width', size + 'px', 'important');
        el.style.setProperty('height', size + 'px', 'important');
        el.style.setProperty('min-width', size + 'px', 'important');
      });
    }, s);
    await page.waitForTimeout(50);

    const brand = await page.$('.gh-navbar .gh-brand');
    if (brand) {
      await brand.screenshot({ path: path.resolve(__dirname, `logo_size_${s}px.png`) });
      console.log(`Saved logo_size_${s}px.png`);
    }
  }

  await browser.close();
}

testLogoSizes().catch(console.error);
