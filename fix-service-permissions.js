const fs = require('fs');
let file = 'apps/api/src/products/education/teaching-assignments/teaching-assignments.service.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/P\.EDUCATION\.TEACHING_ASSIGNMENTS\.END/g, 'P.EDUCATION.TEACHING_ASSIGNMENTS.UPDATE');
fs.writeFileSync(file, code);

let repoFile = 'apps/api/src/products/education/teaching-assignments/teaching-assignments.repository.ts';
let repoCode = fs.readFileSync(repoFile, 'utf8');
repoCode = repoCode.replace(/new Date\(data\.startDate\)/g, 'data.startDate ? new Date(data.startDate) : new Date()');
repoCode = repoCode.replace(/new Date\(data\.endDate\)/g, 'data.endDate ? new Date(data.endDate) : new Date()');
fs.writeFileSync(repoFile, repoCode);

let testFile = 'apps/api/src/products/education/subjects/subjects.service.spec.ts';
let testCode = fs.readFileSync(testFile, 'utf8');
testCode = testCode.replace(/const tenant = \{ organizationId: "org-1", userId: "u-1" \};/g, 'const tenant: any = { organizationId: "org-1", userId: "u-1" };');
fs.writeFileSync(testFile, testCode);

let testFile2 = 'apps/api/src/products/education/subject-offerings/subject-offerings.service.spec.ts';
let testCode2 = fs.readFileSync(testFile2, 'utf8');
testCode2 = testCode2.replace(/const tenant = \{ organizationId: "org-1", userId: "u-1" \};/g, 'const tenant: any = { organizationId: "org-1", userId: "u-1" };');
fs.writeFileSync(testFile2, testCode2);
