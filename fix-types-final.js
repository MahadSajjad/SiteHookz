const fs = require('fs');

const fixPrecedence = (path) => {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(/!accessibleBranches === 'ALL'/g, "accessibleBranches !== 'ALL'");
  code = code.replace(/!accessibleBranchIds === 'ALL'/g, "accessibleBranchIds !== 'ALL'");
  code = code.replace(/!targetBranches === 'ALL'/g, "targetBranches !== 'ALL'");
  fs.writeFileSync(path, code, 'utf8');
};

fixPrecedence('apps/api/src/products/education/students/students.service.ts');
fixPrecedence('apps/api/src/products/education/guardians/guardians.service.ts');

const fixInstitutionType = (path) => {
  let code = fs.readFileSync(path, 'utf8');
  // Just cast the whole tenant to any to access institutionType safely regardless of formatting
  code = code.replace(/tenant\[[\s\n]*['"]institutionType['"] as any[\s\n]*\]/g, '(tenant as any).institutionType');
  fs.writeFileSync(path, code, 'utf8');
};

fixInstitutionType('apps/api/src/products/education/enrollments/enrollments.service.ts');
fixInstitutionType('apps/api/src/products/education/class-levels/class-levels.service.ts');
fixInstitutionType('apps/api/src/products/education/sections/sections.service.ts');

console.log("Fixed typecheck issues");
