/**
 * Green Haven - Comprehensive Headless Chrome & Backend Validation Test Suite
 */

const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CHROME_PORT = 9225;

async function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + CHROME_PORT + path, (res) => {
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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// 1. Backend Server API Tests
async function testBackendServerValidation() {
  console.log('\n--- 1. Backend HTTP API Validation (/api/...) ---');

  function makePost(path, data) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(data);
      const req = http.request({
        hostname: 'localhost',
        port: 8080,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body });
          }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  // Valid reservation
  const res1 = await makePost('/api/reservation', {
    name: 'Ranjith Kumar',
    phone: '9876543210',
    email: 'ranjith@example.com',
    guests: '4'
  });
  console.log('✓ Valid reservation payload:', res1.statusCode, res1.data.message);
  assert.strictEqual(res1.statusCode, 200);

  // Invalid Name: Ranjith123
  const res2 = await makePost('/api/reservation', {
    name: 'Ranjith123',
    phone: '9876543210',
    email: 'ranjith@example.com'
  });
  console.log('✓ Rejected invalid name (Ranjith123):', res2.statusCode, res2.data.errors[0].message);
  assert.strictEqual(res2.statusCode, 400);

  // Invalid Name: Ranjith@123
  const res3 = await makePost('/api/reservation', {
    name: 'Ranjith@123',
    phone: '9876543210',
    email: 'ranjith@example.com'
  });
  console.log('✓ Rejected special characters in name (Ranjith@123):', res3.statusCode, res3.data.errors[0].message);
  assert.strictEqual(res3.statusCode, 400);

  // Invalid Phone: 98765abc10
  const res4 = await makePost('/api/reservation', {
    name: 'Ranjith Kumar',
    phone: '98765abc10',
    email: 'ranjith@example.com'
  });
  console.log('✓ Rejected non-numeric phone (98765abc10):', res4.statusCode, res4.data.errors[0].message);
  assert.strictEqual(res4.statusCode, 400);

  // Invalid Phone: 9 digits
  const res5 = await makePost('/api/reservation', {
    name: 'Ranjith Kumar',
    phone: '987654321',
    email: 'ranjith@example.com'
  });
  console.log('✓ Rejected non-10-digit phone (987654321):', res5.statusCode, res5.data.errors[0].message);
  assert.strictEqual(res5.statusCode, 400);

  // Invalid Email: ranjith@gmail (missing extension)
  const res6 = await makePost('/api/reservation', {
    name: 'Ranjith Kumar',
    phone: '9876543210',
    email: 'ranjith@gmail'
  });
  console.log('✓ Rejected incomplete email (ranjith@gmail):', res6.statusCode, res6.data.errors[0].message);
  assert.strictEqual(res6.statusCode, 400);
}

// 2. Real Headless Chrome Interactive Tests
async function testBrowserForms() {
  console.log('\n--- 2. Live Headless Chrome Form Validation & Keystroke Tests ---');

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + CHROME_PORT,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_val_' + Date.now()
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
    chromeProc.kill();
    throw new Error('Failed to connect to headless Chrome');
  }

  const targets = await getJson('/json/list');
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  await sendCdp(ws, 'Page.enable');
  await sendCdp(ws, 'DOM.enable');

  async function evaluate(expression) {
    const res = await sendCdp(ws, 'Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || 'Evaluation error');
    }
    return res.result.value;
  }

  async function navigate(url) {
    await sendCdp(ws, 'Page.navigate', { url });
    await sleep(800);
  }

  try {
    // 2.1 Test reservation.html
    console.log('\nTesting reservation.html:');
    await navigate('http://localhost:8080/reservation.html');

    // Unit checks in page context
    const resTest = await evaluate(`
      (function() {
        const V = window.GreenHavenValidator || window.GH_Validator;
        const res = {
          hasValidator: !!V,
          nameRanjith: V.validateName('Ranjith').isValid,
          nameRanjithKumar: V.validateName('Ranjith Kumar').isValid,
          nameSriDevi: V.validateName('Sri Devi').isValid,
          nameInvalidNumbers: V.validateName('Ranjith123').isValid,
          nameInvalidSymbols: V.validateName('Ranjith@123').isValid,
          phoneValid: V.validatePhone('9876543210').isValid,
          phoneInvalidLetters: V.validatePhone('98765abc10').isValid,
          phoneInvalidLength: V.validatePhone('987654321').isValid,
          emailValid: V.validateEmail('ranjith@example.com').isValid,
          emailInvalid: V.validateEmail('ranjith@gmail').isValid
        };
        return res;
      })()
    `);
    console.log('✓ Reservation Validator Unit Results:', resTest);
    assert.strictEqual(resTest.nameRanjith, true);
    assert.strictEqual(resTest.nameRanjithKumar, true);
    assert.strictEqual(resTest.nameSriDevi, true);
    assert.strictEqual(resTest.nameInvalidNumbers, false);
    assert.strictEqual(resTest.nameInvalidSymbols, false);
    assert.strictEqual(resTest.phoneValid, true);
    assert.strictEqual(resTest.phoneInvalidLetters, false);
    assert.strictEqual(resTest.emailValid, true);
    assert.strictEqual(resTest.emailInvalid, false);

    // Live DOM form test: submitting empty form flags all required fields
    const emptySubmitTest = await evaluate(`
      (function() {
        const form = document.getElementById('reservationForm');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        const invalidInputs = form.querySelectorAll('.is-invalid');
        return {
          wasValidated: form.classList.contains('was-validated'),
          invalidCount: invalidInputs.length
        };
      })()
    `);
    console.log('✓ Empty submission flagged invalid inputs:', emptySubmitTest);
    assert.strictEqual(emptySubmitTest.wasValidated, true);
    assert(emptySubmitTest.invalidCount >= 3, 'Should flag name, email, phone');

    // Live DOM form test: typing into name field strips numbers
    const nameSanitizationTest = await evaluate(`
      (function() {
        const nameInput = document.getElementById('resName');
        nameInput.value = 'Ranjith123';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        return {
          cleanedValue: nameInput.value,
          isValid: !nameInput.classList.contains('is-invalid')
        };
      })()
    `);
    console.log('✓ Real-time name sanitization (Ranjith123 -> Ranjith):', nameSanitizationTest);
    assert.strictEqual(nameSanitizationTest.cleanedValue, 'Ranjith');
    assert.strictEqual(nameSanitizationTest.isValid, true);

    // Live DOM form test: typing letters into phone field strips non-digits
    const phoneSanitizationTest = await evaluate(`
      (function() {
        const phoneInput = document.getElementById('resPhone');
        phoneInput.value = '98765abc10';
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        return {
          cleanedValue: phoneInput.value,
          isValid: phoneInput.value.length === 10
        };
      })()
    `);
    console.log('✓ Real-time phone sanitization (98765abc10 -> 9876510):', phoneSanitizationTest);
    assert.strictEqual(phoneSanitizationTest.cleanedValue, '9876510');

    // 2.2 Test checkout.html
    console.log('\nTesting checkout.html:');
    await navigate('http://localhost:8080/checkout.html');
    const checkoutTest = await evaluate(`
      (function() {
        const custName = document.getElementById('custName');
        const custPhone = document.getElementById('custPhone');
        const custEmail = document.getElementById('custEmail');
        const delivZip = document.getElementById('delivZip');

        return {
          nameExists: !!custName,
          phoneExists: !!custPhone,
          emailExists: !!custEmail,
          zipExists: !!delivZip,
          namePattern: custName?.getAttribute('pattern'),
          phonePattern: custPhone?.getAttribute('pattern'),
          phoneMax: custPhone?.getAttribute('maxlength'),
          zipMax: delivZip?.getAttribute('maxlength')
        };
      })()
    `);
    console.log('✓ Checkout Inputs Configured:', checkoutTest);
    assert.strictEqual(checkoutTest.phoneMax, '10');
    assert.strictEqual(checkoutTest.zipMax, '6');

    // 2.3 Test catering.html
    console.log('\nTesting catering.html:');
    await navigate('http://localhost:8080/catering.html');
    const cateringTest = await evaluate(`
      (function() {
        const form = document.getElementById('cateringForm');
        const nameInput = document.getElementById('cateringName');
        const guestsInput = document.getElementById('cateringGuests');

        guestsInput.value = 'abc';
        guestsInput.dispatchEvent(new Event('input', { bubbles: true }));

        return {
          guestsStripped: guestsInput.value === '',
          formFound: !!form
        };
      })()
    `);
    console.log('✓ Catering guests input blocks letters:', cateringTest);
    assert.strictEqual(cateringTest.guestsStripped, true);

    // 2.4 Test register.html
    console.log('\nTesting register.html:');
    await navigate('http://localhost:8080/register.html');
    const registerTest = await evaluate(`
      (function() {
        const fname = document.getElementById('regFirstName');
        const lname = document.getElementById('regLastName');
        const phone = document.getElementById('regPhone');
        const email = document.getElementById('regEmail');

        return {
          fnameExists: !!fname,
          lnameExists: !!lname,
          phoneExists: !!phone,
          emailExists: !!email
        };
      })()
    `);
    console.log('✓ Register form inputs present:', registerTest);
    assert.strictEqual(registerTest.phoneExists, true);

    console.log('\n All Browser Interactive Tests Passed Successfully!');
  } finally {
    ws.close();
    chromeProc.kill();
  }
}

async function main() {
  console.log('====================================================');
  console.log(' GREEN HAVEN STRICT FORM VALIDATION VERIFICATION   ');
  console.log('====================================================');

  await testBackendServerValidation();
  await testBrowserForms();

  console.log('\n====================================================');
  console.log(' ALL STRICT FORM VALIDATION TESTS 100% PASSED!   ');
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('\n Test Suite Error:', err);
  process.exit(1);
});
