const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const target = '<span class="gh-brand-text">Green Haven</span>';
const replacement = '<img src="assets/images/title.png" alt="Green Haven" class="gh-brand-title-img gh-title-light footer-title-img">\n            <img src="assets/images/title-dark.png" alt="Green Haven" class="gh-brand-title-img gh-title-dark footer-title-img">';

let count = 0;
files.forEach(f => {
  const filePath = path.join(rootDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(target)) {
    content = content.replaceAll(target, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
    console.log(`Updated footer brand in ${f}`);
  }
});

console.log(`Replaced text title with navbar title image in ${count} files.`);
