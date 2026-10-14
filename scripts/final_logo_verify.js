const { chromium } = require('playwright-core');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function finalVerify() {
  const browser = await chromium.launch({ executablePath, headless: true });
  for (const p of ['index.html', 'blog.html', 'shop.html', 'services.html']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('file:///' + path.resolve(__dirname, '..', p).replace(/\\/g, '/'), { waitUntil: 'load' });
    const imgInfo = await page.evaluate(() => {
      const navImg = document.querySelector('.gh-navbar .gh-logo-icon');
      const footerImg = document.querySelector('.gh-footer .gh-brand-logo-img');
      return {
        nav: navImg ? { src: navImg.src, naturalWidth: navImg.naturalWidth, naturalHeight: navImg.naturalHeight, display: window.getComputedStyle(navImg).display } : null,
        footer: footerImg ? { src: footerImg.src, naturalWidth: footerImg.naturalWidth, naturalHeight: footerImg.naturalHeight } : null
      };
    });
    console.log(`Page ${p}:`, imgInfo);
    await page.close();
  }
  await browser.close();
}

finalVerify().catch(console.error);
