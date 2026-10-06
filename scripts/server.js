/**
 * Green Haven - Lightweight Zero-Dependency Local Static Server
 * Runs out of the box with Node.js: `node server.js` or `npm start`
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = path.resolve(__dirname, "..",);

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4'
};

const VALIDATION_RULES = {
  NAME: /^[A-Za-z]+(?:\s[A-Za-z]+)*$/,
  PHONE: /^\d{10}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  DIGITS: /^\d+$/
};

function validateBackendPayload(payload) {
  const errors = [];
  
  if (payload.name !== undefined) {
    const val = String(payload.name).trim();
    if (!val) {
      errors.push({ field: 'name', message: 'Name is required.' });
    } else if (val.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters.' });
    } else if (/[0-9]/.test(val)) {
      errors.push({ field: 'name', message: 'Name must not contain numbers. Letters only.' });
    } else if (/[^a-zA-Z\s]/.test(val)) {
      errors.push({ field: 'name', message: 'Name cannot contain special characters. Letters only.' });
    } else if (!VALIDATION_RULES.NAME.test(val)) {
      errors.push({ field: 'name', message: 'Name can only contain letters and spaces.' });
    }
  }

  if (payload.phone !== undefined) {
    const val = String(payload.phone).trim();
    if (val) {
      if (!VALIDATION_RULES.DIGITS.test(val)) {
        errors.push({ field: 'phone', message: 'Phone number must contain numbers only.' });
      } else if (val.length !== 10) {
        errors.push({ field: 'phone', message: 'Phone number must be exactly 10 digits.' });
      }
    }
  }

  if (payload.email !== undefined) {
    const val = String(payload.email).trim();
    if (!val) {
      errors.push({ field: 'email', message: 'Email address is required.' });
    } else if (/\s/.test(val)) {
      errors.push({ field: 'email', message: 'Email address cannot contain spaces.' });
    } else if (!VALIDATION_RULES.EMAIL.test(val)) {
      errors.push({ field: 'email', message: 'Please enter a valid email address.' });
    }
  }

  if (payload.guests !== undefined) {
    const val = String(payload.guests).trim();
    if (!VALIDATION_RULES.DIGITS.test(val)) {
      errors.push({ field: 'guests', message: 'Guests must contain numbers only.' });
    }
  }

  return errors;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Backend Validation API Endpoints
  if (req.method === 'POST' && pathname.startsWith('/api/')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const errors = validateBackendPayload(payload);

        res.writeHead(errors.length ? 400 : 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: errors.length === 0,
          endpoint: pathname,
          errors: errors.length ? errors : undefined,
          message: errors.length ? 'Validation failed.' : 'Validation successful.'
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
      }
    });
    return;
  }

  if (pathname === '/') {
    pathname = '/index.html';
  } else if (pathname === '/admin' || pathname === '/admin/') {
    pathname = '/admin.html';
  } else if (pathname === '/admin/404' || pathname === '/admin/404.html') {
    pathname = '/admin-404.html';
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      const isAdminRoute = pathname.startsWith('/admin');
      const notFoundFile = isAdminRoute ? 'admin-404.html' : '404.html';
      const notFoundPath = path.join(ROOT_DIR, notFoundFile);
      if (fs.existsSync(notFoundPath)) {
        res.end(fs.readFileSync(notFoundPath));
      } else {
        res.end('<h1>404 Not Found</h1>');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🌿 Green Haven Local Server is running!`);
  console.log(`👉 Home:       http://localhost:${PORT}/index.html`);
  console.log(`👉 About Us:   http://localhost:${PORT}/about.html`);
  console.log(`👉 Menu:       http://localhost:${PORT}/menu.html`);
  console.log('====================================================');
  console.log('Press Ctrl + C to stop the server.');
});
