const fs = require('fs');

// 1 & 2: Fix Attendance
let sar = fs.readFileSync('apps/api/src/products/education/attendance/student-attendance.repository.ts', 'utf8');
sar = sar.replace(/markedAt: new Date\(\)/g, '/* markedAt: new Date() */');
fs.writeFileSync('apps/api/src/products/education/attendance/student-attendance.repository.ts', sar);

let asr = fs.readFileSync('apps/api/src/products/education/attendance/attendance-sessions.repository.ts', 'utf8');
asr = asr.replace(/as AttendanceMode/g, 'as any');
fs.writeFileSync('apps/api/src/products/education/attendance/attendance-sessions.repository.ts', asr);

// 3. Fix timetables controller Tenant import
let tc = fs.readFileSync('apps/api/src/products/education/timetables/timetables.controller.ts', 'utf8');
tc = tc.replace(/@Tenant\(\)/g, '@TenantContextDecor()');
tc = tc.replace(/import \{.*?\} from "@sitehookz\/platform-contracts";/, 'import { TenantContext } from "@sitehookz/platform-contracts";');
tc = tc.replace(/import \{ TenantContext \}/, 'import { TenantContext as TenantContextDecor } from "../../../infrastructure/tenant/tenant-context.decorator";\nimport { TenantContext }');
tc = tc.replace(/@TenantContextDecor\(\) tenant: TenantContext/g, '@TenantContextDecor() tenant: TenantContext'); // ensure
fs.writeFileSync('apps/api/src/products/education/timetables/timetables.controller.ts', tc);

// 4. Fix timetables module
let tm = fs.readFileSync('apps/api/src/products/education/timetables/timetables.module.ts', 'utf8');
tm = tm.replace(/from '..\/..\/..\/infrastructure\/database\/prisma.module'/, 'from "../../../infrastructure/database/prisma.module"'); // check if it exists
if (!fs.existsSync('apps/api/src/infrastructure/database/prisma.module.ts')) {
  tm = tm.replace(/import \{ PrismaModule \} from "[^"]+";/, '');
  tm = tm.replace(/PrismaModule,?\s*/, '');
}
fs.writeFileSync('apps/api/src/products/education/timetables/timetables.module.ts', tm);

// 5. Fix timetables spec
let ts = fs.readFileSync('apps/api/src/products/education/timetables/timetables.spec.ts', 'utf8');
ts = ts.replace(/\{ organizationId: 'org-1', membershipId: 'mem-1' \}/g, '{ organizationId: "org-1", membershipId: "mem-1" } as any');
ts = ts.replace(/\{ organizationId: "org-1", membershipId: "mem-1" \}/g, '{ organizationId: "org-1", membershipId: "mem-1" } as any');
fs.writeFileSync('apps/api/src/products/education/timetables/timetables.spec.ts', ts);

