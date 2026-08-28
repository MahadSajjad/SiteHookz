const fs = require('fs');
let tr = fs.readFileSync('apps/api/src/platform/tenancy/tenant-resolver.service.ts', 'utf8');
tr = tr.replace(/Promise<any>/, "Promise<import('@sitehookz/database').Organization>");
fs.writeFileSync('apps/api/src/platform/tenancy/tenant-resolver.service.ts', tr, 'utf8');
