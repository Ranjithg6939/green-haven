const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const regex = /<a\b[^>]*?href=["'](#|javascript:void\(0\);?|)["'][^>]*?>[\s\S]*?<\/a>/gi;
let match;
while ((match = regex.exec(content)) !== null) {
  const tag = match[0];
  if (!tag.includes('data-bs-toggle') && !tag.includes('data-bs-target') && !tag.includes('role="button"')) {
    console.log('--- Empty href found:');
    console.log(tag.slice(0, 150));
  }
}
