const fs = require('fs');
const path = require('path');
const http = require('http');

const dir = path.resolve(__dirname, '..');

const primaryPages = [
  'index.html',
  'home-2.html',
  'about.html',
  'menu.html',
  'services.html',
  'catering.html',
  'pricing.html',
  'blog.html',
  'contact.html',
  'reservation.html',
  'cart.html',
  'checkout.html',
  'orders.html',
  'order-success.html',
  'my-account.html',
  'login.html',
  'register.html',
  '404.html',
  'coming-soon.html',
  'maintenance.html'
];

let issues = [];

console.log('--- 1. Checking Navigation Structure Across Primary Pages ---');

primaryPages.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    issues.push(`File missing: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Check that Home is dropdown
  const hasHomeDropdown = content.includes('href="home-2.html"') && content.includes('href="index.html"');
  if (!hasHomeDropdown) {
    issues.push(`${file}: Missing Home 1 & Home 2 links`);
  }

  // Check that Services is a single link, not a dropdown
  const hasServicesDropdown = /<a [^>]*dropdown-toggle[^>]*href="services\.html"[^>]*>[\s\S]*?Services/i.test(content) ||
                              content.includes('Our Services</a></li>');
  if (hasServicesDropdown) {
    issues.push(`${file}: Still has Services dropdown menu`);
  }

  // Check that Blog is a single link, not a dropdown
  const hasBlogDropdown = /<a [^>]*dropdown-toggle[^>]*href="blog\.html"[^>]*>[\s\S]*?Blog/i.test(content) ||
                          content.includes('Food &amp; Wellness Blog</a></li>');
  if (hasBlogDropdown) {
    issues.push(`${file}: Still has Blog dropdown menu`);
  }

  // Check that active pages do not link to detail pages
  if (content.includes('service-details.html')) {
    issues.push(`${file}: Contains link to service-details.html`);
  }
  if (content.includes('blog-details.html')) {
    issues.push(`${file}: Contains link to blog-details.html`);
  }
  if (content.includes('menu-details.html')) {
    issues.push(`${file}: Contains link to menu-details.html`);
  }
});

console.log('--- 2. Checking Content Merges ---');

// Check services.html has bespoke-gastronomy
const servicesHtml = fs.readFileSync(path.join(dir, 'services.html'), 'utf8');
if (!servicesHtml.includes('id="bespoke-gastronomy"')) {
  issues.push('services.html: Missing #bespoke-gastronomy merged section');
}
if (!servicesHtml.includes('Immersive Plant-Based Experiences Crafted for Your Milestone')) {
  issues.push('services.html: Missing Bespoke Gastronomy content');
}

// Check blog.html has articleReaderModal
const blogHtml = fs.readFileSync(path.join(dir, 'blog.html'), 'utf8');
if (!blogHtml.includes('id="articleReaderModal"')) {
  issues.push('blog.html: Missing in-page #articleReaderModal');
}
if (!blogHtml.includes('BLOG_ARTICLES')) {
  issues.push('blog.html: Missing BLOG_ARTICLES catalog');
}

// Check redirects on detail pages
const serviceDetailsHtml = fs.readFileSync(path.join(dir, 'service-details.html'), 'utf8');
if (!serviceDetailsHtml.includes('services.html')) {
  issues.push('service-details.html: Missing redirect to services.html');
}

const blogDetailsHtml = fs.readFileSync(path.join(dir, 'blog-details.html'), 'utf8');
if (!blogDetailsHtml.includes('blog.html')) {
  issues.push('blog-details.html: Missing redirect to blog.html');
}

const menuDetailsHtml = fs.readFileSync(path.join(dir, 'menu-details.html'), 'utf8');
if (!menuDetailsHtml.includes('menu.html')) {
  issues.push('menu-details.html: Missing redirect to menu.html');
}

if (issues.length === 0) {
  console.log('✅ ALL NAVIGATION & STRUCTURAL AUDITS PASSED WITH 0 ISSUES!');
} else {
  console.error('❌ Issues detected:');
  issues.forEach(iss => console.error('  -', iss));
  process.exit(1);
}
