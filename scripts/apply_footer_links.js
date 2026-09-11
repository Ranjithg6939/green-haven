const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

let updatedCount = 0;
const targetOld1 = `<a href="#" class="text-white-50 text-decoration-none hover-white">Privacy Policy</a>`;
const targetNew1 = `<a href="#privacyPolicy" class="text-white-50 text-decoration-none hover-white gh-legal-link" data-legal="privacy" role="button">Privacy Policy</a>`;

const targetOld2 = `<a href="#" class="text-white-50 text-decoration-none hover-white">Terms &amp; Conditions</a>`;
const targetNew2 = `<a href="#termsConditions" class="text-white-50 text-decoration-none hover-white gh-legal-link" data-legal="terms" role="button">Terms &amp; Conditions</a>`;

const targetOld3 = `<a href="#" class="text-white-50 text-decoration-none hover-white">Terms & Conditions</a>`;

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes(targetOld1)) {
    content = content.replaceAll(targetOld1, targetNew1);
    changed = true;
  }
  if (content.includes(targetOld2)) {
    content = content.replaceAll(targetOld2, targetNew2);
    changed = true;
  }
  if (content.includes(targetOld3)) {
    content = content.replaceAll(targetOld3, targetNew2);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log('Updated footer legal links in:', file);
  }
});

console.log(`Total files updated: ${updatedCount}`);
