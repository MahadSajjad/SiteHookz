import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { TenantContext } from "../tenancy/tenant.guard";
import { BusinessException } from "../../common/exceptions/business.exception";

@Injectable()
export class AuthorizationService {
  constructor(private prisma: PrismaService) {}

  hasPermission(
    tenantContext: TenantContext,
    permission: string,
    branchId?: string,
  ): boolean {
    return tenantContext.assignments.some((assignment) => {
      const hasPerm = assignment.permissions.includes(permission);
      if (!hasPerm) return false;

      if (assignment.scopeType === "ORGANIZATION") return true;
      if (
        assignment.scopeType === "BRANCH" &&
        branchId &&
        assignment.branchId === branchId
      )
        return true;

      return false;
    });
  }

  assertPermission(
    tenantContext: TenantContext,
    permission: string,
    branchId?: string,
  ): void {
    if (!this.hasPermission(tenantContext, permission, branchId)) {
      throw new BusinessException(
        "PERMISSION_DENIED",
        403,
        `Insufficient permissions for ${permission}`,
      );
    }
  }

  getAccessibleBranchIdsForPermission(
    tenantContext: TenantContext,
    permission: string,
  ): string[] | "ALL" {
    const accessibleBranches: string[] = [];

    for (const assignment of tenantContext.assignments) {
      if (assignment.permissions.includes(permission)) {
        if (assignment.scopeType === "ORGANIZATION") {
          return "ALL";
        }
        if (assignment.scopeType === "BRANCH" && assignment.branchId) {
          accessibleBranches.push(assignment.branchId);
        }
      }
    }

    return accessibleBranches;
  }
}
