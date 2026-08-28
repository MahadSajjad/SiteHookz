const fs = require('fs');
let file = 'apps/education-web/src/pages/people/staff/StaffDetailPage.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/getByStaffMemberId\(id as string\(/g, 'getByStaffMemberId(id as string)');
code = code.replace(/getByStaffMemberId\(id as string\{ staffMemberId: id \}\)/g, 'getByStaffMemberId(id as string)');
fs.writeFileSync(file, code);
