const fs = require('fs');
const code = fs.readFileSync('js/app.js', 'utf8');
const lines = code.split('\n');
let p = 0, b = 0;
let minP = 0, minPline = 0;

// Scan each line tracking parens in and out of strings
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let inStr = false, strChar = '';
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    const prev = j > 0 ? line[j-1] : '';

    // Toggle string state (simplistic but sufficient)
    if ((ch === '"' || ch === "'") && prev !== '\\') {
      if (!inStr) { inStr = true; strChar = ch; }
      else if (ch === strChar) { inStr = false; }
    }

    if (!inStr) {
      if (ch === '(') p++;
      if (ch === ')') p--;
    }
  }

  if (p < minP) {
    minP = p;
    minPline = i + 1;
  }
}

console.log('Min paren value:', minP, 'at line', minPline);
console.log('Final paren:', p);
