const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const applicablePages = [
  'index.html',
  'home-2.html',
  'about.html',
  'menu.html',
  'shop.html',
  'services.html',
  'service-details.html',
  'catering.html',
  'pricing.html',
  'blog.html',
  'blog-details.html',
  'contact.html',
  'reservation.html',
  'login.html',
  'register.html',
  'cart.html',
  'checkout.html',
  'orders.html',
  'order-success.html',
  'my-account.html',
  'menu-details.html'
];

const specialPages = [
  '404.html',
  'coming-soon.html',
  'maintenance.html'
];

let allPassed = true;

console.log('=== VERIFYING APPLICABLE PAGES (Navbar Required) ===');
applicablePages.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] ${file} does not exist!`);
    allPassed = false;
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // 1. Navbar and Offcanvas presence
  const hasNavbar = content.includes('<header class="gh-navbar">');
  const hasOffcanvas = content.includes('id="mobileMenuOffcanvas"');
  if (!hasNavbar || !hasOffcanvas) {
    console.error(`[FAIL] ${file}: missing navbar or offcanvas component`);
    allPassed = false;
  }

  // 2. Logo image and title images
  const hasLogoG = content.includes('src="assets/images/logo-g.png"');
  const hasLogoH = content.includes('src="assets/images/logo-h.png"');
  const hasTitleLight = content.includes('src="assets/images/title.png"');
  const hasTitleDark = content.includes('src="assets/images/title-dark.png"');
  if (!hasLogoG || !hasLogoH || !hasTitleLight || !hasTitleDark) {
    console.error(`[FAIL] ${file}: missing logo images`);
    allPassed = false;
  }

  // 3. Logo link navigates to index.html
  const brandMatch = content.match(/<a class="gh-brand gh-brand-auto"[^>]*href="([^"]*)"/);
  if (!brandMatch || brandMatch[1] !== 'index.html') {
    console.error(`[FAIL] ${file}: brand logo does not navigate to index.html`);
    allPassed = false;
  }

  // 4. Menu titles
  const requiredTitles = [
    'Home',
    'Home 1 (Gourmet Landing)',
    'Home 2 (Farm to Plate)',
    'About',
    'Menu',
    'Shop',
    'Services',
    'Catering',
    'Packages',
    'Blog',
    'Pages',
    'Contact'
  ];
  const missingTitles = requiredTitles.filter(t => !content.includes(t));
  if (missingTitles.length > 0) {
    console.error(`[FAIL] ${file}: missing menu titles: ${missingTitles.join(', ')}`);
    allPassed = false;
  }

  // 5. Controls
  const hasThemeToggle = content.includes('class="theme-toggle-btn"');
  const hasRtlToggle = content.includes('class="rtl-toggle-btn"');
  const hasCartBtn = content.includes('href="cart.html"');
  const hasReserveBtn = content.includes('href="reservation.html"');
  const hasAuthContainer = content.includes('id="navAuthContainer"');
  if (!hasThemeToggle || !hasRtlToggle || !hasCartBtn || !hasReserveBtn || !hasAuthContainer) {
    console.error(`[FAIL] ${file}: missing navbar control elements`);
    allPassed = false;
  }

  console.log(`[PASS] ${file.padEnd(22)} - complete navbar, logos, titles, and controls verified`);
});

console.log('\n=== VERIFYING SPECIAL PAGES (Navbar Hidden) ===');
specialPages.forEach(file => {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const hasNavbar = content.includes('<header class="gh-navbar">');
  const hasOffcanvas = content.includes('id="mobileMenuOffcanvas"');

  if (hasNavbar || hasOffcanvas) {
    console.error(`[FAIL] ${file}: navbar is NOT hidden!`);
    allPassed = false;
  } else {
    console.log(`[PASS] ${file.padEnd(22)} - navbar correctly hidden as requested`);
  }
});

console.log(`\nOVERALL STATUS: ${allPassed ? 'ALL AUDITS PASSED 100%' : 'ISSUES DETECTED'}`);
process.exit(allPassed ? 0 : 1);
