const fs = require('fs');
let pg = fs.readFileSync('apps/api/src/platform/authorization/permission.guard.ts', 'utf8');

const regex = /const branchId = request.headers\['x-sitehookz-branch'\] \|\| request.params\?\.branchId \|\| request\.body\?\.branchId;[\s\S]*?if \(!this.authorizationService.hasPermission\(tenantContext, requiredPermission, branchId\)\) {/g;

pg = pg.replace(regex, `// Branch-scoped authorization must happen explicitly in the Service Layer.
    // At the guard level, we strictly require the user to hold the permission at the ORGANIZATION scope.
    if (!this.authorizationService.hasPermission(tenantContext, requiredPermission)) {`);

fs.writeFileSync('apps/api/src/platform/authorization/permission.guard.ts', pg, 'utf8');
