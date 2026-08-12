const fs = require('fs');
const path = require('path');

const jsDir = 'app/js';
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
const html = fs.readFileSync('app/index.html', 'utf8');

// Collect every JS file's content with per-file tracking
const fileContents = files.map(f => ({ name: f, src: fs.readFileSync(path.join(jsDir, f), 'utf8') }));

// All ID literals referenced anywhere in JS (string literals or .id = assignments or id=" in templates)
const idOccurrences = {}; // id -> [{file, line, kind}]
files.forEach(f => {
  const src = fs.readFileSync(path.join(jsDir, f), 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    // getElementById('x')
    let re = /getElementById\(\s*['"]([^'"]+)['"]\s*\)/g;
    let m;
    while ((m = re.exec(line))) {
      (idOccurrences[m[1]] = idOccurrences[m[1]] || []).push({ file: f, line: i + 1, kind: 'rev' });
    }
    // .id = 'x'   or   .id='x'
    re = /\.id\s*=\s*['"]([^'"]+)['"]/g;
    while ((m = re.exec(line))) {
      (idOccurrences[m[1]] = idOccurrences[m[1]] || []).push({ file: f, line: i + 1, kind: 'assign' });
    }
    // id="x" inside template strings (dynamic HTML)
    re = /id=\s*["`]([^"`]+)["`]/g;
    while ((m = re.exec(line))) {
      (idOccurrences[m[1]] = idOccurrences[m[1]] || []).push({ file: f, line: i + 1, kind: 'tplid' });
    }
  });
});

// Static IDs in HTML
const htmlIds = new Set();
let re = /\bid="([^"]+)"/g, m;
while ((m = re.exec(html))) htmlIds.add(m[1]);

// getElementById refs that have NO creator (no assign, no tplid, not in html)
const dead = [];
for (const [id, occ] of Object.entries(idOccurrences)) {
  const hasCreator = occ.some(o => o.kind === 'assign' || o.kind === 'tplid') || htmlIds.has(id);
  // Only report ids that are queried
  const isQueried = occ.some(o => o.kind === 'rev');
  if (isQueried && !hasCreator) {
    dead.push({ id, refs: occ.filter(o => o.kind === 'rev') });
  }
}

console.log('=== TRULY DEAD getElementById refs (no creator anywhere) ===');
dead.forEach(d => {
  const loc = d.refs.map(r => `${r.file}:${r.line}`).join(', ');
  console.log(`${d.id}  ->  ${loc}`);
});
console.log('\nTotal truly dead IDs:', dead.length);
console.log('\n=== Sanity: ids appearing only in their own JS file (single-file refs) ===');
Object.entries(idOccurrences).forEach(([id, occ]) => {
  const filesWith = new Set(occ.map(o => o.file));
  if (filesWith.size === 1 && occ.every(o => o.kind === 'rev') && !htmlIds.has(id)) {
    console.log(`${id}  ->  ${occ.map(o => `${o.file}:${o.line}`).join(', ')}`);
  }
});