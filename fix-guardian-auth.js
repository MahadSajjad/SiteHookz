const fs = require('fs');
const path = 'apps/api/src/products/education/guardians/guardians.service.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  `const where: any = { organizationId: tenant.organizationId, archivedAt: null };`,
  `const where: any = { organizationId: tenant.organizationId, archivedAt: null };\n    if (query.branchId) {\n      where.studentGuardians = {\n        some: {\n          student: {\n            enrollments: {\n              some: {\n                status: 'ACTIVE',\n                branchId: query.branchId\n              }\n            }\n          }\n        }\n      };\n    }`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Guardians auth updated');
