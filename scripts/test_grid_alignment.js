const { chromium } = require('playwright-core');
const path = require('path');

const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testGridAlignment() {
  const browser = await chromium.launch({ executablePath, headless: true });

  const viewports = [
    { name: 'desktop_1440', width: 1440, height: 900 },
    { name: 'laptop_1200', width: 1200, height: 800 },
    { name: 'tablet_992', width: 992, height: 800 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'mobile_375', width: 375, height: 667 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('file:///' + path.resolve(__dirname, '..', 'services.html').replace(/\\/g, '/'), { waitUntil: 'load' });

    // Inject the CSS
    await page.addStyleTag({
      content: `
        .what-we-offer-section .row {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 1.5rem !important;
          justify-content: stretch !important;
        }
        .what-we-offer-section .row > [class*="col-"] {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .what-we-offer-section .luxury-service-card {
          display: grid !important;
          grid-template-rows: auto 1fr !important;
          height: 100% !important;
          width: 100% !important;
        }
        .what-we-offer-section .luxury-service-body {
          display: grid !important;
          grid-template-rows: auto auto minmax(72px, auto) auto 1fr !important;
          height: 100% !important;
          padding: 24px 22px 20px !important;
        }
        .what-we-offer-section .luxury-service-title {
          min-height: 2.6em !important;
          margin-bottom: 8px !important;
        }
        .what-we-offer-section .service-tagline-text {
          min-height: 2.8em !important;
          margin-bottom: 12px !important;
        }
        .what-we-offer-section .luxury-service-desc {
          margin-bottom: 16px !important;
        }
        .what-we-offer-section .service-inclusions-list {
          min-height: 72px !important;
          margin: 0 0 16px 0 !important;
        }
        .what-we-offer-section .luxury-service-body > .mt-auto {
          align-self: end !important;
          margin-top: auto !important;
        }

        @media (max-width: 991.98px) and (min-width: 768px) {
          .what-we-offer-section .row {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 767.98px) {
          .what-we-offer-section .row {
            grid-template-columns: 1fr !important;
          }
        }
      `
    });

    const data = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.what-we-offer-section .luxury-service-card'));
      return cards.map((c, i) => {
        const rect = c.getBoundingClientRect();
        const title = c.querySelector('.luxury-service-title').getBoundingClientRect();
        const action = c.querySelector('.btn-service-action').getBoundingClientRect();
        return {
          item: i + 1,
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          actionBottom: Math.round(action.bottom)
        };
      });
    });

    console.log(`\n=== Viewport: ${vp.name} ===`);
    data.forEach(d => console.log(`Item ${d.item}: [x=${d.x}, y=${d.y}, w=${d.w}, h=${d.h}] btnBottom=${d.actionBottom}`));

    const section = await page.$('.what-we-offer-section');
    if (section) {
      await section.screenshot({ path: path.resolve(__dirname, `grid_test_${vp.name}.png`) });
    }

    await page.close();
  }

  await browser.close();
}

testGridAlignment().catch(console.error);
