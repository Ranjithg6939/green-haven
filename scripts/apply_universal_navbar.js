const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');

const pageActiveMap = {
  'index.html': 'home1',
  'home-2.html': 'home2',
  'about.html': 'about',
  'menu.html': 'menu',
  'services.html': 'services',
  'catering.html': 'catering',
  'pricing.html': 'packages',
  'blog.html': 'blog',
  'contact.html': 'contact',
  'reservation.html': 'none',
  'login.html': 'none',
  'register.html': 'none',
  'cart.html': 'none',
  'checkout.html': 'none',
  'orders.html': 'none',
  'order-success.html': 'none',
  'my-account.html': 'none',
  '404.html': '404',
  'coming-soon.html': 'coming-soon',
  'maintenance.html': 'maintenance'
};

function buildNavbarSnippet(activeKey) {
  const isHome = activeKey === 'home1' || activeKey === 'home2';
  const isPages = activeKey === '404' || activeKey === 'coming-soon' || activeKey === 'maintenance';

  return `<!-- Main Navigation Bar -->
  <header class="gh-navbar">
    <div class="container">
      <div class="d-flex align-items-center justify-content-between">
        
        <!-- Brand Logo with Continuous Animated Outline -->
        <a class="gh-brand gh-brand-auto" href="index.html" aria-label="Green Haven Restaurant">
          <span class="gh-logo-wrapper">
            <svg class="gh-logo-outline-svg" viewBox="0 0 100 100">
              <circle class="gh-logo-outline-base" cx="50" cy="50" r="48" pathLength="100" />
              <circle class="gh-logo-outline-stroke" cx="50" cy="50" r="48" pathLength="100" />
            </svg>
            <img src="assets/images/logo-g.png" alt="Green Haven Logo G" class="gh-logo-icon gh-logo-g">
            <img src="assets/images/logo-h.png" alt="Green Haven Logo H" class="gh-logo-icon gh-logo-h">
          </span>
          <img src="assets/images/title.png" alt="Green Haven" class="gh-brand-title-img gh-title-light">
          <img src="assets/images/title-dark.png" alt="Green Haven" class="gh-brand-title-img gh-title-dark">
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="d-none d-lg-flex align-items-center gap-1">
          <div class="dropdown">
            <a class="gh-nav-link ${isHome ? 'active' : ''} dropdown-toggle" href="index.html" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Home
            </a>
            <ul class="dropdown-menu gh-dropdown-menu">
              <li><a class="gh-dropdown-item ${activeKey === 'home1' ? 'active' : ''}" href="index.html">Home 1 (Gourmet Landing)</a></li>
              <li><a class="gh-dropdown-item ${activeKey === 'home2' ? 'active' : ''}" href="home-2.html">Home 2 (Farm to Plate)</a></li>
            </ul>
          </div>
          <a class="gh-nav-link ${activeKey === 'about' ? 'active' : ''}" href="about.html">About</a>
          <a class="gh-nav-link ${activeKey === 'menu' ? 'active' : ''}" href="menu.html">Menu</a>
          <a class="gh-nav-link ${activeKey === 'services' ? 'active' : ''}" href="services.html">Services</a>
          <a class="gh-nav-link ${activeKey === 'catering' ? 'active' : ''}" href="catering.html">Catering</a>
          <a class="gh-nav-link ${activeKey === 'packages' ? 'active' : ''}" href="pricing.html">Packages</a>
          <a class="gh-nav-link ${activeKey === 'blog' ? 'active' : ''}" href="blog.html">Blog</a>
          <div class="dropdown">
            <a class="gh-nav-link ${isPages ? 'active' : ''} dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Pages
            </a>
            <ul class="dropdown-menu gh-dropdown-menu">
              <li><a class="gh-dropdown-item ${activeKey === '404' ? 'active' : ''}" href="404.html"><i class="bi bi-exclamation-triangle me-2"></i> 404 Error</a></li>
              <li><a class="gh-dropdown-item ${activeKey === 'coming-soon' ? 'active' : ''}" href="coming-soon.html"><i class="bi bi-clock-history me-2"></i> Coming Soon</a></li>
              <li><a class="gh-dropdown-item ${activeKey === 'maintenance' ? 'active' : ''}" href="maintenance.html"><i class="bi bi-tools me-2"></i> Maintenance</a></li>
            </ul>
          </div>
          <a class="gh-nav-link ${activeKey === 'contact' ? 'active' : ''}" href="contact.html">Contact</a>
        </nav>

        <!-- Navbar Controls & Dynamic Auth -->
        <div class="d-flex align-items-center gap-2">
          <!-- Theme Toggle (Dark Mode) -->
          <button class="theme-toggle-btn" aria-label="Toggle Light/Dark Theme">
            <i class="bi bi-moon-stars-fill"></i>
          </button>

          <!-- RTL / LTR Toggle -->
          <button class="rtl-toggle-btn" aria-label="Toggle text direction" title="Switch text direction (RTL / LTR)">
            <i class="bi bi-arrow-left-right"></i>
          </button>

          <!-- Cart Icon -->
          <a href="cart.html" class="cart-nav-btn" title="View Cart">
            <i class="bi bi-bag"></i>
            <span id="navCartCount" class="cart-badge-count" style="display: none;">0</span>
          </a>

          <!-- Reserve Table Icon (Desktop & Tablet only) -->
          <a href="reservation.html" class="reserve-nav-btn d-none d-md-inline-flex" title="Reserve Table" aria-label="Reserve Table" data-bs-toggle="tooltip" data-bs-placement="bottom">
            <i class="bi bi-calendar2-check"></i>
          </a>

          <!-- Standard Desktop Auth (Sign In) -->
          <div id="navAuthContainer" class="d-none d-md-block">
            <div class="d-inline-flex align-items-center gap-2 flex-nowrap">
              <a href="login.html" class="btn btn-outline-primary btn-sm gh-nav-auth-login-btn" title="Sign In" aria-label="Sign In">
                <i class="bi bi-box-arrow-in-right me-1"></i><span class="gh-nav-auth-label">Sign In</span>
              </a>
            </div>
          </div>

          <button class="btn btn-icon btn-outline-primary d-lg-none gh-mobile-toggle" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileMenuOffcanvas" aria-controls="mobileMenuOffcanvas" aria-label="Open mobile navigation">
            <i class="bi bi-list fs-4"></i>
          </button>
        </div>

      </div>
    </div>
  </header>

  <!-- Mobile Offcanvas Menu -->
  <div class="offcanvas offcanvas-start" tabindex="-1" id="mobileMenuOffcanvas" aria-labelledby="mobileMenuOffcanvasLabel">
    <div class="offcanvas-header border-bottom">
      <a class="gh-brand gh-brand-auto" href="index.html" aria-label="Green Haven Restaurant">
        <span class="gh-logo-wrapper">
          <svg class="gh-logo-outline-svg" viewBox="0 0 100 100">
            <circle class="gh-logo-outline-base" cx="50" cy="50" r="48" pathLength="100" />
            <circle class="gh-logo-outline-stroke" cx="50" cy="50" r="48" pathLength="100" />
          </svg>
          <img src="assets/images/logo-g.png" alt="Green Haven Logo G" class="gh-logo-icon gh-logo-g">
          <img src="assets/images/logo-h.png" alt="Green Haven Logo H" class="gh-logo-icon gh-logo-h">
        </span>
        <img src="assets/images/title.png" alt="Green Haven" class="gh-brand-title-img gh-title-light">
        <img src="assets/images/title-dark.png" alt="Green Haven" class="gh-brand-title-img gh-title-dark">
      </a>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body p-4 d-flex flex-column justify-content-between">
      <div>
        <div id="mobileNavAuthContainer" class="mb-3">
          <div class="d-flex gap-2">
            <a href="login.html" class="btn btn-outline-primary btn-sm flex-fill"><i class="bi bi-box-arrow-in-right me-1"></i> Sign In</a>
          </div>
        </div>
        <nav class="d-flex flex-column gap-2">
          <a class="gh-nav-link ${activeKey === 'home1' ? 'active' : ''}" href="index.html">Home (Gourmet)</a>
          <a class="gh-nav-link ${activeKey === 'home2' ? 'active' : ''}" href="home-2.html">Home (Farm to Plate)</a>
          <a class="gh-nav-link ${activeKey === 'about' ? 'active' : ''}" href="about.html">About Us</a>
          <a class="gh-nav-link ${activeKey === 'menu' ? 'active' : ''}" href="menu.html">Full Restaurant Menu</a>
          <a class="gh-nav-link" href="cart.html"><i class="bi bi-bag me-1"></i> My Dining Cart</a>
          <a class="gh-nav-link ${activeKey === 'services' ? 'active' : ''}" href="services.html">Our Services</a>
          <a class="gh-nav-link ${activeKey === 'catering' ? 'active' : ''}" href="catering.html">Plant-Based Catering</a>
          <a class="gh-nav-link ${activeKey === 'packages' ? 'active' : ''}" href="pricing.html">Dining Packages</a>
          <a class="gh-nav-link ${activeKey === 'blog' ? 'active' : ''}" href="blog.html">Culinary Journal</a>
          <div class="dropdown">
            <a class="gh-nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Pages
            </a>
            <ul class="dropdown-menu gh-dropdown-menu">
              <li><a class="gh-dropdown-item ${activeKey === '404' ? 'active' : ''}" href="404.html"><i class="bi bi-exclamation-triangle me-2"></i> 404 Error</a></li>
              <li><a class="gh-dropdown-item ${activeKey === 'coming-soon' ? 'active' : ''}" href="coming-soon.html"><i class="bi bi-clock-history me-2"></i> Coming Soon</a></li>
              <li><a class="gh-dropdown-item ${activeKey === 'maintenance' ? 'active' : ''}" href="maintenance.html"><i class="bi bi-tools me-2"></i> Maintenance</a></li>
            </ul>
          </div>
          <a class="gh-nav-link ${activeKey === 'contact' ? 'active' : ''}" href="contact.html">Contact Us</a>
        </nav>
      </div>
      <div class="border-top pt-3">
        <a href="reservation.html" class="btn btn-primary w-100 mb-2"><i class="bi bi-calendar2-check me-1"></i> Book Table</a>
        <a href="menu.html" class="btn btn-outline-primary w-100"><i class="bi bi-bag-plus me-1"></i> Order Online</a>
      </div>
    </div>
  </div>\n\n  `;
}

let modifiedCount = 0;

for (const [file, activeKey] of Object.entries(pageActiveMap)) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${file}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Find start of <header or navbar comment
  const headerIdx = content.indexOf('<header');
  if (headerIdx === -1) {
    console.warn(`No <header> found in ${file}`);
    continue;
  }

  // Find where <main starts (or first section if no <main)
  let nextSectionIdx = content.indexOf('<main', headerIdx);
  if (nextSectionIdx === -1) {
    // If no <main>, look for <section or <div class="page-header" or similar
    const sectionMatch = content.slice(headerIdx).match(/(<section|<div class="container py|<div class="auth-wrapper|<div class="container my)/);
    if (sectionMatch) {
      nextSectionIdx = headerIdx + sectionMatch.index;
    }
  }

  if (nextSectionIdx === -1) {
    console.error(`Could not locate content start after header in ${file}`);
    continue;
  }

  // Also check if there was a preceding comment like <!-- Main Navigation Bar --> or <!-- Navigation Bar -->
  let replaceStart = headerIdx;
  const beforeHeader = content.slice(0, headerIdx);
  const commentMatch = beforeHeader.match(/<!--\s*([A-Za-z\s]+Navigation[A-Za-z\s]*|Minimal Header)\s*-->\s*$/);
  if (commentMatch) {
    replaceStart = beforeHeader.lastIndexOf(commentMatch[0]);
  }

  const snippet = buildNavbarSnippet(activeKey);
  let newContent = content.slice(0, replaceStart) + snippet + content.slice(nextSectionIdx);

  // Ensure main.js and shop.js are present before </body>
  if (!newContent.includes('assets/js/main.js') && newContent.includes('</body>')) {
    newContent = newContent.replace('</body>', '  <script src="assets/js/main.js"></script>\n</body>');
  }
  if (!newContent.includes('assets/js/shop.js') && newContent.includes('</body>')) {
    newContent = newContent.replace('</body>', '  <script src="assets/js/shop.js"></script>\n</body>');
  }

  fs.writeFileSync(filePath, newContent, 'utf8');
  modifiedCount++;
  console.log(`Updated ${file.padEnd(20)} [active: ${activeKey}]`);
}

console.log(`Successfully unified navbars across ${modifiedCount} pages.`);
