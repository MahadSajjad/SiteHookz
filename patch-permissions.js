const fs = require('fs');

let c = fs.readFileSync('products/education/src/permissions/education-permissions-registry.ts', 'utf8');

const newPerms = `
  { key: "education.timetables.read", description: "Read timetables", category: "Education" },
  { key: "education.timetables.create", description: "Create timetables", category: "Education" },
  { key: "education.timetables.update", description: "Update timetables", category: "Education" },
  { key: "education.timetables.publish", description: "Publish timetables", category: "Education" },
  { key: "education.timetables.archive", description: "Archive timetables", category: "Education" },
];`;

c = c.replace(/\];$/, newPerms);

fs.writeFileSync('products/education/src/permissions/education-permissions-registry.ts', c);

let rt = fs.readFileSync('products/education/src/role-templates/education-role-templates.ts', 'utf8');
rt = rt.replace(/EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS,\n} from "\.\.\/permissions\/education-permissions";/, `EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS,\n  EDUCATION_TIMETABLES_PERMISSIONS,\n} from "../permissions/education-permissions";`);

// Add to Principal: all timetable perms
rt = rt.replace(/(P\.ARCHIVE,\n\s+EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS\.READ,)/g, `EDUCATION_TIMETABLES_PERMISSIONS.READ,
      EDUCATION_TIMETABLES_PERMISSIONS.CREATE,
      EDUCATION_TIMETABLES_PERMISSIONS.UPDATE,
      EDUCATION_TIMETABLES_PERMISSIONS.PUBLISH,
      EDUCATION_TIMETABLES_PERMISSIONS.ARCHIVE,
      $1`);

// Add to Academic Coordinator
rt = rt.replace(/(P\.UPDATE,\n\s+EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS\.READ,)/g, `EDUCATION_TIMETABLES_PERMISSIONS.READ,
      EDUCATION_TIMETABLES_PERMISSIONS.CREATE,
      EDUCATION_TIMETABLES_PERMISSIONS.UPDATE,
      EDUCATION_TIMETABLES_PERMISSIONS.PUBLISH,
      EDUCATION_TIMETABLES_PERMISSIONS.ARCHIVE,
      $1`);

// Add to Instructor
rt = rt.replace(/(EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS\.FINALIZE,)/g, `$1
      EDUCATION_TIMETABLES_PERMISSIONS.READ,`);

fs.writeFileSync('products/education/src/role-templates/education-role-templates.ts', rt);

let ep = fs.readFileSync('products/education/src/permissions/education-permissions.ts', 'utf8');
ep = ep.replace(/export const EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS = {[\s\S]*?} as const;/, `export const EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS = {
  READ: "education.student_attendance.read",
  MARK: "education.student_attendance.mark",
} as const;

export const EDUCATION_TIMETABLES_PERMISSIONS = {
  READ: "education.timetables.read",
  CREATE: "education.timetables.create",
  UPDATE: "education.timetables.update",
  PUBLISH: "education.timetables.publish",
  ARCHIVE: "education.timetables.archive",
} as const;`);

fs.writeFileSync('products/education/src/permissions/education-permissions.ts', ep);
