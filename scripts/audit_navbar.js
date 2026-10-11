const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

console.log('Auditing HTML files in', dir);
files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const hasNavbar = content.includes('gh-navbar');
  const hasOffcanvas = content.includes('mobileMenuOffcanvas');
  const hasLogoG = content.includes('logo-g.png');
  const hasLogoH = content.includes('logo-h.png');
  const hasTitleLight = content.includes('title.png');
  const hasTitleDark = content.includes('title-dark.png');
  
  // Extract links in nav
  const headerMatch = content.match(/<header class=["']gh-navbar["']>([\s\S]*?)<\/header>/);
  let navLinks = 'NO HEADER';
  if (headerMatch) {
    const navMatch = headerMatch[1].match(/<nav[^>]*>([\s\S]*?)<\/nav>/);
    if (navMatch) {
      const links = [...navMatch[1].matchAll(/href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/g)]
        .map(m => m[1] + ' (' + m[2].replace(/<[^>]*>/g, '').trim() + ')');
      navLinks = links.join(', ');
    }
  }

  console.log(`\n=== ${f} ===`);
  console.log(`  Navbar: ${hasNavbar}, Offcanvas: ${hasOffcanvas}`);
  console.log(`  Logos: G:${hasLogoG}, H:${hasLogoH}, TitleLight:${hasTitleLight}, TitleDark:${hasTitleDark}`);
  console.log(`  Nav links count: ${headerMatch ? (headerMatch[1].match(/<a /g) || []).length : 0}`);
});
