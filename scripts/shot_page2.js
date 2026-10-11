const { chromium } = require('playwright-core');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function shotPage2() {
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  await page.goto('file:///' + path.resolve(__dirname, '..', 'blog.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.click('#blogNextBtn a');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.resolve(__dirname, '..', 'blog-page2-shot.png'), fullPage: true });
  
  // Also get the card details on page 2
  const p2Cards = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll('.blog-item-col')).filter(c => c.style.display !== 'none');
    return cols.map((col, idx) => {
      const card = col.querySelector('.user-model-card');
      const title = col.querySelector('.blog-title');
      const desc = col.querySelector('.dish-desc');
      const cardRect = card.getBoundingClientRect();
      return {
        idx,
        title: title.innerText.trim(),
        titleH: Math.round(title.getBoundingClientRect().height),
        descH: Math.round(desc.getBoundingClientRect().height),
        cardH: Math.round(cardRect.height)
      };
    });
  });
  console.log('Page 2 cards:', p2Cards);

  await browser.close();
}
shotPage2().catch(console.error);
