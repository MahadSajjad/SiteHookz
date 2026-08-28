const fs = require('fs');
let file = 'apps/education-web/src/pages/people/staff/StaffDetailPage.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/!\s*assignmentsData\?\.items\s*\|\|/g, '!assignmentsData ||');
code = code.replace(/assignmentsData\.items\.length/g, 'assignmentsData.length');
fs.writeFileSync(file, code);
