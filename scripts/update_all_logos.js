const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Target patterns in HTML files
const navbarLogoG_H_pattern = /<img\s+src="(?:\.\.\/)?assets\/images\/logo-g\.png"[^>]*>\s*<img\s+src="(?:\.\.\/)?assets\/images\/logo-h\.png"[^>]*>/g;
const footerLogoG_pattern = /<img\s+src="(?:\.\.\/)?assets\/images\/logo-g\.png"([^>]*)class="gh-brand-logo-img([^"]*)"/g;

function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const isSubdir = path.dirname(filePath) !== rootDir;
  const prefix = isSubdir ? '../' : '';

  // Navbar replacement
  if (navbarLogoG_H_pattern.test(content)) {
    content = content.replace(navbarLogoG_H_pattern, `<img src="${prefix}assets/images/framlore_logo.png" alt="Green Haven Logo" class="gh-logo-icon">`);
    changed = true;
  }

  // Footer / other single logo replacement
  if (footerLogoG_pattern.test(content)) {
    content = content.replace(footerLogoG_pattern, `<img src="${prefix}assets/images/framlore_logo.png"$1class="gh-brand-logo-img$2"`);
    changed = true;
  }

  // Any remaining standalone logo-g.png in img tags
  const standaloneLogo = new RegExp(`src="(?:\.\.\/)?assets/images/logo-g\\.png"`, 'g');
  if (standaloneLogo.test(content)) {
    content = content.replace(standaloneLogo, `src="${prefix}assets/images/framlore_logo.png"`);
    changed = true;
  }

  const standaloneLogoH = new RegExp(`src="(?:\.\.\/)?assets/images/logo-h\\.png"`, 'g');
  if (standaloneLogoH.test(content)) {
    content = content.replace(standaloneLogoH, `src="${prefix}assets/images/framlore_logo.png"`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated logos in: ${path.relative(rootDir, filePath)}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git' || f === '.gemini') continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (f.endsWith('.html')) {
      processHtmlFile(full);
    }
  }
}

walk(rootDir);

// 2. Also update JS files with embedded HTML snippets
const jsFiles = [
  'assets/js/footer-component.js',
  'assets/js/main.js',
  'assets/js/shop.js',
  'scripts/apply_universal_navbar.js',
  'scripts/apply_model_footer.js'
];

jsFiles.forEach(rel => {
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    let changed = false;
    if (content.includes('assets/images/logo-g.png')) {
      content = content.replaceAll('assets/images/logo-g.png', 'assets/images/framlore_logo.png');
      changed = true;
    }
    if (content.includes('assets/images/logo-h.png')) {
      content = content.replaceAll('assets/images/logo-h.png', 'assets/images/framlore_logo.png');
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(full, content, 'utf8');
      console.log(`Updated logos in JS: ${rel}`);
    }
  }
});

console.log('Finished updating all logo references.');
