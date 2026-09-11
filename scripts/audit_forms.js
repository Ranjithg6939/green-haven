const fs = require('fs');
const path = require('path');
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const formsSummary = [];
htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const formRegex = /<form\b([^>]*?)>([\s\S]*?)<\/form>/gi;
  let match;
  while ((match = formRegex.exec(content)) !== null) {
    const formTag = match[1];
    const formBody = match[2];
    const idMatch = formTag.match(/id=["']([^"']+)["']/i);
    const id = idMatch ? idMatch[1] : '(no id)';
    const inputs = (formBody.match(/<input\b[^>]*>/gi) || []).length;
    const buttons = (formBody.match(/<button\b[^>]*type=["']submit["'][^>]*>|<input\b[^>]*type=["']submit["'][^>]*>/gi) || []).length;
    formsSummary.push({ file, formId: id, inputs, submitButtons: buttons });
  }
});
console.log('Total forms found:', formsSummary.length);
console.log(JSON.stringify(formsSummary, null, 2));
