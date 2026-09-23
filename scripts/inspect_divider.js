const http = require('http');

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
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

async function inspect() {
  const targets = await getJson('/json/list');
  const target = targets.find(t => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  await sendCdp(ws, 'Page.navigate', { url: 'http://localhost:8080/login.html' });
  await new Promise(r => setTimeout(r, 800));
  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', { width: 320, height: 600, deviceScaleFactor: 1, mobile: true });
  await new Promise(r => setTimeout(r, 300));

  const res = await sendCdp(ws, 'Runtime.evaluate', {
    expression: `(() => {
      const span = document.querySelector('.gh-auth-divider-text');
      const cs = window.getComputedStyle(span);
      const divider = document.querySelector('.gh-auth-divider');
      const dcs = window.getComputedStyle(divider);
      const appleBtn = document.getElementById('btnAppleSignIn');
      return {
        span: {
          whiteSpace: cs.whiteSpace,
          width: cs.width,
          height: cs.height,
          position: cs.position,
          border: cs.border,
          padding: cs.padding,
          margin: cs.margin,
          transform: cs.transform,
          rect: span.getBoundingClientRect()
        },
        divider: {
          rect: divider.getBoundingClientRect(),
          marginTop: dcs.marginTop,
          marginBottom: dcs.marginBottom
        },
        appleBtnRect: appleBtn.getBoundingClientRect()
      };
    })()`,
    returnByValue: true
  });
  console.log(JSON.stringify(res.result.value, null, 2));
  ws.close();
}

inspect().catch(console.error);
