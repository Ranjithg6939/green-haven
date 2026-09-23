const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + PORT + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

function sendCdp(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--user-data-dir=' + os.tmpdir() + '\\chrome_inspect_' + Date.now()
  ]);

  let connected = false;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const version = await getJson('/json/version');
      if (version && version.webSocketDebuggerUrl) {
        connected = true;
        break;
      }
    } catch (e) {}
  }

  const targets = await getJson('/json/list');
  const target = targets.find(t => t.type === 'page');
  if (!target) {
    console.error('No page target found!');
    chromeProc.kill();
    return;
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'Runtime.enable');

  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 313,
    height: 936,
    deviceScaleFactor: 1,
    mobile: true
  });

  await sendCdp(ws, 'Page.navigate', { url: 'http://localhost:8080/login.html' });
  await sleep(1500);

  const evalInfo = await sendCdp(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const googleBtn = document.getElementById('btnGoogleSignIn')?.getBoundingClientRect();
      const appleBtn = document.getElementById('btnAppleSignIn')?.getBoundingClientRect();
      const emailBtn = document.getElementById('btnEmailSignIn')?.getBoundingClientRect();
      const divider = document.querySelector('.gh-auth-divider')?.getBoundingClientRect();
      const dividerText = document.querySelector('.gh-auth-divider-text')?.getBoundingClientRect();
      const card = document.querySelector('.bg-card')?.getBoundingClientRect();
      const navbar = document.querySelector('.gh-navbar')?.getBoundingClientRect();
      const brand = document.querySelector('.gh-brand')?.getBoundingClientRect();

      // Check all elements in document that exceed 313px
      const overflowEls = [];
      document.querySelectorAll('*').forEach(el => {
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
        const r = el.getBoundingClientRect();
        if (r.right > window.innerWidth + 1) {
          overflowEls.push({
            tag: el.tagName,
            id: el.id,
            className: typeof el.className === 'string' ? el.className.trim() : '',
            right: Math.round(r.right),
            left: Math.round(r.left),
            width: Math.round(r.width),
            overflowDiff: Math.round(r.right - window.innerWidth),
            text: el.innerText ? el.innerText.slice(0, 30).replace(/\\n/g, ' ') : ''
          });
        }
      });

      return {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        card: card ? { l: Math.round(card.left), r: Math.round(card.right), w: Math.round(card.width) } : null,
        googleBtn: googleBtn ? { top: Math.round(googleBtn.top), bottom: Math.round(googleBtn.bottom), h: Math.round(googleBtn.height) } : null,
        appleBtn: appleBtn ? { top: Math.round(appleBtn.top), bottom: Math.round(appleBtn.bottom), h: Math.round(appleBtn.height) } : null,
        emailBtn: emailBtn ? { top: Math.round(emailBtn.top), bottom: Math.round(emailBtn.bottom), h: Math.round(emailBtn.height), display: window.getComputedStyle(document.getElementById('btnEmailSignIn')).display } : null,
        divider: divider ? { top: Math.round(divider.top), bottom: Math.round(divider.bottom), h: Math.round(divider.height) } : null,
        dividerText: dividerText ? { top: Math.round(dividerText.top), bottom: Math.round(dividerText.bottom), h: Math.round(dividerText.height), w: Math.round(dividerText.width) } : null,
        brand: brand ? { l: Math.round(brand.left), r: Math.round(brand.right), w: Math.round(brand.width) } : null,
        overflowEls
      };
    })()`,
    returnByValue: true
  });

  console.log('EVAL INFO:\n' + JSON.stringify(evalInfo.result.value, null, 2));

  // Take screenshot
  const ss = await sendCdp(ws, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scripts/login_313.png', Buffer.from(ss.data, 'base64'));
  console.log('Saved screenshot to scripts/login_313.png');

  ws.close();
  chromeProc.kill();
}

run().catch(console.error);
