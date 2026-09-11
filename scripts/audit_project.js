const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

console.log('Found ' + htmlFiles.length + ' HTML files.');

const issues = {
  missingTitle: [],
  missingMetaDesc: [],
  missingViewport: [],
  missingFavicon: [],
  imgMissingAlt: [],
  brokenLocalAssets: [],
  emptyHref: [],
  rawInlineEvents: []
};

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Title
  if (!/<title>[\s\S]*?<\/title>/i.test(content)) {
    issues.missingTitle.push(file);
  }

  // Meta description
  if (!/<meta\s+[^>]*name=["']description["']/i.test(content)) {
    issues.missingMetaDesc.push(file);
  }

  // Viewport
  if (!/<meta\s+[^>]*name=["']viewport["']/i.test(content)) {
    issues.missingViewport.push(file);
  }

  // Favicon
  if (!/<link\s+[^>]*rel=["'](?:shortcut\s+)?icon["']/i.test(content)) {
    issues.missingFavicon.push(file);
  }

  // Images missing alt
  const imgRegex = /<img\b([^>]*?)>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const attrs = match[1];
    if (!/\balt\s*=/i.test(attrs)) {
      issues.imgMissingAlt.push({ file, snippet: match[0].slice(0, 70) });
    }
  }

  // Check local assets (src, href)
  const assetRegex = /\b(?:src|href)=["']([^"'#?]+)/gi;
  while ((match = assetRegex.exec(content)) !== null) {
    const target = match[1].trim();
    if (
      !target ||
      target.startsWith('http:') ||
      target.startsWith('https:') ||
      target.startsWith('//') ||
      target.startsWith('mailto:') ||
      target.startsWith('tel:') ||
      target.startsWith('javascript:') ||
      target.startsWith('data:')
    ) {
      continue;
    }
    const resolved = path.resolve(rootDir, target);
    if (!fs.existsSync(resolved)) {
      issues.brokenLocalAssets.push({ file, asset: target });
    }
  }

  // Check empty or '#' hrefs that might be dead buttons
  const emptyHrefRegex = /<a\b([^>]*?href=["'](#|javascript:void\(0\);?|)["'][^>]*?)>/gi;
  let deadLinkCount = 0;
  while ((match = emptyHrefRegex.exec(content)) !== null) {
    const tag = match[1];
    if (
      !tag.includes('data-bs-toggle') &&
      !tag.includes('data-bs-target') &&
      !tag.includes('role="button"') &&
      !tag.includes('aria-controls') &&
      !tag.includes('onclick')
    ) {
      deadLinkCount++;
    }
  }
  if (deadLinkCount > 0) {
    issues.emptyHref.push({ file, count: deadLinkCount });
  }

  const inlineEventRegex = /\s(onclick|onload|onerror|onsubmit)=["'][^"']+["']/gi;
  const inlineEvents = [];
  while ((match = inlineEventRegex.exec(content)) !== null) {
    inlineEvents.push(match[1]);
  }
  if (inlineEvents.length > 0) {
    issues.rawInlineEvents.push({ file, events: inlineEvents.length });
  }
});

console.log('--- AUDIT REPORT SUMMARY ---');
console.log('Missing Title:', issues.missingTitle);
console.log('Missing Meta Description (' + issues.missingMetaDesc.length + '):', issues.missingMetaDesc);
console.log('Missing Viewport:', issues.missingViewport);
console.log('Missing Favicon (' + issues.missingFavicon.length + '):', issues.missingFavicon);
console.log('Images Missing Alt:', issues.imgMissingAlt.length);
if (issues.imgMissingAlt.length > 0) {
  console.log('Sample images missing alt:', issues.imgMissingAlt.slice(0, 10));
}
console.log('Broken Local Assets/Links (' + issues.brokenLocalAssets.length + '):');
if (issues.brokenLocalAssets.length > 0) {
  console.log('Broken assets:', JSON.stringify(issues.brokenLocalAssets, null, 2));
}
console.log('Empty Hrefs (potential dead links):', issues.emptyHref);
