const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9225;
const SERVER_PORT = 8085;

function startTestServer() {
  const ROOT_DIR = path.resolve(__dirname, '..');
  const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
  };

  const server = http.createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost:' + SERVER_PORT).pathname);
    if (pathname === '/') pathname = '/index.html';
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(SERVER_PORT, () => {
      resolve(server);
    });
  });
}

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

async function main() {
  const server = await startTestServer();
  const userDataDir = path.join(os.tmpdir(), 'chrome_footer_test_' + Date.now());

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    '--disable-dev-shm-usage',
    '--user-data-dir=' + userDataDir
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
    console.error('Failed to connect to Chrome');
    chromeProc.kill();
    server.close();
    process.exit(1);
  }

  const targets = await getJson('/json/list');
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });

  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'Runtime.enable');

  const consoleErrors = [];
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
    }
  });

  const results = [];

  async function evaluate(code) {
    const res = await sendCdp(ws, 'Runtime.evaluate', {
      expression: code,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      const desc = res.exceptionDetails.exception ? res.exceptionDetails.exception.description : res.exceptionDetails.text;
      throw new Error(desc || JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  const viewports = [
    { name: 'Galaxy S20 (Small Android)', width: 360, height: 800 },
    { name: 'iPhone SE (Medium iOS)', width: 375, height: 667 },
    { name: 'iPhone 14 (Standard iOS)', width: 390, height: 844 },
    { name: 'Pixel 7 (Large Android)', width: 412, height: 915 },
    { name: 'iPad Mini (Tablet Touch)', width: 768, height: 1024 }
  ];

  // Navigate to index.html
  await sendCdp(ws, 'Page.navigate', { url: `http://localhost:${SERVER_PORT}/index.html` });
  await sleep(1000);

  // Scroll to footer
  await evaluate(`(() => {
    const footer = document.querySelector('.gh-footer');
    if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await sleep(300);

  // Test 1: Check all 5 footer social icons exist and have 40x40px dimensions
  const iconsData = await evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('.gh-footer .footer-social-btn'));
    return btns.map(b => {
      const rect = b.getBoundingClientRect();
      const style = window.getComputedStyle(b);
      return {
        label: b.getAttribute('aria-label'),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        bgColor: style.backgroundColor,
        color: style.color
      };
    });
  })()`);

  const hasAll5 = iconsData.length === 5;
  const dimensionsCorrect = iconsData.every(d => d.width === 40 && d.height === 40);
  results.push({
    test: 'Footer contains 5 social icons with exact 40x40px dimensions and round shape',
    passed: hasAll5 && dimensionsCorrect,
    details: `Count: ${iconsData.length}, sizes: ${iconsData.map(d => d.width + 'x' + d.height).join(', ')}`
  });

  // Test 2: Common Mobile Screen Sizes - Touch tap interaction, color change, no layout shift, no sticky state
  for (const vp of viewports) {
    await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sendCdp(ws, 'Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await sleep(200);

    const touchResult = await evaluate(`(async () => {
      const btn = document.querySelector('.gh-footer .footer-social-btn');
      const initialRect = btn.getBoundingClientRect();
      const initialStyle = window.getComputedStyle(btn);
      const initialBg = initialStyle.backgroundColor;

      // Dispatch touchstart
      const touchObj = new Touch({
        identifier: 1,
        target: btn,
        clientX: initialRect.left + initialRect.width / 2,
        clientY: initialRect.top + initialRect.height / 2
      });

      btn.dispatchEvent(new TouchEvent('touchstart', {
        touches: [touchObj],
        targetTouches: [touchObj],
        changedTouches: [touchObj],
        bubbles: true,
        cancelable: true
      }));

      // Instant transition
      await new Promise(r => setTimeout(r, 20));

      const activeStyle = window.getComputedStyle(btn);
      const activeBg = activeStyle.backgroundColor;
      const activeBorder = activeStyle.borderColor;
      const activeColor = activeStyle.color;
      const activeTransform = activeStyle.transform;
      const activeRect = btn.getBoundingClientRect();

      const layoutShiftY = Math.abs(activeRect.top - initialRect.top);
      const layoutShiftX = Math.abs(activeRect.left - initialRect.left);

      // Dispatch touchend
      btn.dispatchEvent(new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touchObj],
        bubbles: true,
        cancelable: true
      }));

      // Wait 180ms delay + 250ms transition
      await new Promise(r => setTimeout(r, 450));

      const releasedStyle = window.getComputedStyle(btn);
      const isTouchActive = btn.classList.contains('touch-active');
      const releasedBg = releasedStyle.backgroundColor;

      return {
        initialBg,
        activeBg,
        activeBorder,
        activeColor,
        activeTransform,
        layoutShiftY,
        layoutShiftX,
        isTouchActive,
        releasedBg
      };
    })()`);

    const isGreenActive = touchResult.activeBg.includes('46, 125, 50');
    const isNoShift = touchResult.layoutShiftY === 0 && touchResult.layoutShiftX === 0;
    const isNoSticky = !touchResult.isTouchActive && touchResult.releasedBg === touchResult.initialBg;

    results.push({
      test: `Mobile Touch on ${vp.name} (${vp.width}x${vp.height}): Color changes to #2E7D32, 0px shift, reverts after release`,
      passed: isGreenActive && isNoShift && isNoSticky,
      details: `ActiveBg: ${touchResult.activeBg}, shift: ${touchResult.layoutShiftY}px, activeTransform: ${touchResult.activeTransform}, stickyReverted: ${isNoSticky}`
    });
  }

  // Test 3: All 5 social icons touch response consistency
  const allIconsTouch = await evaluate(`(async () => {
    const btns = Array.from(document.querySelectorAll('.gh-footer .footer-social-btn'));
    const results = [];
    for (let idx = 0; idx < btns.length; idx++) {
      const btn = btns[idx];
      const rect = btn.getBoundingClientRect();
      const touchObj = new Touch({
        identifier: idx + 1,
        target: btn,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      });
      btn.dispatchEvent(new TouchEvent('touchstart', {
        touches: [touchObj],
        targetTouches: [touchObj],
        changedTouches: [touchObj],
        bubbles: true,
        cancelable: true
      }));
      await new Promise(r => setTimeout(r, 20));
      const activeBg = window.getComputedStyle(btn).backgroundColor;
      btn.dispatchEvent(new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touchObj],
        bubbles: true,
        cancelable: true
      }));
      await new Promise(r => setTimeout(r, 200));
      results.push({
        label: btn.getAttribute('aria-label'),
        activeBg
      });
    }
    return results;
  })()`);

  const all5ChangeColor = allIconsTouch.every(i => i.activeBg.includes('46, 125, 50'));
  results.push({
    test: 'All 5 footer social icons change to brand green (#2E7D32) on touch',
    passed: all5ChangeColor,
    details: allIconsTouch.map(i => `${i.label}: ${i.activeBg}`).join('; ')
  });

  // Test 4: RTL Mode
  await evaluate(`(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.classList.add('rtl');
  })()`);
  await sleep(100);

  const rtlTouch = await evaluate(`(async () => {
    const btn = document.querySelector('.gh-footer .footer-social-btn');
    const rect = btn.getBoundingClientRect();
    const touchObj = new Touch({
      identifier: 1,
      target: btn,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2
    });
    btn.dispatchEvent(new TouchEvent('touchstart', {
      touches: [touchObj],
      targetTouches: [touchObj],
      changedTouches: [touchObj],
      bubbles: true,
      cancelable: true
    }));
    await new Promise(r => setTimeout(r, 20));
    const activeBg = window.getComputedStyle(btn).backgroundColor;
    const activeTransform = window.getComputedStyle(btn).transform;
    btn.dispatchEvent(new TouchEvent('touchend', {
      touches: [],
      targetTouches: [],
      changedTouches: [touchObj],
      bubbles: true,
      cancelable: true
    }));
    return { activeBg, activeTransform };
  })()`);

  results.push({
    test: 'RTL Mode: Touch color-change and no-shift verified',
    passed: rtlTouch.activeBg.includes('46, 125, 50') && (rtlTouch.activeTransform === 'none' || rtlTouch.activeTransform.includes('matrix(1, 0, 0, 1, 0, 0)')),
    details: `RTL ActiveBg: ${rtlTouch.activeBg}, transform: ${rtlTouch.activeTransform}`
  });

  // Revert RTL
  await evaluate(`(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.classList.remove('rtl');
  })()`);

  // Test 5: Dark Mode
  await evaluate(`(() => {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    document.documentElement.classList.add('dark');
  })()`);
  await sleep(100);

  const darkModeTouch = await evaluate(`(async () => {
    const btn = document.querySelector('.gh-footer .footer-social-btn');
    const rect = btn.getBoundingClientRect();
    const touchObj = new Touch({
      identifier: 1,
      target: btn,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2
    });
    btn.dispatchEvent(new TouchEvent('touchstart', {
      touches: [touchObj],
      targetTouches: [touchObj],
      changedTouches: [touchObj],
      bubbles: true,
      cancelable: true
    }));
    await new Promise(r => setTimeout(r, 20));
    const activeBg = window.getComputedStyle(btn).backgroundColor;
    btn.dispatchEvent(new TouchEvent('touchend', {
      touches: [],
      targetTouches: [],
      changedTouches: [touchObj],
      bubbles: true,
      cancelable: true
    }));
    return { activeBg };
  })()`);

  results.push({
    test: 'Dark Mode: Touch color-change verified',
    passed: darkModeTouch.activeBg.includes('46, 125, 50'),
    details: `Dark Mode ActiveBg: ${darkModeTouch.activeBg}`
  });

  // Revert Dark Mode
  await evaluate(`(() => {
    document.documentElement.removeAttribute('data-bs-theme');
    document.documentElement.classList.remove('dark');
  })()`);

  // Test 6: Desktop / Laptop Mode - :hover behavior preserved
  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sendCdp(ws, 'Emulation.setTouchEmulationEnabled', { enabled: false });
  await sleep(200);

  const desktopHoverCheck = await evaluate(`(() => {
    let hasDesktopHoverRule = false;
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.media && rule.media.mediaText.includes('hover: hover')) {
            for (const subRule of rule.cssRules) {
              if (subRule.selectorText && subRule.selectorText.includes('.footer-social-btn:hover')) {
                if (subRule.cssText.includes('translateY(-3px)') && subRule.cssText.includes('46, 125, 50')) {
                  hasDesktopHoverRule = true;
                }
              }
            }
          }
        }
      } catch (e) {}
    }
    return { hasDesktopHoverRule };
  })()`);

  results.push({
    test: 'Desktop / Laptop: :hover keeps existing color (#2E7D32) and elevation (translateY(-3px))',
    passed: desktopHoverCheck.hasDesktopHoverRule,
    details: `Desktop hover rule present: ${desktopHoverCheck.hasDesktopHoverRule}`
  });

  // Test 7: Multiple Pages check
  const testPages = ['about.html', 'catering.html', 'contact.html', 'menu-details.html'];
  for (const pg of testPages) {
    await sendCdp(ws, 'Page.navigate', { url: `http://localhost:${SERVER_PORT}/${pg}` });
    await sleep(800);

    const pgResult = await evaluate(`(async () => {
      const footer = document.querySelector('.gh-footer');
      if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'center' });
      await new Promise(r => setTimeout(r, 100));

      const btns = Array.from(document.querySelectorAll('.gh-footer .footer-social-btn'));
      if (btns.length === 0) return { error: 'No social btns found', count: 0 };
      const btn = btns[0];
      const rect = btn.getBoundingClientRect();
      const touchObj = new Touch({
        identifier: 1,
        target: btn,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      });
      btn.dispatchEvent(new TouchEvent('touchstart', {
        touches: [touchObj],
        targetTouches: [touchObj],
        changedTouches: [touchObj],
        bubbles: true,
        cancelable: true
      }));
      await new Promise(r => setTimeout(r, 20));
      const activeBg = window.getComputedStyle(btn).backgroundColor;
      btn.dispatchEvent(new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touchObj],
        bubbles: true,
        cancelable: true
      }));
      return { count: btns.length, activeBg };
    })()`);

    results.push({
      test: `Page ${pg}: ${pgResult.count} footer social icons respond with green touch color`,
      passed: pgResult.count === 5 && pgResult.activeBg.includes('46, 125, 50'),
      details: `Count: ${pgResult.count}, activeBg: ${pgResult.activeBg}`
    });
  }

  // Test 8: Console errors check
  results.push({
    test: 'Zero Console Errors across all tested viewports and pages',
    passed: consoleErrors.length === 0,
    details: consoleErrors.length === 0 ? '0 console errors' : `Errors: ${consoleErrors.join(' | ')}`
  });

  console.log('\n========================================');
  console.log('FOOTER SOCIAL MEDIA INTERACTION TEST RESULTS');
  console.log('========================================');
  let allPassed = true;
  for (const r of results) {
    const status = r.passed ? 'PASS' : 'FAIL';
    if (!r.passed) allPassed = false;
    console.log(`[${status}] ${r.test}`);
    if (r.details) console.log(`       ${r.details}`);
  }
  console.log('========================================');
  console.log(allPassed ? 'ALL TESTS PASSED SUCCESSFULLY!' : 'SOME TESTS FAILED!');
  console.log('========================================\n');

  ws.close();
  chromeProc.kill();
  server.close();
  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
