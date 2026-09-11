const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9225;

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
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_gh_diag_' + Date.now()
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
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'Runtime.enable');

  await sendCdp(ws, 'Page.navigate', { url: 'http://localhost:8080/contact.html' });
  await sleep(1000);

  const res = await sendCdp(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const form = document.getElementById('contactForm');
      return {
        hasForm: !!form,
        formId: form ? form.id : null,
        nameInput: !!document.getElementById('contactName')
      };
    })()`,
    returnByValue: true
  });
  console.log('Diag Contact:', JSON.stringify(res, null, 2));

  ws.close();
  chromeProc.kill();
}

run().catch(console.error);
