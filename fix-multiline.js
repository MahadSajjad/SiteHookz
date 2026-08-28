const fs = require('fs');
const files = [
  'apps/education-web/src/pages/academics/batches/BatchDetailPage.tsx',
  'apps/education-web/src/pages/academics/sections/SectionDetailPage.tsx',
  'apps/education-web/src/pages/academics/subjects/SubjectsPage.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/!\s*subjectsData\?\.items\s*\|\|/g, '!subjectsData ||');
  code = code.replace(/subjectsData\.items\.length/g, 'subjectsData.length');
  code = code.replace(/!\s*data\?\.items\s*\|\|/g, '!data ||');
  code = code.replace(/data\.items\.length/g, 'data.length');
  fs.writeFileSync(file, code);
}
