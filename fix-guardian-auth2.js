const fs = require("fs");

const path = "apps/api/src/products/education/guardians/guardians.service.ts";
let code = fs.readFileSync(path, "utf8");

const findAllReplacement = `async findAll(tenant: TenantContext, query: any) {
    const accessibleBranches = this.auth.getAccessibleBranchIdsForPermission(tenant, 'education.guardians.read');
    if (accessibleBranches.length === 0) return { items: [], total: 0, page: 1, limit: 20 };

    const where: any = { organizationId: tenant.organizationId, archivedAt: null };

    let targetBranches = accessibleBranches;
    if (query.branchId) {
      if (!accessibleBranches.includes('*') && !accessibleBranches.includes(query.branchId)) {
        return { items: [], total: 0, page: 1, limit: 20 }; // Forbidden requested branch
      }
      targetBranches = [query.branchId];
    }

    if (!targetBranches.includes('*')) {
      where.studentGuardians = {
        some: {
          student: {
            enrollments: {
              some: {
                status: 'ACTIVE',
                branchId: { in: targetBranches }
              }
            }
          }
        }
      };
    }

    const items = await this.prisma.guardian.findMany({ where, take: 20 });
    return { items, total: items.length, page: 1, limit: 20 };
  }`;

code = code.replace(/async findAll\([^}]+}[^}]+}/, findAllReplacement);

const findOneReplacement = `async findOne(tenant: TenantContext, id: string) {
    const accessibleBranches = this.auth.getAccessibleBranchIdsForPermission(tenant, 'education.guardians.read');
    
    const where: any = { id, organizationId: tenant.organizationId };
    
    if (!accessibleBranches.includes('*')) {
      where.studentGuardians = {
        some: {
          student: {
            enrollments: {
              some: {
                status: 'ACTIVE',
                branchId: { in: accessibleBranches }
              }
            }
          }
        }
      };
    }

    const item = await this.prisma.guardian.findUnique({ where, include: { studentGuardians: { include: { student: true } } } });
    if (!item) throw new NotFoundException('GUARDIAN_NOT_FOUND');
    return item;
  }`;

code = code.replace(/async findOne\([^}]+}[^}]+}/, findOneReplacement);

fs.writeFileSync(path, code, "utf8");
console.log("Guardians auth 2 updated");
