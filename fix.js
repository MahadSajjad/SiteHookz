const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('./apps/api/src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  if (content.includes('this.prisma.\\(')) {
    content = content.split('this.prisma.\\(').join('this.prisma.transaction(');
    changed = true;
  }
  if (content.includes('this.prisma.\\[')) {
    content = content.split('this.prisma.\\[').join('this.prisma.transaction([');
    changed = true;
  }
  // also fix roles.service.ts
  if (content.includes('\\Cannot assign permission \\ as you do not possess it at the organization scope\\')) {
    content = content.split('\\Cannot assign permission \\ as you do not possess it at the organization scope\\').join('\Cannot assign permission {requestedPerm} as you do not possess it at the organization scope\');
    changed = true;
  }
  // also check if any \ remains
  if (content.includes('\\')) {
    content = content.split('\\').join('transaction');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(f, content, 'utf8');
  }
});
