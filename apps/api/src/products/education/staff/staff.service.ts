import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";

@Injectable()
export class StaffService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthorizationService,
  ) {}

  async findAll(tenant: TenantContext, query: any) {
    return {
      items: await this.prisma.staffMember.findMany({
        where: { organizationId: tenant.organizationId, archivedAt: null },
        take: 20,
      }),
    };
  }
  async findOne(tenant: TenantContext, id: string) {
    return this.prisma.staffMember.findUnique({
      where: { id, organizationId: tenant.organizationId },
      include: { assignments: { include: { position: true, branch: true } } },
    });
  }
  async create(tenant: TenantContext, dto: any) {
    return this.prisma.staffMember.create({
      data: { organizationId: tenant.organizationId, ...dto },
    });
  }

  async findPositions(tenant: TenantContext) {
    return this.prisma.staffPosition.findMany({
      where: { organizationId: tenant.organizationId, archivedAt: null },
    });
  }
  async createPosition(tenant: TenantContext, dto: any) {
    return this.prisma.staffPosition.create({
      data: { organizationId: tenant.organizationId, ...dto },
    });
  }

  async getAssignments(tenant: TenantContext, staffMemberId: string) {
    return this.prisma.staffBranchAssignment.findMany({
      where: { staffMemberId, organizationId: tenant.organizationId },
      include: { position: true, branch: true },
    });
  }
  async createAssignment(
    tenant: TenantContext,
    staffMemberId: string,
    dto: any,
  ) {
    this.auth.assertPermission(
      tenant,
      "education.staff_assignments.create",
      dto.branchId,
    );
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.staffBranchAssignment.updateMany({
          where: {
            staffMemberId,
            organizationId: tenant.organizationId,
            isPrimary: true,
            endDate: null,
          },
          data: { isPrimary: false },
        });
      }
      return tx.staffBranchAssignment.create({
        data: { organizationId: tenant.organizationId, staffMemberId, ...dto },
      });
    });
  }
  async endAssignment(
    tenant: TenantContext,
    staffMemberId: string,
    assignmentId: string,
  ) {
    const assignment = await this.prisma.staffBranchAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (assignment)
      this.auth.assertPermission(
        tenant,
        "education.staff_assignments.end",
        assignment.branchId,
      );
    return this.prisma.staffBranchAssignment.update({
      where: { id: assignmentId, organizationId: tenant.organizationId },
      data: { endDate: new Date() },
    });
  }
}
