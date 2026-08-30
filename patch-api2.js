const fs = require('fs');

let sar = fs.readFileSync('apps/api/src/products/education/attendance/student-attendance.repository.ts', 'utf8');
sar = sar.replace(/\/\* markedAt: new Date\(\) \*\//g, '');
sar = sar.replace(/markedAt: new Date\(\),?/g, '');
fs.writeFileSync('apps/api/src/products/education/attendance/student-attendance.repository.ts', sar);

let tc = fs.readFileSync('apps/api/src/products/education/timetables/timetables.controller.ts', 'utf8');
// Fix all Tenant() or TenantContextDecor()
tc = tc.replace(/@TenantContextDecor\(\)/g, '@Tenant()');
tc = tc.replace(/TenantContextDecor/g, 'Tenant');
tc = tc.replace(/import \{ Tenant as Tenant \} from/g, 'import { Tenant } from');
if (!tc.includes('import { Tenant } from')) {
    tc = tc.replace(/import \{ TenantContext \} from "\.\.\/\.\.\/\.\.\/infrastructure\/tenant\/tenant-context\.decorator";/, 'import { Tenant } from "../../../infrastructure/tenant/tenant-context.decorator";');
}
fs.writeFileSync('apps/api/src/products/education/timetables/timetables.controller.ts', tc);

let ts = fs.readFileSync('apps/api/src/products/education/timetables/timetables.spec.ts', 'utf8');
ts = ts.replace(/\{ organizationId: "org-1", membershipId: "mem-1" \}/g, '({ organizationId: "org-1", membershipId: "mem-1" } as any)');
fs.writeFileSync('apps/api/src/products/education/timetables/timetables.spec.ts', ts);

