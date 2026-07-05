const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'public', 'js', 'app.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix all the escape issues from the bad script
// Replace \` with ` (backslash backtick -> backtick)
content = content.replace(/\\`/g, '`');
// Replace \\${ with ${ (escaped dollar-brace -> actual)
content = content.replace(/\\\$/g, '$');
// Replace \\' with ' (escaped single quote in strings)
content = content.replace(/\\'/g, "'");

// Do multiple passes to handle nested cases
let changed;
do {
  changed = false;
  const newContent = content.replace(/\\`/g, '`');
  if (newContent !== content) { content = newContent; changed = true; }
} while (changed);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed escapes!');
