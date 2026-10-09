const { chromium } = require('playwright-core');
const path = require('path');

async function run() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const htmlPath = 'file:///' + path.resolve(__dirname, '../about.html').replace(/\\/g, '/');
  await page.goto(htmlPath, { waitUntil: 'load' });

  // Option 1: Apply same background styling to .about-narrative-section
  await page.evaluate(() => {
    document.querySelectorAll('.h2-reveal, .reveal, [data-aos]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.classList.add('active', 'revealed');
    });
  });

  await page.screenshot({ path: path.resolve(__dirname, 'test_about_opt_current.png') });

  // Option 2: Set background on .about-narrative-section
  await page.evaluate(() => {
    const sec = document.querySelector('.about-narrative-section');
    if (sec) {
      sec.style.background = "linear-gradient(180deg, rgba(244, 250, 245, 0.72) 0%, rgba(250, 252, 250, 0.55) 50%, rgba(244, 250, 245, 0.72) 100%), url('assets/images/home-2-bg.jpg') center center / cover no-repeat";
    }
  });
  await page.screenshot({ path: path.resolve(__dirname, 'test_about_opt_narrative.png') });

  // Option 3: Fixed background on body with proper viewport containment so vegetables frame the screen
  await page.evaluate(() => {
    document.body.style.background = "linear-gradient(180deg, rgba(244, 250, 245, 0.45) 0%, rgba(250, 252, 250, 0.35) 50%, rgba(244, 250, 245, 0.45) 100%), url('assets/images/home-2-bg.jpg') center center / 100% 100% no-repeat fixed";
  });
  await page.screenshot({ path: path.resolve(__dirname, 'test_about_opt_fixed_contain.png') });

  await browser.close();
  console.log('Saved test options');
}

run().catch(console.error);
