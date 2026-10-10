const { chromium } = require('playwright-core');
const path = require('path');

async function snapCtas() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });

  const targets = [
    { page: 'services.html', selector: '.services-cta-section, section:has(.btn-white-cta)' },
    { page: 'about.html', selector: '.about-cta-section' },
    { page: 'pricing.html', selector: '.pricing-cta-card, .pricing-cta-banner' },
    { page: 'catering.html', selector: '.catering-cta-section, .catering-hero-cta' }
  ];

  for (const t of targets) {
    const page = await browser.newPage({ viewport: { width: 375, height: 750 } });
    await page.goto('file:///' + path.resolve(__dirname, '..', t.page).replace(/\\/g, '/'), { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const el = await page.$(t.selector);
    if (el) {
      await el.screenshot({ path: path.resolve(__dirname, 'cta_' + t.page.replace('.html', '') + '_375.png') });
      console.log('Saved CTA for', t.page);
    } else {
      console.log('Selector not found for', t.page);
    }
    await page.close();
  }

  await browser.close();
}

snapCtas().catch(console.error);
