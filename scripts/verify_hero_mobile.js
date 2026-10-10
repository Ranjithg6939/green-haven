const { chromium } = require('playwright-core');
const path = require('path');

const viewports = [
  { name: '320px', width: 320, height: 600 },
  { name: '360px', width: 360, height: 740 },
  { name: '375px', width: 375, height: 667 },
  { name: '390px', width: 390, height: 844 },
  { name: '412px', width: 412, height: 915 },
  { name: '768px', width: 768, height: 1024 }
];

async function verify() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.waitForTimeout(400);

    const badge = await page.$('.gh-hero-badge');
    const badgeBox = badge ? await badge.boundingBox() : null;

    const btnsRow = await page.$('.hero-btns-row');
    const btnsBox = btnsRow ? await btnsRow.boundingBox() : null;

    console.log(`Viewport ${vp.name}: Badge w=${badgeBox?.width.toFixed(1)}, h=${badgeBox?.height.toFixed(1)} | BtnsRow w=${btnsBox?.width.toFixed(1)}, h=${btnsBox?.height.toFixed(1)}`);

    const hero = await page.$('.gh-hero-nature');
    if (hero) {
      await hero.screenshot({ path: path.resolve(__dirname, `verify_hero_${vp.name}.png`) });
    }
    await page.close();
  }

  // Also verify RTL
  const rtlPage = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await rtlPage.goto('file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await rtlPage.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  await rtlPage.waitForTimeout(400);
  const heroRtl = await rtlPage.$('.gh-hero-nature');
  if (heroRtl) {
    await heroRtl.screenshot({ path: path.resolve(__dirname, `verify_hero_rtl_375px.png`) });
  }
  await rtlPage.close();

  // Also verify Dark Mode
  const darkPage = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await darkPage.goto('file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await darkPage.evaluate(() => document.documentElement.setAttribute('data-bs-theme', 'dark'));
  await darkPage.waitForTimeout(400);
  const heroDark = await darkPage.$('.gh-hero-nature');
  if (heroDark) {
    await heroDark.screenshot({ path: path.resolve(__dirname, `verify_hero_dark_375px.png`) });
  }
  await darkPage.close();

  await browser.close();
  console.log('All verification snapshots completed!');
}

verify().catch(console.error);
