const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const srcImg = 'C:/Users/Ranjith kumar/.gemini/antigravity/brain/205aae98-64b7-49cc-8250-90110d33460b/.user_uploaded/media_1791733271639_5a6dc611.png';

async function processLogo() {
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();

  const base64 = fs.readFileSync(srcImg).toString('base64');
  await page.setContent(`
    <img id="img" src="data:image/png;base64,${base64}">
    <canvas id="cvs"></canvas>
  `);

  const pngBase64 = await page.evaluate(() => {
    const img = document.getElementById('img');
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    // Create square canvas with 12% breathing room margin
    const targetSize = Math.max(w, h);
    const padding = Math.round(targetSize * 0.10);
    const canvasSize = targetSize + padding * 2;

    const cvs = document.getElementById('cvs');
    cvs.width = canvasSize;
    cvs.height = canvasSize;
    const ctx = cvs.getContext('2d');

    // Draw centered with breathing room
    const drawX = Math.round((canvasSize - w) / 2);
    const drawY = Math.round((canvasSize - h) / 2);
    ctx.drawImage(img, drawX, drawY);

    const imgData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];

      const brightness = (r + g + b) / 3;
      const diff = Math.max(Math.abs(r - 255), Math.abs(g - 255), Math.abs(b - 255));

      if (diff < 15) {
        d[i + 3] = 0;
      } else if (diff < 50 && brightness > 225) {
        const factor = diff / 50;
        d[i + 3] = Math.round(d[i + 3] * factor);
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return cvs.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
  });

  const outPath = path.resolve(__dirname, '..', 'assets', 'images', 'framlore_logo.png');
  fs.writeFileSync(outPath, Buffer.from(pngBase64, 'base64'));

  // Also write framlore_logo without extension
  const outNoExt = path.resolve(__dirname, '..', 'assets', 'images', 'framlore_logo');
  fs.writeFileSync(outNoExt, Buffer.from(pngBase64, 'base64'));

  console.log('Processed logo saved with breathing room to:', outPath);
  await browser.close();
}

processLogo().catch(console.error);
