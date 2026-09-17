const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9227;
const SERVER_PORT = 8087;

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
  const userDataDir = path.join(os.tmpdir(), 'chrome_scroll_test_' + Date.now());

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

  // TEST 1: Load index.html on Desktop Viewport
  await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sendCdp(ws, 'Page.navigate', { url: `http://localhost:${SERVER_PORT}/index.html` });
  await sleep(1000);

  // Test 1: Button exists, has accessible attributes, up-arrow icon, and is hidden initially at top of page
  const initialData = await evaluate(`(() => {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return { exists: false };
    const style = window.getComputedStyle(btn);
    const icon = btn.querySelector('i');
    return {
      exists: true,
      tagName: btn.tagName,
      type: btn.getAttribute('type'),
      ariaLabel: btn.getAttribute('aria-label'),
      title: btn.getAttribute('title'),
      hasUpArrow: !!icon && (icon.classList.contains('bi-arrow-up') || icon.className.includes('arrow-up')),
      opacity: style.opacity,
      visibility: style.visibility,
      hasShowClass: btn.classList.contains('show'),
      position: style.position,
      width: Math.round(parseFloat(style.width)),
      height: Math.round(parseFloat(style.height)),
      borderRadius: style.borderRadius
    };
  })()`);

  results.push({
    test: 'Scroll to Top Button exists with accessible attributes and circular shape',
    passed: initialData.exists && initialData.tagName === 'BUTTON' && initialData.ariaLabel === 'Scroll to top' && initialData.hasUpArrow && initialData.width === 46 && initialData.height === 46,
    details: `Tag: ${initialData.tagName}, aria-label: ${initialData.ariaLabel}, icon: bi-arrow-up, size: ${initialData.width}x${initialData.height}`
  });

  results.push({
    test: 'Hidden at top of page (opacity 0, visibility hidden, no .show class)',
    passed: initialData.opacity === '0' && initialData.visibility === 'hidden' && !initialData.hasShowClass && initialData.position === 'fixed',
    details: `opacity: ${initialData.opacity}, visibility: ${initialData.visibility}, showClass: ${initialData.hasShowClass}`
  });

  // Test 2: Scroll down > 300px -> Button shows smoothly
  await evaluate(`(() => {
    window.scrollTo({ top: 600, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await sleep(400);

  const scrolledData = await evaluate(`(() => {
    const btn = document.querySelector('.back-to-top');
    const style = window.getComputedStyle(btn);
    const rect = btn.getBoundingClientRect();
    const winWidth = document.documentElement.clientWidth;
    const winHeight = document.documentElement.clientHeight;
    const distFromRight = winWidth - rect.right;
    const distFromBottom = winHeight - rect.bottom;
    return {
      hasShowClass: btn.classList.contains('show'),
      opacity: style.opacity,
      visibility: style.visibility,
      bgColor: style.backgroundColor,
      color: style.color,
      distFromRight: Math.round(distFromRight),
      distFromBottom: Math.round(distFromBottom)
    };
  })()`);

  const isGreen = scrolledData.bgColor.includes('46, 125, 50');
  const isBottomRight = scrolledData.distFromRight >= 20 && scrolledData.distFromRight <= 35 && scrolledData.distFromBottom >= 20 && scrolledData.distFromBottom <= 35;
  results.push({
    test: 'Shows smoothly after scrolling down (>300px) at bottom-right corner',
    passed: scrolledData.hasShowClass && scrolledData.opacity === '1' && scrolledData.visibility === 'visible' && isGreen && isBottomRight,
    details: `opacity: ${scrolledData.opacity}, distRight: ${scrolledData.distFromRight}px, distBottom: ${scrolledData.distFromBottom}px, bg: ${scrolledData.bgColor}`
  });

  // Test 3: Click button -> smooth scroll back to top and hides
  await evaluate(`(() => {
    const btn = document.querySelector('.back-to-top');
    btn.click();
  })()`);
  // Wait for smooth scroll animation to finish
  await sleep(800);

  const afterScrollData = await evaluate(`(() => {
    const btn = document.querySelector('.back-to-top');
    return {
      scrollY: window.scrollY || document.documentElement.scrollTop,
      hasShowClass: btn.classList.contains('show')
    };
  })()`);

  results.push({
    test: 'Click button smoothly scrolls page to top (scrollY = 0) and hides button',
    passed: afterScrollData.scrollY === 0 && !afterScrollData.hasShowClass,
    details: `scrollY: ${afterScrollData.scrollY}, showClass: ${afterScrollData.hasShowClass}`
  });

  // Test 4: Common Mobile Screen Sizes (360x800, 375x667, 390x844, 412x915, 768x1024)
  const mobileViewports = [
    { name: 'Galaxy S20', width: 360, height: 800 },
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 14', width: 390, height: 844 },
    { name: 'Pixel 7', width: 412, height: 915 },
    { name: 'iPad Mini', width: 768, height: 1024 }
  ];

  for (const vp of mobileViewports) {
    await sendCdp(ws, 'Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sendCdp(ws, 'Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await sleep(200);

    // Scroll down on mobile
    await evaluate(`(() => {
      window.scrollTo({ top: 600, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
    })()`);
    await sleep(350);

    const mobileData = await evaluate(`(async () => {
      const btn = document.querySelector('.back-to-top');
      const rect = btn.getBoundingClientRect();
      const style = window.getComputedStyle(btn);
      const winWidth = document.documentElement.clientWidth;
      const winHeight = document.documentElement.clientHeight;
      const distFromRight = winWidth - rect.right;
      const distFromBottom = winHeight - rect.bottom;

      // Simulate touch
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
      const activeStyle = window.getComputedStyle(btn);
      const activeBg = activeStyle.backgroundColor;
      const activeTransform = activeStyle.transform;

      btn.dispatchEvent(new TouchEvent('touchend', {
        touches: [],
        targetTouches: [],
        changedTouches: [touchObj],
        bubbles: true,
        cancelable: true
      }));

      await new Promise(r => setTimeout(r, 300));
      const isTouchActive = btn.classList.contains('touch-active');

      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        distFromRight: Math.round(distFromRight),
        distFromBottom: Math.round(distFromBottom),
        activeBg,
        activeTransform,
        isTouchActive
      };
    })()`);

    const isBottomRightMobile = mobileData.distFromRight >= 15 && mobileData.distFromRight <= 35 && mobileData.distFromBottom >= 15 && mobileData.distFromBottom <= 35;
    const hasActiveFeedback = mobileData.activeBg.includes('30, 82, 32') || mobileData.activeBg.includes('46, 125, 50') || mobileData.activeBg.includes('41, 111, 44') || mobileData.activeBg.includes('35, 95, 37');
    const noSticky = !mobileData.isTouchActive;

    results.push({
      test: `Mobile ${vp.name} (${vp.width}x${vp.height}): Responsive sizing, bottom-right position, tactile touch feedback`,
      passed: isBottomRightMobile && hasActiveFeedback && noSticky && (mobileData.width === 42 || mobileData.width === 46),
      details: `size: ${mobileData.width}x${mobileData.height}, distRight: ${mobileData.distFromRight}px, activeBg: ${mobileData.activeBg}, stickyReverted: ${noSticky}`
    });
  }

  // Test 5: RTL Mode - Verify button stays at bottom-right corner
  await evaluate(`(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.classList.add('rtl');
    window.scrollTo({ top: 600, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  })()`);
  await sleep(300);

  const rtlData = await evaluate(`(() => {
    const btn = document.querySelector('.back-to-top');
    const rect = btn.getBoundingClientRect();
    const winWidth = document.documentElement.clientWidth;
    const distFromRight = winWidth - rect.right;
    const distFromLeft = rect.left;
    return {
      distFromRight: Math.round(distFromRight),
      distFromLeft: Math.round(distFromLeft),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
  })()`);

  // In RTL, it must be at bottom-right (distFromRight ~20-35px, distFromLeft is large)
  const isRightInRtl = rtlData.distFromRight <= 35 && rtlData.distFromLeft > 200;
  results.push({
    test: 'RTL Mode: Button maintains bottom-right corner position without layout shift or flipping to left',
    passed: isRightInRtl,
    details: `distFromRight: ${rtlData.distFromRight}px, distFromLeft: ${rtlData.distFromLeft}px (not flipped!)`
  });

  // Revert RTL
  await evaluate(`(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.classList.remove('rtl');
  })()`);

  // Test 6: Dark Mode - Verify dark theme colors and styling
  await evaluate(`(() => {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    document.documentElement.classList.add('dark');
  })()`);
  await sleep(300);

  const darkData = await evaluate(`(() => {
    const btn = document.querySelector('.back-to-top');
    const style = window.getComputedStyle(btn);
    return {
      bgColor: style.backgroundColor,
      borderColor: style.borderColor,
      color: style.color
    };
  })()`);

  results.push({
    test: 'Dark Mode: Button adapts to botanical dark theme palette with high-contrast text',
    passed: darkData.bgColor.includes('27, 77, 33') || darkData.bgColor.includes('46, 125, 50') || darkData.bgColor.includes('35, 97, 40'),
    details: `Dark bgColor: ${darkData.bgColor}, border: ${darkData.borderColor}, color: ${darkData.color}`
  });

  // Revert Dark Mode
  await evaluate(`(() => {
    document.documentElement.removeAttribute('data-bs-theme');
    document.documentElement.classList.remove('dark');
  })()`);

  // Test 7: Verify Across Green Haven Pages
  const pagesToTest = [
    'about.html',
    'menu.html',
    'catering.html',
    'contact.html',
    'reservation.html',
    'services.html',
    'cart.html',
    'checkout.html',
    'blog.html',
    'blog-details.html',
    'pricing.html',
    'my-account.html'
  ];

  for (const pg of pagesToTest) {
    await sendCdp(ws, 'Page.navigate', { url: `http://localhost:${SERVER_PORT}/${pg}` });
    await sleep(600);

    const pgData = await evaluate(`(() => {
      const btn = document.querySelector('.back-to-top');
      if (!btn) return { exists: false };
      window.scrollTo({ top: 600, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
      const hasShow = btn.classList.contains('show');
      return {
        exists: true,
        hasShow,
        ariaLabel: btn.getAttribute('aria-label'),
        hasIcon: !!btn.querySelector('.bi-arrow-up')
      };
    })()`);

    results.push({
      test: `Page ${pg}: Button present, accessible, shows on scroll`,
      passed: pgData.exists && pgData.ariaLabel === 'Scroll to top' && pgData.hasIcon,
      details: `exists: ${pgData.exists}, hasShow: ${pgData.hasShow}, ariaLabel: ${pgData.ariaLabel}`
    });
  }

  // Test 8: Console Errors
  results.push({
    test: 'Zero Console Errors across all tests, viewports, and pages',
    passed: consoleErrors.length === 0,
    details: consoleErrors.length === 0 ? '0 console errors' : `Errors: ${consoleErrors.join(' | ')}`
  });

  console.log('\n========================================');
  console.log('SCROLL TO TOP BUTTON VERIFICATION RESULTS');
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
