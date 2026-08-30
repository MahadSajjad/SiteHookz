const fs = require('fs');

function removeUnused(file, regexList) {
  let code = fs.readFileSync(file, 'utf8');
  regexList.forEach(r => {
    code = code.replace(r.search, r.replace);
  });
  fs.writeFileSync(file, code);
}

// 1. sections.service.ts
removeUnused('apps/api/src/products/education/sections/sections.service.ts', [
  { search: /query: any, /g, replace: '' },
  { search: /query: any/g, replace: '' }
]);

// 2. staff.dto.ts
removeUnused('apps/api/src/products/education/staff/dto/staff.dto.ts', [
  { search: /EmploymentStatus, /g, replace: '' },
  { search: /, EmploymentStatus/g, replace: '' },
  { search: /import \{ EmploymentStatus \} from "@prisma\/client";\n/g, replace: '' }
]);

// 3. staff.controller.ts
removeUnused('apps/api/src/products/education/staff/staff.controller.ts', [
  { search: /Patch, /g, replace: '' },
  { search: /, Patch/g, replace: '' }
]);

// 4. staff.service.ts
removeUnused('apps/api/src/products/education/staff/staff.service.ts', [
  { search: /NotFoundException, /g, replace: '' },
  { search: /, NotFoundException/g, replace: '' },
  { search: /query: any, /g, replace: '' },
  { search: /query: any/g, replace: '' }
]);

// 5. subjects.controller.ts
removeUnused('apps/api/src/products/education/subjects/subjects.controller.ts', [
  { search: /UseGuards, /g, replace: '' },
  { search: /, UseGuards/g, replace: '' },
  { search: /import \{ UseGuards \} from "@nestjs\/common";\n/g, replace: '' }
]);

