const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;

const PAGES = [
  'index.html',
  'home-2.html',
  'about.html',
  'services.html',
  'blog.html',
  'menu.html',
  'catering.html',
  'pricing.html',
  'contact.html',
  'reservation.html',
  'cart.html',
  'checkout.html',
  'orders.html',
  'login.html',
  'register.html',
  'my-account.html'
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
  console.log('Launching headless Chrome for RTL & Dark Mode audit...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_gh_rtl_' + Date.now()
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
  const target = targets[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'Runtime.enable');

  const issues = [];

  for (const page of PAGES) {
    const url = 'http://localhost:8080/' + page;
    await sendCdp(ws, 'Page.navigate', { url });
    await sleep(600);

    // Test 1: RTL Toggle
    const rtlRes = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.classList.add('rtl');
        const scrollW = document.documentElement.scrollWidth;
        const innerW = window.innerWidth;
        const hasOverflow = scrollW > innerW + 2;
        return { hasOverflow, scrollW, innerW };
      })()`,
      returnByValue: true
    });

    if (rtlRes?.result?.value?.hasOverflow) {
      issues.push({ page, test: 'RTL Overflow', scrollW: rtlRes.result.value.scrollW, innerW: rtlRes.result.value.innerW });
    }

    // Test 2: Dark Mode Toggle
    const darkRes = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        document.documentElement.classList.add('dark');
        const texts = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, label, li'));
        let contrastIssues = 0;
        texts.slice(0, 100).forEach(el => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bg = style.backgroundColor;
          if (color === bg && color !== 'rgba(0, 0, 0, 0)') {
            contrastIssues++;
          }
        });
        return { contrastIssues };
      })()`,
      returnByValue: true
    });

    if (darkRes?.result?.value?.contrastIssues > 0) {
      issues.push({ page, test: 'Dark Mode Invisible Text', count: darkRes.result.value.contrastIssues });
    }
  }

  ws.close();
  chromeProc.kill();
  console.log('RTL & Dark Mode Test Issues:', issues.length);
  if (issues.length) console.log(JSON.stringify(issues, null, 2));
  else console.log('✅ All 16 primary pages passed RTL & Dark Mode checks with 0 issues!');
}

run().catch(console.error);
