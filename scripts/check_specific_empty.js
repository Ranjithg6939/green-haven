const fs = require('fs');

['blog.html', 'reservation.html', 'water-particle-demo.html'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /<a\b[^>]*?href=["'](#|javascript:void\(0\);?|)["'][^>]*?>[\s\S]*?<\/a>/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const tag = match[0];
    if (!tag.includes('data-bs-toggle') && !tag.includes('data-bs-target') && !tag.includes('role="button"')) {
      console.log(`[${file}] Empty href:`, tag.slice(0, 160).replace(/\s+/g, ' '));
    }
  }
});
