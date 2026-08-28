const fs = require('fs');
const file = 'products/education/src/role-templates/education-role-templates.ts';
let code = fs.readFileSync(file, 'utf8');

// Add new imports
if (!code.includes('EDUCATION_SUBJECTS_PERMISSIONS')) {
  code = code.replace(
    'import { P } from "@sitehookz/platform-permissions";',
    'import { P } from "@sitehookz/platform-permissions";\nimport { EDUCATION_SUBJECTS_PERMISSIONS, EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS, EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS } from "../permissions/education-permissions";'
  );
}

// Principal
code = code.replace(
  'name: "Principal",\n    key: "principal",\n    scopeType: "BRANCH",\n    isEditable: true,\n    isDeletable: true,\n    permissions: [\n      P.PLATFORM.BRANCHES.READ,\n      P.PLATFORM.BRANCHES.UPDATE,\n      P.PLATFORM.MEMBERSHIPS.READ,\n      P.EDUCATION.ACADEMIC_SESSIONS.READ,\n    ],',
  `name: "Principal",
    key: "principal",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: true,
    permissions: [
      P.PLATFORM.BRANCHES.READ,
      P.PLATFORM.BRANCHES.UPDATE,
      P.PLATFORM.MEMBERSHIPS.READ,
      P.EDUCATION.ACADEMIC_SESSIONS.READ,
      ...Object.values(EDUCATION_SUBJECTS_PERMISSIONS),
      ...Object.values(EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS),
      ...Object.values(EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS),
    ],`
);

// Academic Coordinator
code = code.replace(
  'name: "Academic Coordinator",\n    key: "academic_coordinator",\n    scopeType: "BRANCH",\n    isEditable: true,\n    isDeletable: true,\n    permissions: [P.PLATFORM.BRANCHES.READ, P.EDUCATION.ACADEMIC_SESSIONS.READ],',
  `name: "Academic Coordinator",
    key: "academic_coordinator",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: true,
    permissions: [
      P.PLATFORM.BRANCHES.READ, 
      P.EDUCATION.ACADEMIC_SESSIONS.READ,
      EDUCATION_SUBJECTS_PERMISSIONS.READ,
      EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS.READ,
      EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS.CREATE,
      EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS.UPDATE,
      EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS.READ,
      EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS.CREATE,
      EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS.END,
    ],`
);

// Instructor
code = code.replace(
  'name: "Instructor",\n    key: "instructor",\n    scopeType: "BRANCH",\n    isEditable: true,\n    isDeletable: true,\n    permissions: [P.EDUCATION.ACADEMIC_SESSIONS.READ],',
  `name: "Instructor",
    key: "instructor",
    scopeType: "BRANCH",
    isEditable: true,
    isDeletable: true,
    permissions: [
      P.EDUCATION.ACADEMIC_SESSIONS.READ,
      EDUCATION_SUBJECTS_PERMISSIONS.READ,
      EDUCATION_SUBJECT_OFFERINGS_PERMISSIONS.READ,
      EDUCATION_TEACHING_ASSIGNMENTS_PERMISSIONS.READ,
    ],`
);

fs.writeFileSync(file, code, 'utf8');
