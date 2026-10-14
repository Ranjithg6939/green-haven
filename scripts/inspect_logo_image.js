const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const srcImg = 'C:/Users/Ranjith kumar/.gemini/antigravity/brain/205aae98-64b7-49cc-8250-90110d33460b/.user_uploaded/media_1791733271639_5a6dc611.png';

async function inspect() {
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  
  const base64 = fs.readFileSync(srcImg).toString('base64');
  await page.setContent(`
    <img id="img" src="data:image/png;base64,${base64}">
    <canvas id="cvs"></canvas>
  `);

  const info = await page.evaluate(() => {
    const img = document.getElementById('img');
    const cvs = document.getElementById('cvs');
    cvs.width = img.naturalWidth;
    cvs.height = img.naturalHeight;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const tl = Array.from(ctx.getImageData(0, 0, 1, 1).data);
    const tr = Array.from(ctx.getImageData(img.naturalWidth - 1, 0, 1, 1).data);
    const bl = Array.from(ctx.getImageData(0, img.naturalHeight - 1, 1, 1).data);
    const br = Array.from(ctx.getImageData(img.naturalWidth - 1, img.naturalHeight - 1, 1, 1).data);
    return { width: img.naturalWidth, height: img.naturalHeight, tl, tr, bl, br };
  });

  console.log('Image details:', info);
  await browser.close();
}

inspect().catch(console.error);
