const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/findAll\(tenant, query\)/g, 'findAll(tenant)');
  fs.writeFileSync(file, c);
}

fix('apps/api/src/products/education/sections/sections.controller.ts');
fix('apps/api/src/products/education/staff/staff.controller.ts');
