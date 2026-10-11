const { chromium } = require('playwright-core');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkSections() {
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('file:///' + path.resolve(__dirname, '..', 'blog.html').replace(/\\/g, '/'), { waitUntil: 'load' });

  // Screenshot about-brand-section
  const aboutSec = await page.$('.about-brand-section');
  if (aboutSec) {
    await aboutSec.screenshot({ path: path.resolve(__dirname, '..', 'about-brand-section.png') });
  }

  // Screenshot featured card
  const featSec = await page.$('#blogFeaturedCard');
  if (featSec) {
    await featSec.screenshot({ path: path.resolve(__dirname, '..', 'featured-card-shot.png') });
  }

  // Screenshot pagination
  const pagSec = await page.$('#blogPaginationNav');
  if (pagSec) {
    await pagSec.screenshot({ path: path.resolve(__dirname, '..', 'pagination-shot.png') });
  }

  await browser.close();
}

checkSections().catch(console.error);
