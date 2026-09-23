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

async function test() {
  const targets = await getJson('/json/list');
  const target = targets.find(t => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  await sendCdp(ws, 'Page.navigate', { url: 'http://localhost:8080/maintenance.html' });
  await new Promise(r => setTimeout(r, 800));
  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', { width: 320, height: 600, deviceScaleFactor: 1, mobile: true });
  await new Promise(r => setTimeout(r, 200));

  const res1 = await sendCdp(ws, 'Runtime.evaluate', {
    expression: 'document.body.scrollWidth',
    returnByValue: true
  });
  console.log('Before -> body.scrollWidth:', res1.result.value);

  await sendCdp(ws, 'Runtime.evaluate', {
    expression: 'const d = document.getElementById("ghCartDrawer"); if (d) d.style.display = "none";',
    returnByValue: true
  });

  const res2 = await sendCdp(ws, 'Runtime.evaluate', {
    expression: 'document.body.scrollWidth',
    returnByValue: true
  });
  console.log('After hiding drawer -> body.scrollWidth:', res2.result.value);

  ws.close();
}
test().catch(console.error);
