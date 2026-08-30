const fs = require('fs');
let file = 'apps/api/src/products/education/subject-offerings/subject-offerings.repository.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/await tx\.\$queryRaw`SELECT id FROM "Section" WHERE id = \$\{data\.sectionId\}::uuid FOR UPDATE`;/g, 'await tx.$queryRaw`SELECT id FROM "Section" WHERE id = ${data.sectionId}::uuid AND "organizationId" = ${tenant.organizationId}::uuid FOR UPDATE`;');
code = code.replace(/await tx\.\$queryRaw`SELECT id FROM "Batch" WHERE id = \$\{data\.batchId\}::uuid FOR UPDATE`;/g, 'await tx.$queryRaw`SELECT id FROM "Batch" WHERE id = ${data.batchId}::uuid AND "organizationId" = ${tenant.organizationId}::uuid FOR UPDATE`;');
fs.writeFileSync(file, code);
