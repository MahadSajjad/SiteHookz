const fs = require('fs');
let c = fs.readFileSync('products/education/src/permissions/education-permissions-registry.ts', 'utf8');

const newPerms = `
  { key: "education.fee_heads.read", description: "Read fee heads", category: "Education" },
  { key: "education.fee_heads.create", description: "Create fee heads", category: "Education" },
  { key: "education.fee_heads.update", description: "Update fee heads", category: "Education" },
  { key: "education.fee_heads.archive", description: "Archive fee heads", category: "Education" },
  { key: "education.fee_heads.restore", description: "Restore fee heads", category: "Education" },

  { key: "education.fee_plans.read", description: "Read fee plans", category: "Education" },
  { key: "education.fee_plans.create", description: "Create fee plans", category: "Education" },
  { key: "education.fee_plans.update", description: "Update fee plans", category: "Education" },
  { key: "education.fee_plans.activate", description: "Activate fee plans", category: "Education" },
  { key: "education.fee_plans.archive", description: "Archive fee plans", category: "Education" },

  { key: "education.fee_assignments.read", description: "Read fee assignments", category: "Education" },
  { key: "education.fee_assignments.create", description: "Create fee assignments", category: "Education" },
  { key: "education.fee_assignments.end", description: "End fee assignments", category: "Education" },

  { key: "education.fee_charges.read", description: "Read fee charges", category: "Education" },
  { key: "education.fee_charges.generate", description: "Generate fee charges", category: "Education" },
  { key: "education.fee_charges.void", description: "Void fee charges", category: "Education" },

  { key: "education.payments.read", description: "Read payments", category: "Education" },
  { key: "education.payments.create", description: "Create payments", category: "Education" },
  { key: "education.payments.void", description: "Void payments", category: "Education" },
];`;

c = c.replace(/\];$/, newPerms);
fs.writeFileSync('products/education/src/permissions/education-permissions-registry.ts', c);

let rt = fs.readFileSync('products/education/src/role-templates/education-role-templates.ts', 'utf8');
rt = rt.replace(/EDUCATION_TIMETABLES_PERMISSIONS,\n} from "\.\.\/permissions\/education-permissions";/, `EDUCATION_TIMETABLES_PERMISSIONS,\n  EDUCATION_FEES_PERMISSIONS,\n} from "../permissions/education-permissions";`);

// Principal: all fee perms
rt = rt.replace(/(P\.ARCHIVE,\n\s+EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS\.READ,)/g, `EDUCATION_FEES_PERMISSIONS.READ_FEE_HEADS,
      EDUCATION_FEES_PERMISSIONS.CREATE_FEE_HEADS,
      EDUCATION_FEES_PERMISSIONS.UPDATE_FEE_HEADS,
      EDUCATION_FEES_PERMISSIONS.ARCHIVE_FEE_HEADS,
      EDUCATION_FEES_PERMISSIONS.RESTORE_FEE_HEADS,
      EDUCATION_FEES_PERMISSIONS.READ_FEE_PLANS,
      EDUCATION_FEES_PERMISSIONS.CREATE_FEE_PLANS,
      EDUCATION_FEES_PERMISSIONS.UPDATE_FEE_PLANS,
      EDUCATION_FEES_PERMISSIONS.ACTIVATE_FEE_PLANS,
      EDUCATION_FEES_PERMISSIONS.ARCHIVE_FEE_PLANS,
      EDUCATION_FEES_PERMISSIONS.READ_FEE_ASSIGNMENTS,
      EDUCATION_FEES_PERMISSIONS.CREATE_FEE_ASSIGNMENTS,
      EDUCATION_FEES_PERMISSIONS.END_FEE_ASSIGNMENTS,
      EDUCATION_FEES_PERMISSIONS.READ_FEE_CHARGES,
      EDUCATION_FEES_PERMISSIONS.GENERATE_FEE_CHARGES,
      EDUCATION_FEES_PERMISSIONS.VOID_FEE_CHARGES,
      EDUCATION_FEES_PERMISSIONS.READ_PAYMENTS,
      EDUCATION_FEES_PERMISSIONS.CREATE_PAYMENTS,
      EDUCATION_FEES_PERMISSIONS.VOID_PAYMENTS,
      $1`);

// Academic Coordinator: read perms
rt = rt.replace(/(P\.UPDATE,\n\s+EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS\.READ,)/g, `EDUCATION_FEES_PERMISSIONS.READ_FEE_HEADS,
      EDUCATION_FEES_PERMISSIONS.READ_FEE_PLANS,
      EDUCATION_FEES_PERMISSIONS.READ_FEE_ASSIGNMENTS,
      EDUCATION_FEES_PERMISSIONS.READ_FEE_CHARGES,
      EDUCATION_FEES_PERMISSIONS.READ_PAYMENTS,
      $1`);

fs.writeFileSync('products/education/src/role-templates/education-role-templates.ts', rt);

let ep = fs.readFileSync('products/education/src/permissions/education-permissions.ts', 'utf8');
ep += `\nexport const EDUCATION_FEES_PERMISSIONS = {
  READ_FEE_HEADS: "education.fee_heads.read",
  CREATE_FEE_HEADS: "education.fee_heads.create",
  UPDATE_FEE_HEADS: "education.fee_heads.update",
  ARCHIVE_FEE_HEADS: "education.fee_heads.archive",
  RESTORE_FEE_HEADS: "education.fee_heads.restore",
  READ_FEE_PLANS: "education.fee_plans.read",
  CREATE_FEE_PLANS: "education.fee_plans.create",
  UPDATE_FEE_PLANS: "education.fee_plans.update",
  ACTIVATE_FEE_PLANS: "education.fee_plans.activate",
  ARCHIVE_FEE_PLANS: "education.fee_plans.archive",
  READ_FEE_ASSIGNMENTS: "education.fee_assignments.read",
  CREATE_FEE_ASSIGNMENTS: "education.fee_assignments.create",
  END_FEE_ASSIGNMENTS: "education.fee_assignments.end",
  READ_FEE_CHARGES: "education.fee_charges.read",
  GENERATE_FEE_CHARGES: "education.fee_charges.generate",
  VOID_FEE_CHARGES: "education.fee_charges.void",
  READ_PAYMENTS: "education.payments.read",
  CREATE_PAYMENTS: "education.payments.create",
  VOID_PAYMENTS: "education.payments.void",
} as const;\n`;
fs.writeFileSync('products/education/src/permissions/education-permissions.ts', ep);
