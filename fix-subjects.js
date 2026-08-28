const fs = require('fs');
let code = fs.readFileSync('apps/education-web/src/pages/academics/subjects/SubjectsPage.tsx', 'utf8');
code = code.replace('import React from "react";\n', '');
code = code.replace('@sitehookz/ui/src/components/CustomButton', '@sitehookz/ui');
code = code.replace('api.subjects.list()', 'api.subjects.getAll()');
code = code.replace(/data\?\.items\?\.map/g, 'data?.map');
code = code.replace(/!\data\?\.items \|\| data\.items\.length/g, '!data || data.length');
fs.writeFileSync('apps/education-web/src/pages/academics/subjects/SubjectsPage.tsx', code);
