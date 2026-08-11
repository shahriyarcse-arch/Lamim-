const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  count++;
  const code = match[1];
  try {
    new Function(code);
  } catch (err) {
    console.error(`Script block ${count} Error:`, err.message);
    errors++;
  }
}

console.log(`Audited ${count} inline script blocks in index.html. Syntax Errors found: ${errors}`);
