const fs = require('fs');
let file = 'apps/education-web/src/pages/people/staff/StaffDetailPage.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/api\.teachingAssignments\.getByStaffMemberId\(id as string, \{ staffId: id \}\)/g, 'api.teachingAssignments.getByStaffMemberId(id as string)');
fs.writeFileSync(file, code);
