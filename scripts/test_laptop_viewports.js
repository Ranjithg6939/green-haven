const http = require('http');
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;

const PAGES = [
  'index.html',
  'home-2.html',
  'about.html',
  'services.html',
  'service-details.html',
  'blog.html',
  'blog-details.html',
  'menu.html',
  'menu-details.html',
  'catering.html',
  'pricing.html',
  'contact.html',
  'reservation.html',
  'cart.html',
  'checkout.html',
  'orders.html',
  'order-success.html',
  'login.html',
  'register.html',
  'my-account.html',
  'coming-soon.html',
  'maintenance.html',
  '404.html',
  'admin.html',
  'admin-404.html'
];

const VIEWPORTS = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1536x864', width: 1536, height: 864 },
  { name: '1920x1080', width: 1920, height: 1080 }
];

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + PORT + urlPath, (res) => {
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
  // Start server if not running
  let serverProc = null;
  const serverRunning = await new Promise(res => {
    http.get('http://127.0.0.1:8080/index.html', () => res(true)).on('error', () => res(false));
  });

  if (!serverRunning) {
    serverProc = spawn('node', [path.join(__dirname, 'server.js')], { stdio: 'ignore' });
    await sleep(800);
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--user-data-dir=' + os.tmpdir() + '\\chrome_laptop_audit_' + Date.now(),
    'http://localhost:8080/index.html'
  ]);

  let connected = false;
  for (let i = 0; i < 30; i++) {
    await sleep(250);
    try {
      const version = await getJson('/json/version');
      if (version && version.webSocketDebuggerUrl) {
        connected = true;
        break;
      }
    } catch (e) {}
  }

  if (!connected) {
    console.error('Failed to connect to Chrome debugging port.');
    chromeProc.kill();
    if (serverProc) serverProc.kill();
    process.exit(1);
  }

  const targets = await getJson('/json/list');
  const target = targets.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension'));
  if (!target) {
    console.error('No suitable page target found.');
    chromeProc.kill();
    process.exit(1);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'Runtime.enable');

  const issues = [];

  for (const page of PAGES) {
    process.stdout.write(`Testing ${page}... `);
    const url = 'http://localhost:8080/' + page;
    await sendCdp(ws, 'Page.navigate', { url });
    await sleep(600);

    let pageHasIssue = false;

    for (const vp of VIEWPORTS) {
      await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: false
      });
      await sleep(150);

      const checkResult = await sendCdp(ws, 'Runtime.evaluate', {
        expression: `(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const clientW = docEl.clientWidth;
          const scrollW = docEl.scrollWidth;
          const hasHScroll = scrollW > clientW + 1;

          function isClipped(el) {
            let cur = el;
            while (cur && cur !== document.body && cur !== docEl) {
              const cs = window.getComputedStyle(cur);
              if (['hidden', 'clip'].includes(cs.overflow) || ['hidden', 'clip'].includes(cs.overflowX)) {
                return true;
              }
              cur = cur.parentElement;
            }
            return false;
          }

          const overflowingElements = [];
          document.querySelectorAll('*').forEach(el => {
            if (['SCRIPT','STYLE','NOSCRIPT','HEAD','META','TITLE','LINK'].includes(el.tagName)) return;
            const cs = window.getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return;
            if (el.classList.contains('offcanvas') && !el.classList.contains('show')) return;
            if (el.closest('.offcanvas') && !el.closest('.offcanvas').classList.contains('show')) return;
            if (el.closest('.h2-ambient-bg-wrapper')) return;
            if (el.classList.contains('modal-backdrop')) return;

            const r = el.getBoundingClientRect();
            if (r.width <= 0 || r.height <= 0) return;

            // An element genuinely overflows the viewport if its visible rect exceeds clientW and is NOT clipped
            if (r.right > clientW + 2 && !isClipped(el)) {
              overflowingElements.push({
                tag: el.tagName,
                cls: (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0, 3).join('.') : '',
                id: el.id || '',
                right: Math.round(r.right),
                clientW: clientW,
                width: Math.round(r.width)
              });
            }
          });

          // Check image issues: overflow parent container or distorted aspect ratio
          const badImages = [];
          document.querySelectorAll('img').forEach(img => {
            const r = img.getBoundingClientRect();
            const parent = img.parentElement;
            if (!parent) return;
            const pr = parent.getBoundingClientRect();
            const cs = window.getComputedStyle(img);
            if (cs.display === 'none' || cs.visibility === 'hidden') return;
            if (r.width <= 0 || r.height <= 0) return;

            // image overflowing its container width
            if (r.width > pr.width + 2 && pr.width > 0 && !isClipped(img)) {
              badImages.push({
                src: img.src ? img.src.split('/').pop() : '',
                imgW: Math.round(r.width),
                parentW: Math.round(pr.width),
                cls: (img.className && typeof img.className === 'string') ? img.className : ''
              });
            }
          });

          return {
            hasHScroll,
            scrollW,
            clientW,
            overflowCount: overflowingElements.length,
            overflowingElements: overflowingElements.slice(0, 5),
            badImages: badImages.slice(0, 5)
          };
        })()`,
        returnByValue: true
      });

      const res = checkResult.result.value;
      if (res.hasHScroll || res.overflowCount > 0 || res.badImages.length > 0) {
        pageHasIssue = true;
        issues.push({
          page,
          vp: vp.name,
          hasHScroll: res.hasHScroll,
          scrollW: res.scrollW,
          clientW: res.clientW,
          overflowing: res.overflowingElements,
          badImages: res.badImages
        });
      }
    }

    if (pageHasIssue) {
      console.log('⚠️ Issues found');
    } else {
      console.log('✅ Clean');
    }
  }

  console.log('\n=======================================');
  console.log(`TOTAL LAPTOP ISSUES FOUND: ${issues.length}`);
  console.log('=======================================');
  issues.forEach(i => {
    console.log(`Page: ${i.page} [${i.vp}] - HScroll: ${i.hasHScroll} (docW: ${i.docW}, winW: ${i.winW})`);
    if (i.overflowing.length) console.log('  Overflowing:', JSON.stringify(i.overflowing));
    if (i.badImages.length) console.log('  Bad Images:', JSON.stringify(i.badImages));
  });

  chromeProc.kill();
  if (serverProc) serverProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Error running audit:', err);
  process.exit(1);
});
