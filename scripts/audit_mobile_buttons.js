const { chromium } = require('playwright-core');
const path = require('path');

const PAGES = [
  'index.html',
  'home-2.html',
  'about.html',
  'services.html',
  'service-details.html',
  'menu.html',
  'menu-details.html',
  'catering.html',
  'pricing.html',
  'blog.html',
  'blog-details.html',
  'contact.html',
  'reservation.html',
  'cart.html',
  'checkout.html',
  'orders.html',
  'login.html',
  'register.html',
  'my-account.html'
];

async function checkButtons() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });

  const results = [];

  for (const pageName of PAGES) {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    const fileUrl = 'file:///' + path.resolve(__dirname, '..', pageName).replace(/\\/g, '/');
    try {
      await page.goto(fileUrl, { waitUntil: 'load' });
      await page.waitForTimeout(300);

      const buttons = await page.evaluate(() => {
        const btnEls = Array.from(document.querySelectorAll('button, a.btn, .btn, [class*="btn-"]'));
        return btnEls.map(b => {
          const rect = b.getBoundingClientRect();
          const comp = window.getComputedStyle(b);
          const text = b.innerText.replace(/\s+/g, ' ').trim();
          const isVisible = rect.width > 0 && rect.height > 0 && comp.display !== 'none' && comp.visibility !== 'hidden';
          return {
            tag: b.tagName,
            className: b.className,
            text: text.slice(0, 40),
            isVisible,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            flexDirection: comp.flexDirection,
            justifyContent: comp.justifyContent,
            alignItems: comp.alignItems,
            textAlign: comp.textAlign,
            whiteSpace: comp.whiteSpace,
            overflow: rect.right > window.innerWidth || rect.left < 0
          };
        }).filter(b => b.isVisible);
      });

      const heroBadge = await page.evaluate(() => {
        const badge = document.querySelector('.gh-hero-badge, .hero-animated-pill');
        if (!badge) return null;
        const rect = badge.getBoundingClientRect();
        const comp = window.getComputedStyle(badge);
        return {
          text: badge.innerText.replace(/\s+/g, ' ').trim(),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          whiteSpace: comp.whiteSpace,
          overflow: rect.right > window.innerWidth
        };
      });

      results.push({ page: pageName, buttonsCount: buttons.length, heroBadge, buttons: buttons.slice(0, 10) });
    } catch (e) {
      console.error('Error on', pageName, e.message);
    }
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

checkButtons().catch(console.error);
