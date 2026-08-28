const fs = require('fs');

// Fix students
let path = 'apps/api/src/products/education/students/students.service.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(/accessibleBranches\.includes\('\*'\)/g, `accessibleBranches === 'ALL'`);
code = code.replace(/accessibleBranchIds\.includes\('\*'\)/g, `accessibleBranchIds === 'ALL'`);
// Prisma typescript complains about passing "ALL" into { in: ... }.
// accessibleBranches is string[] | "ALL". So if it's not "ALL", we must cast it to string[].
code = code.replace(/branchId: \{ in: accessibleBranches \}/g, `branchId: { in: accessibleBranches as string[] }`);
code = code.replace(/branchId: \{ in: accessibleBranchIds \}/g, `branchId: { in: accessibleBranchIds as string[] }`);
fs.writeFileSync(path, code, 'utf8');

// Fix guardians
path = 'apps/api/src/products/education/guardians/guardians.service.ts';
code = fs.readFileSync(path, 'utf8');
code = code.replace(/accessibleBranches\.includes\('\*'\)/g, `accessibleBranches === 'ALL'`);
code = code.replace(/targetBranches\.includes\('\*'\)/g, `targetBranches === 'ALL'`);
code = code.replace(/branchId: \{ in: targetBranches \}/g, `branchId: { in: targetBranches as string[] }`);
code = code.replace(/branchId: \{ in: accessibleBranches \}/g, `branchId: { in: accessibleBranches as string[] }`);
fs.writeFileSync(path, code, 'utf8');

// Fix enrollments (tenant context indexing)
path = 'apps/api/src/products/education/enrollments/enrollments.service.ts';
code = fs.readFileSync(path, 'utf8');
code = code.replace(/tenant\['institutionType' as any\]/g, `(tenant.organization as any).institutionType`);
fs.writeFileSync(path, code, 'utf8');

// Fix class levels
path = 'apps/api/src/products/education/class-levels/class-levels.service.ts';
code = fs.readFileSync(path, 'utf8');
code = code.replace(/tenant\['institutionType' as any\]/g, `(tenant.organization as any).institutionType`);
fs.writeFileSync(path, code, 'utf8');

// Fix sections
path = 'apps/api/src/products/education/sections/sections.service.ts';
code = fs.readFileSync(path, 'utf8');
code = code.replace(/tenant\['institutionType' as any\]/g, `(tenant.organization as any).institutionType`);
fs.writeFileSync(path, code, 'utf8');

console.log("Types fixed");
