const fs = require('fs');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if(file.endsWith('.js')) results.push(file);
    }
  });
  return results;
}
const files = walk('c:/Users/steve/Documents/izaeltec-react-main/src/app');
let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Match `if (!res.ok) throw new Error(\`HTTP \${res.status}\`);`
  const target = /if\s*\(!res\.ok\)\s*throw\s*new\s*Error\(`HTTP \$\{res\.status\}`\);/g;
  const replacement = 'if (!res.ok) { const errData = await res.json().catch(() => null); throw new Error(errData?.erro || errData?.message || `HTTP ${res.status}`); }';
  if(content.match(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
    count++;
  }
});
console.log('Total files updated:', count);
