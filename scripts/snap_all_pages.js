const { chromium } = require('playwright-core');
const path = require('path');

const pages = [
  'home-2.html',
  'about.html',
  'services.html',
  'pricing.html',
  'menu.html',
  'catering.html',
  'contact.html'
];

async function snapAll() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });

  for (const p of pages) {
    const page = await browser.newPage({ viewport: { width: 375, height: 750 } });
    await page.goto('file:///' + path.resolve(__dirname, '..', p).replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const snapName = 'snap_' + p.replace('.html', '') + '_375.png';
    await page.screenshot({ path: path.resolve(__dirname, snapName), fullPage: false });
    console.log('Saved', snapName);
    await page.close();
  }

  await browser.close();
}

snapAll().catch(console.error);
