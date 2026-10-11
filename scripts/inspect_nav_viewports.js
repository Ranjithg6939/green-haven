const { chromium } = require('playwright-core');
const path = require('path');

const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkNavbar() {
  const browser = await chromium.launch({ executablePath, headless: true });
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'laptop', width: 1024, height: 768 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.waitForTimeout(500);

    const navInfo = await page.evaluate(() => {
      const nav = document.querySelector('.gh-navbar');
      if (!nav) return { exists: false };
      const navRect = nav.getBoundingClientRect();
      const brand = nav.querySelector('.gh-brand');
      const brandRect = brand ? brand.getBoundingClientRect() : null;
      const logoWrapper = nav.querySelector('.gh-logo-wrapper');
      const logoRect = logoWrapper ? logoWrapper.getBoundingClientRect() : null;
      const titleImg = nav.querySelector('.gh-brand-title-img:not([style*="display: none"])');
      const titleRect = titleImg ? titleImg.getBoundingClientRect() : null;
      const desktopNav = nav.querySelector('.gh-nav-desktop, nav:not(.d-none)');
      const desktopNavVisible = desktopNav && window.getComputedStyle(desktopNav).display !== 'none';
      const toggle = nav.querySelector('.gh-mobile-toggle, [data-bs-target="#mobileMenuOffcanvas"]');
      const toggleVisible = toggle && window.getComputedStyle(toggle).display !== 'none';

      return {
        exists: true,
        navHeight: navRect.height,
        logoWrapperSize: logoRect ? { w: logoRect.width, h: logoRect.height } : null,
        titleImgSize: titleRect ? { w: titleRect.width, h: titleRect.height } : null,
        desktopNavVisible,
        toggleVisible
      };
    });

    console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}):`, navInfo);
    await page.screenshot({ path: path.resolve(__dirname, `test_nav_${vp.name}.png`) });
    await page.close();
  }

  await browser.close();
}

checkNavbar().catch(console.error);
