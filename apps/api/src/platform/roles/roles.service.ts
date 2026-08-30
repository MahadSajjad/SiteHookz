import { Injectable } from "@nestjs/common";

import { BusinessException } from "../../common/exceptions/business.exception";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { TenantContext } from "../tenancy/tenant.guard";

import { CreateRoleDto } from "./dto/create-role.dto";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.role.findMany({ where: { organizationId } });
  }

  async create(tenantContext: TenantContext, dto: CreateRoleDto) {
    const { organizationId } = tenantContext;

    // Normalize role key
    const normalizedKey = dto.key.trim().toLowerCase();

    // Check key uniqueness
    const existing = await this.prisma.role.findUnique({
      where: {
        organizationId_key: {
          organizationId,
          key: normalizedKey,
        },
      },
    });

    if (existing) {
      throw new BusinessException(
        "ROLE_IN_USE",
        409,
        "Role key is already in use in this organization",
      );
    }

    // Enforce permission escalation ceiling
    if (dto.permissions && dto.permissions.length > 0) {
      // Owner bypass: If user has 'platform.roles.manage_all', they can bypass
      const hasFullControl = tenantContext.assignments.some(
        (a) =>
          a.scopeType === "ORGANIZATION" &&
          a.permissions.includes("platform.roles.manage_all"),
      );

      if (!hasFullControl) {
        // Otherwise, they can only grant permissions they possess at ORGANIZATION scope
        // (assuming roles are org-scoped for definition).
        const userOrgPermissions = new Set(
          tenantContext.assignments
            .filter((a) => a.scopeType === "ORGANIZATION")
            .flatMap((a) => a.permissions),
        );

        for (const requestedPerm of dto.permissions) {
          if (!userOrgPermissions.has(requestedPerm)) {
            throw new BusinessException(
              "PERMISSION_ESCALATION",
              403,
              `Cannot assign permission ${requestedPerm} as you do not possess it at the organization scope`,
            );
          }
        }
      }
    }

    // We must resolve Permission IDs from keys to create RolePermission records
    let permissionIds: string[] = [];
    if (dto.permissions && dto.permissions.length > 0) {
      const perms = await this.prisma.permission.findMany({
        where: { key: { in: dto.permissions } },
      });
      permissionIds = perms.map((p) => p.id);

      if (permissionIds.length !== dto.permissions.length) {
        throw new BusinessException(
          "INVALID_PERMISSION",
          400,
          "One or more provided permissions are invalid",
        );
      }
    }

    return this.prisma.role.create({
      data: {
        organizationId,
        name: dto.name,
        type: "CUSTOM",
        scopeType: dto.scopeType,
        key: normalizedKey,
        rolePermissions: {
          create: permissionIds.map((id) => ({
            permissionId: id,
          })),
        },
      },
    });
  }

  async delete(organizationId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId },
      include: {
        _count: {
          select: {
            roleAssignments: true,
            invitationRoleAssignments: true,
          },
        },
      },
    });

    if (!role) {
      throw new BusinessException("ROLE_NOT_FOUND", 404, "Role not found");
    }

    if (role.type === "SYSTEM" || !role.isDeletable) {
      throw new BusinessException(
        "ROLE_SYSTEM_PROTECTED",
        403,
        "Cannot delete system or protected role",
      );
    }

    if (
      role._count.roleAssignments > 0 ||
      role._count.invitationRoleAssignments > 0
    ) {
      throw new BusinessException(
        "ROLE_IN_USE",
        409,
        "Role is currently in use by active members or pending invitations",
      );
    }

    await this.prisma.role.delete({ where: { id: roleId } });
    return { success: true };
  }
}
