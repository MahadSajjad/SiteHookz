const fs = require('fs');
let file = 'products/education/src/contracts/teaching-assignments/assign-teacher.dto.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/staffMemberId: z\.string\(\)\.uuid\(\),/, 'staffMemberId: z.string().uuid(),\n  subjectOfferingId: z.string().uuid(),');
fs.writeFileSync(file, code);
