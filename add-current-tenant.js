const fs = require('fs');

let guard = fs.readFileSync('apps/api/src/platform/tenancy/tenant.guard.ts', 'utf8');
guard = `import { createParamDecorator } from '@nestjs/common';\n` + guard;
guard += `\nexport const CurrentTenant = createParamDecorator(\n  (data: unknown, ctx: ExecutionContext) => {\n    const request = ctx.switchToHttp().getRequest();\n    return request.tenantContext as TenantContext;\n  },\n);\n`;

fs.writeFileSync('apps/api/src/platform/tenancy/tenant.guard.ts', guard, 'utf8');

// And I also need to fix controllers to import RequirePermission from permission.guard.ts instead of require-permission.decorator.ts

for (const ctrl of ['staff/staff.controller.ts', 'guardians/guardians.controller.ts', 'students/students.controller.ts']) {
  let file = fs.readFileSync('apps/api/src/products/education/' + ctrl, 'utf8');
  file = file.replace(/require-permission\.decorator/g, 'permission.guard');
  fs.writeFileSync('apps/api/src/products/education/' + ctrl, file, 'utf8');
}
