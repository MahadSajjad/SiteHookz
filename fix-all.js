const fs = require('fs');
function fix(file, replaces) {
  let c = fs.readFileSync(file, 'utf8');
  replaces.forEach(r => c = c.replace(r[0], r[1]));
  fs.writeFileSync(file, c);
}

fix('apps/api/src/products/education/staff/staff.controller.ts', [
  [/, Patch/g, ''],
  [/Patch, /g, '']
]);

fix('apps/api/src/products/education/subjects/subjects.controller.ts', [
  [/, UseGuards/g, ''],
  [/UseGuards, /g, '']
]);

fix('apps/api/src/products/education/courses/courses.service.ts', [
  [/, BadRequestException/g, ''],
  [/BadRequestException, /g, ''],
  [/query: any, /g, '']
]);

fix('apps/api/src/products/education/sections/sections.service.ts', [
  [/query: any, /g, '']
]);

fix('apps/api/src/products/education/staff/staff.service.ts', [
  [/, NotFoundException/g, ''],
  [/NotFoundException, /g, ''],
  [/query: any, /g, '']
]);
