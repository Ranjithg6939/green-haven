const http = require('http');
const { spawn } = require('child_process');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

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
  { name: '313px', width: 313, height: 936 },
  { name: '320px', width: 320, height: 600 },
  { name: '360px', width: 360, height: 740 },
  { name: '375px', width: 375, height: 667 },
  { name: '390px', width: 390, height: 844 },
  { name: '414px', width: 414, height: 896 },
  { name: '430px', width: 430, height: 932 }
];

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
    '--user-data-dir=' + os.tmpdir() + '\\chrome_gh_diag_' + Date.now()
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

  if (!connected) {
    console.error('Failed to connect to Chrome debugging port.');
    chromeProc.kill();
    process.exit(1);
  }

  const targets = await getJson('/json/list');
  const target = targets.find(t => t.type === 'page');
  if (!target) {
    console.error('No page target found');
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

  const allIssues = {};

  for (const pageName of PAGES) {
    const url = 'http://localhost:8080/' + pageName;
    try {
      await sendCdp(ws, 'Page.navigate', { url });
      await sleep(700);

      for (const vp of VIEWPORTS) {
        await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: true
        });
        await sleep(150);

        const res = await sendCdp(ws, 'Runtime.evaluate', {
          expression: `(() => {
            const innerW = window.innerWidth;
            const scrollW = document.documentElement.scrollWidth;
            const bodyScrollW = document.body ? document.body.scrollWidth : 0;
            const badElements = [];

            // Find elements extending past window.innerWidth
            document.querySelectorAll('*').forEach(el => {
              if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT') return;
              const r = el.getBoundingClientRect();
              const style = window.getComputedStyle(el);
              if (style.display === 'none' || style.visibility === 'hidden') return;
              // Ignore offcanvas when closed
              if (el.classList.contains('offcanvas') && !el.classList.contains('show')) return;
              if (el.closest('.offcanvas') && !el.closest('.offcanvas').classList.contains('show')) return;

              if (r.right > innerW + 1 && r.width > 0 && r.height > 0) {
                badElements.push({
                  tag: el.tagName,
                  id: el.id || '',
                  className: (typeof el.className === 'string' ? el.className.trim().split(/\\s+/).slice(0, 3).join('.') : ''),
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                  overflow: Math.round(r.right - innerW),
                  text: (el.innerText || '').slice(0, 25).replace(/\\n/g, ' ')
                });
              }
            });

            badElements.sort((a, b) => b.overflow - a.overflow);

            return {
              innerW,
              scrollW,
              bodyScrollW,
              isOverflow: scrollW > innerW + 1 || bodyScrollW > innerW + 1 || badElements.length > 0,
              topBad: badElements.slice(0, 5)
            };
          })()`,
          returnByValue: true
        });

        if (res && res.result && res.result.value && res.result.value.isOverflow) {
          if (!allIssues[pageName]) allIssues[pageName] = [];
          allIssues[pageName].push({
            vp: vp.name,
            scrollW: res.result.value.scrollW,
            bodyScrollW: res.result.value.bodyScrollW,
            badCount: res.result.value.topBad.length,
            topBad: res.result.value.topBad
          });
        }
      }
    } catch (e) {
      console.error('Error on ' + pageName, e.message);
    }
    console.log('Audited ' + pageName + (allIssues[pageName] ? ` -> ${allIssues[pageName].length} viewport issues` : ' -> OK'));
  }

  ws.close();
  chromeProc.kill();

  console.log('\n================ ALL ISSUES SUMMARY ================');
  console.log(JSON.stringify(allIssues, null, 2));
}

run().catch(console.error);
