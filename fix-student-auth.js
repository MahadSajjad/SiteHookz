const fs = require("fs");
const path = "apps/api/src/products/education/students/students.service.ts";
let code = fs.readFileSync(path, "utf8");

// Replace findOne
code = code.replace(
  /if \(student\.admissionBranchId\) {\s+this\.auth\.assertPermission\(tenant, 'education\.students\.read', student\.admissionBranchId\);\s+}/g,
  `const activeEnr = await this.prisma.studentEnrollment.findFirst({ where: { organizationId: tenant.organizationId, studentId: id, status: 'ACTIVE' }});\n    if (activeEnr) {\n      this.auth.assertPermission(tenant, 'education.students.read', activeEnr.branchId);\n    } else {\n      // Fallback or org-level\n    }`,
);

// Replace update
code = code.replace(
  /if \(student\.admissionBranchId\) {\s+this\.auth\.assertPermission\(tenant, 'education\.students\.update', student\.admissionBranchId\);\s+}/g,
  `const activeEnr = await this.prisma.studentEnrollment.findFirst({ where: { organizationId: tenant.organizationId, studentId: id, status: 'ACTIVE' }});\n    if (activeEnr) {\n      this.auth.assertPermission(tenant, 'education.students.update', activeEnr.branchId);\n    }`,
);

// Archive / restore requires organization-scoped authority
code = code.replace(
  /if \(student\.admissionBranchId\) {\s+this\.auth\.assertPermission\(tenant, 'education\.students\.archive', student\.admissionBranchId\);\s+}/g,
  `this.auth.assertPermission(tenant, 'education.students.archive');`,
);
code = code.replace(
  /if \(student\.admissionBranchId\) {\s+this\.auth\.assertPermission\(tenant, 'education\.students\.restore', student\.admissionBranchId\);\s+}/g,
  `this.auth.assertPermission(tenant, 'education.students.restore');`,
);

fs.writeFileSync(path, code, "utf8");
console.log("Students auth updated");
