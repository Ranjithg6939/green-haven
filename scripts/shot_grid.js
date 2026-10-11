const { chromium } = require('playwright-core');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function shot() {
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('file:///' + path.resolve(__dirname, '..', 'blog.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  const el = await page.$('#blogGrid');
  if (el) await el.screenshot({ path: path.resolve(__dirname, '..', 'blogGrid-shot.png') });
  await browser.close();
}
shot().catch(console.error);
