const fs = require('fs');
let file = 'apps/education-web/src/pages/academics/subjects/SubjectsPage.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/<th className="p-4 font-semibold text-sm text-gray-600">\s*Credits\s*<\/th>/g, '');
code = code.replace(/<td className="p-4 text-sm">\{subject\.credits\}<\/td>/g, '');
fs.writeFileSync(file, code);
