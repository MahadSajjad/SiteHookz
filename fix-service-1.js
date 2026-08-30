const fs = require('fs');
let file = 'apps/api/src/products/education/teaching-assignments/teaching-assignments.service.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/P\.EDUCATION\.TEACHING_ASSIGNMENTS\.UPDATE/g, 'P.EDUCATION.TEACHING_ASSIGNMENTS.END');
fs.writeFileSync(file, code);
