const fs = require('fs');

function fix(file) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/this\.sectionsService\.findAll\(req\.tenant\.organizationId, query\)/g, 'this.sectionsService.findAll(req.tenant.organizationId)');
  c = c.replace(/this\.staffService\.findAll\(req\.tenant\.organizationId, query\)/g, 'this.staffService.findAll(req.tenant.organizationId)');
  fs.writeFileSync(file, c);
}

fix('apps/api/src/products/education/sections/sections.controller.ts');
fix('apps/api/src/products/education/staff/staff.controller.ts');
