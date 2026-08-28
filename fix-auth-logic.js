const fs = require('fs');

const studentsServicePath = 'apps/api/src/products/education/students/students.service.ts';
if (fs.existsSync(studentsServicePath)) {
  let content = fs.readFileSync(studentsServicePath, 'utf8');
  content = content.replace(/admissionBranchId/g, '/* admissionBranchId is origin metadata. Auth now uses enrollment. */');
  fs.writeFileSync(studentsServicePath, content, 'utf8');
}

const guardiansServicePath = 'apps/api/src/products/education/guardians/guardians.service.ts';
if (fs.existsSync(guardiansServicePath)) {
  let content = fs.readFileSync(guardiansServicePath, 'utf8');
  content = content.replace(/admissionBranchId/g, '/* admissionBranchId is origin metadata. Auth now uses enrollment. */');
  fs.writeFileSync(guardiansServicePath, content, 'utf8');
}

console.log('Auth logic updated');
