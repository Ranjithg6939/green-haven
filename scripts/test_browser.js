const http = require('http');
const { spawn } = require('child_process');

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
  { name: '320px', width: 320, height: 600 },
  { name: '375px', width: 375, height: 667 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 }
];

async function getJson(path) {
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

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless Chrome...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_gh_test_' + Date.now()
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

  console.log('Chrome debugging connection established.');
  const targets = await getJson('/json/list');
  const target = targets[0];

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'Runtime.enable');
  await sendCdp(ws, 'Network.enable');

  const allPageResults = [];

  for (const pageName of PAGES) {
    const pageUrl = 'http://localhost:8080/' + pageName;
    const pageResult = {
      page: pageName,
      consoleErrors: [],
      failedRequests: [],
      responsiveOverflows: []
    };

    const consoleHandler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params.type === 'error') {
          const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
          pageResult.consoleErrors.push(text);
        }
      } else if (msg.method === 'Runtime.exceptionThrown') {
        pageResult.consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
      } else if (msg.method === 'Network.responseReceived') {
        if (msg.params.response.status >= 400) {
          pageResult.failedRequests.push({ url: msg.params.response.url, status: msg.params.response.status });
        }
      }
    };

    ws.addEventListener('message', consoleHandler);

    try {
      await sendCdp(ws, 'Page.navigate', { url: pageUrl });
      await sleep(1000);

      for (const vp of VIEWPORTS) {
        await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.width < 992
        });
        await sleep(200);

        const evalRes = await sendCdp(ws, 'Runtime.evaluate', {
          expression: `(() => {
            const scrollW = document.documentElement.scrollWidth;
            const innerW = window.innerWidth;
            const hasOverflow = scrollW > innerW + 2;
            let sample = '';
            if (hasOverflow) {
              const all = Array.from(document.querySelectorAll('*'));
              const bad = all.filter(el => {
                const r = el.getBoundingClientRect();
                return r.right > innerW + 2;
              });
              if (bad.length) {
                sample = bad.map(b => (b.tagName + (b.className ? '.' + String(b.className).trim().split(' ')[0] : ''))).slice(0, 3).join(', ');
              }
            }
            return { hasOverflow, scrollW, innerW, sample };
          })()`,
          returnByValue: true
        });

        if (evalRes && evalRes.result && evalRes.result.value && evalRes.result.value.hasOverflow) {
          pageResult.responsiveOverflows.push({
            viewport: vp.name,
            scrollW: evalRes.result.value.scrollW,
            innerW: evalRes.result.value.innerW,
            sample: evalRes.result.value.sample
          });
        }
      }
    } catch (err) {
      pageResult.consoleErrors.push('Nav error: ' + err.message);
    }

    ws.removeEventListener('message', consoleHandler);
    allPageResults.push(pageResult);
    console.log(`Audited: ${pageName.padEnd(22)} | Errors: ${pageResult.consoleErrors.length} | 404s: ${pageResult.failedRequests.length} | Overflows: ${pageResult.responsiveOverflows.length}`);
  }

  ws.close();
  chromeProc.kill();

  console.log('\n--- BROWSER AUDIT SUMMARY ---');
  let totalErrors = 0;
  let total404 = 0;
  let totalOverflows = 0;

  allPageResults.forEach(r => {
    totalErrors += r.consoleErrors.length;
    total404 += r.failedRequests.length;
    totalOverflows += r.responsiveOverflows.length;
    if (r.consoleErrors.length || r.failedRequests.length || r.responsiveOverflows.length) {
      console.log(`\n[${r.page}]`);
      if (r.consoleErrors.length) console.log('  Console Errors:', r.consoleErrors);
      if (r.failedRequests.length) console.log('  404/Failed Requests:', r.failedRequests);
      if (r.responsiveOverflows.length) console.log('  Responsive Overflows:', r.responsiveOverflows);
    }
  });

  console.log(`\nTOTALS -> Errors: ${totalErrors}, 404s: ${total404}, Overflows: ${totalOverflows}`);
}

run().catch(console.error);
