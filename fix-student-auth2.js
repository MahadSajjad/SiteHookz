const fs = require("fs");
const path = "apps/api/src/products/education/students/students.service.ts";
let code = fs.readFileSync(path, "utf8");

const findAllReplacement = `async findAll(tenant: TenantContext, query: any) {
    const { search, status, gender, admissionBranchId, page, limit, sort, dir } = query;
    const where: any = { organizationId: tenant.organizationId, archivedAt: null };

    const accessibleBranches = this.auth.getAccessibleBranchIdsForPermission(tenant, 'education.students.read');
    if (accessibleBranches.length === 0) return { items: [], total: 0, page: 1, limit: 20 };

    if (!accessibleBranches.includes('*')) {
      where.enrollments = {
        some: {
          status: 'ACTIVE',
          branchId: { in: accessibleBranches }
        }
      };
    }

    if (status) where.status = status;
    if (gender) where.gender = gender;
    /* admissionBranchId is origin metadata. Auth now uses enrollment. */
    if (admissionBranchId) where.admissionBranchId = admissionBranchId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: dir },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { items, total, page, limit };
  }`;

code = code.replace(/async findAll\([^}]+}[^}]+}[^}]+}/, findAllReplacement);
fs.writeFileSync(path, code, "utf8");
console.log("Students auth 2 updated");
