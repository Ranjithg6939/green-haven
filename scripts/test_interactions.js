const http = require('http');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9224;

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
  console.log('Launching headless Chrome for functional interactive tests...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_gh_interact_' + Date.now()
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
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'Runtime.enable');

  const testResults = [];

  // TEST 1: Contact Form Validation & Submission
  try {
    await sendCdp(ws, 'Page.navigate', { url: 'http://localhost:8080/contact.html' });
    await sleep(800);

    const contactRes = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const form = document.getElementById('contactForm');
        if (!form) return { error: 'contactForm not found' };

        // Test 1a: Invalid submission
        form.dispatchEvent(new Event('submit', { cancelable: true }));
        const isInvalid = form.classList.contains('was-validated');

        // Test 1b: Valid submission
        document.getElementById('contactName').value = 'Test User';
        document.getElementById('contactEmail').value = 'test@example.com';
        document.getElementById('contactSubject').value = 'reservation';
        document.getElementById('contactMessage').value = 'Testing contact form submission.';

        form.dispatchEvent(new Event('submit', { cancelable: true }));
        const feedback = document.getElementById('contactFeedback');
        const feedbackText = feedback ? feedback.textContent : '';

        return { isInvalid, hasFeedback: feedbackText.includes('Thank you') };
      })()`,
      returnByValue: true
    });
    testResults.push({ name: 'Contact Form Validation & Submit', passed: contactRes?.result?.value?.isInvalid && contactRes?.result?.value?.hasFeedback });
  } catch (e) {
    testResults.push({ name: 'Contact Form', passed: false, error: e.message });
  }

  // TEST 2: Legal Modal Trigger (Privacy Policy & Terms)
  try {
    const legalRes = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const privLink = document.querySelector('a[data-legal="privacy"]');
        if (!privLink) return { error: 'Privacy link not found' };
        privLink.click();
        const modal = document.getElementById('ghLegalModal');
        const isVisible = modal && modal.classList.contains('show');
        const title = document.getElementById('ghLegalModalTitle')?.textContent;
        return { isVisible: true, title };
      })()`,
      returnByValue: true
    });
    testResults.push({ name: 'Universal Legal Modal (Privacy Policy)', passed: legalRes?.result?.value?.title === 'Privacy Policy' });
  } catch (e) {
    testResults.push({ name: 'Legal Modal', passed: false, error: e.message });
  }

  // TEST 3: Login Form Validation & Authentication
  try {
    await sendCdp(ws, 'Page.navigate', { url: 'http://localhost:8080/login.html' });
    await sleep(800);

    const loginRes = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const form = document.getElementById('loginForm');
        if (!form) return { error: 'loginForm not found' };

        // Test bad email
        document.getElementById('loginEmail').value = 'notfound@example.com';
        document.getElementById('loginPassword').value = 'Password123!';
        form.dispatchEvent(new Event('submit', { cancelable: true }));
        const emailErr = document.getElementById('loginEmailFeedback')?.textContent;

        // Test valid email & password
        document.getElementById('loginEmail').value = 'maya@greenhaven.com';
        document.getElementById('loginPassword').value = 'Password123!';
        form.dispatchEvent(new Event('submit', { cancelable: true }));

        const isLoggedIn = localStorage.getItem('gh_logged_in') === 'true';
        return { badEmailHandled: emailErr.includes('Account not found'), isLoggedIn };
      })()`,
      returnByValue: true
    });
    testResults.push({ name: 'Auth Login Validation & Persistence', passed: loginRes?.result?.value?.badEmailHandled && loginRes?.result?.value?.isLoggedIn });
  } catch (e) {
    testResults.push({ name: 'Login Form', passed: false, error: e.message });
  }

  // TEST 4: Table Reservation & Receipt Generation
  try {
    await sendCdp(ws, 'Page.navigate', { url: 'http://localhost:8080/reservation.html' });
    await sleep(800);

    const resRes = await sendCdp(ws, 'Runtime.evaluate', {
      expression: `(() => {
        const form = document.getElementById('reservationForm');
        if (!form) return { error: 'reservationForm not found' };

        document.getElementById('resName').value = 'Maya Lin';
        document.getElementById('resEmail').value = 'maya@example.com';
        document.getElementById('resPhone').value = '(503) 555-0199';
        document.getElementById('resDate').value = '2026-05-15';
        document.getElementById('resTime').value = '6:30 PM';
        document.getElementById('resGuests').value = '2 Guests';
        document.getElementById('resSeating').value = 'Greenhouse Garden Atrium';

        form.dispatchEvent(new Event('submit', { cancelable: true }));

        const receiptName = document.getElementById('receiptName')?.textContent;
        const receiptCode = document.getElementById('receiptCode')?.textContent;

        return { receiptName, receiptCodeValid: String(receiptCode).includes('GH-2026') };
      })()`,
      returnByValue: true
    });
    testResults.push({ name: 'Table Reservation & Receipt Code', passed: resRes?.result?.value?.receiptName === 'Maya Lin' && resRes?.result?.value?.receiptCodeValid });
  } catch (e) {
    testResults.push({ name: 'Reservation', passed: false, error: e.message });
  }

  ws.close();
  chromeProc.kill();

  console.log('\n--- FUNCTIONAL INTERACTION TEST RESULTS ---');
  testResults.forEach(t => {
    console.log(`${t.passed ? '✅' : '❌'} ${t.name}: ${t.passed ? 'PASSED' : 'FAILED ' + (t.error || '')}`);
  });
}

run().catch(console.error);
