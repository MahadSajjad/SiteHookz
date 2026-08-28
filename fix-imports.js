const fs = require('fs');

const f1 = 'apps/api/src/platform/roles/dto/create-role.dto.ts';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/'@prisma\/client'/g, "'@sitehookz/database'");
fs.writeFileSync(f1, c1);

const f2 = 'apps/api/src/platform/tenancy/tenant.guard.ts';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/'@prisma\/client'/g, "'@sitehookz/database'");
fs.writeFileSync(f2, c2);
