import { Injectable, NotFoundException } from "@nestjs/common";
import {
  AssignTeacherDto,
  EndTeachingAssignmentDto,
} from "@sitehookz/education";
import { P } from "@sitehookz/platform-permissions";

import { BusinessException } from "../../../common/exceptions/business.exception";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";

import { TeachingAssignmentsRepository } from "./teaching-assignments.repository";

@Injectable()
export class TeachingAssignmentsService {
  constructor(
    private readonly repository: TeachingAssignmentsRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly prisma: PrismaService,
  ) {}

  private async getBranchIdForOffering(offeringId: string): Promise<string> {
    const offering = await this.prisma.subjectOffering.findUnique({
      where: { id: offeringId },
      include: {
        schoolOffering: { include: { section: true } },
        tuitionOffering: { include: { batch: true } },
      },
    });
    if (!offering) throw new NotFoundException("Subject offering not found");
    if (offering.schoolOffering)
      return offering.schoolOffering.section.branchId;
    if (offering.tuitionOffering)
      return offering.tuitionOffering.batch.branchId;
    throw new Error("Invalid offering");
  }

  async assign(tenant: TenantContext, data: AssignTeacherDto) {
    const branchId = await this.getBranchIdForOffering(data.subjectOfferingId);
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.TEACHING_ASSIGNMENTS.CREATE,
      branchId,
    );

    // Check active staff branch assignment
    const activeStaffAssignment =
      await this.prisma.staffBranchAssignment.findFirst({
        where: {
          staffMemberId: data.staffMemberId,
          branchId,
          endDate: null,
        },
      });

    if (!activeStaffAssignment) {
      throw new BusinessException(
        "TEACHING_ASSIGNMENT_STAFF_BRANCH_MISMATCH",
        400,
        "The staff member does not have an active assignment in the branch of this subject offering.",
      );
    }

    // Check duplicate active teaching assignment
    const existing = await this.repository.findActiveAssignment(
      tenant,
      data.subjectOfferingId,
      data.staffMemberId,
    );
    if (existing) {
      throw new BusinessException(
        "TEACHING_ASSIGNMENT_DUPLICATE",
        400,
        "This staff member is already actively assigned to teach this subject offering.",
      );
    }

    try {
      return await this.repository.assign(tenant, data);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new BusinessException(
          "TEACHING_ASSIGNMENT_DUPLICATE",
          400,
          "This staff member is already actively assigned to teach this subject offering.",
        );
      }
      throw error;
    }
  }

  async findBySubjectOfferingId(
    tenant: TenantContext,
    subjectOfferingId: string,
  ) {
    const branchId = await this.getBranchIdForOffering(subjectOfferingId);
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.TEACHING_ASSIGNMENTS.READ,
      branchId,
    );
    return this.repository.findBySubjectOfferingId(tenant, subjectOfferingId);
  }

  async findByStaffMemberId(tenant: TenantContext, staffMemberId: string) {
    // Note: A staff member could teach across branches, we might want organization-level read or verify user has read on staff member's branches.
    // Assuming if the caller has the permission at org level or we filter by branches they can access, but let's do a simple check.
    // For now, we fetch and maybe we should just allow if they can read the staff member.
    // Actually, we'll just check organization level permission or allow it, but we can do a simple org-wide check if needed.
    // Let's assert organization read permission for teaching assignments since it spans multiple branches.
    // Wait, the prompt says: SubjectOffering/TeachingAssignment: Branch-scoped. Find the derived branch from Section/Batch, then use authorizationService.assertPermission(tenant, permission, branchId).
    // Getting all assignments for a staff member implies we need to filter by the branches the caller has access to, or check each.
    // We will leave it as an open point or check for each returned record.
    const assignments = await this.repository.findByStaffMemberId(
      tenant,
      staffMemberId,
    );

    // As an optimization, we will just return them, or we could filter based on user's branch permissions.
    // The prompt says "Authorization: SubjectOffering/TeachingAssignment: Branch-scoped. Find the derived branch from Section/Batch, then use authorizationService.assertPermission(tenant, permission, branchId)."
    // It's probably easier to filter out the ones they don't have access to, or assume `findByStaffMemberId` is okay if they have staff read access. We'll filter.
    const accessibleAssignments = [];
    for (const assignment of assignments) {
      const branchId = assignment.subjectOffering.schoolOffering
        ? assignment.subjectOffering.schoolOffering.section.branchId
        : assignment.subjectOffering.tuitionOffering!.batch.branchId;

      try {
        await this.authorizationService.assertPermission(
          tenant,
          P.EDUCATION.TEACHING_ASSIGNMENTS.READ,
          branchId,
        );
        accessibleAssignments.push(assignment);
      } catch (e) {
        // ignore
      }
    }
    return accessibleAssignments;
  }

  async endAssignment(
    tenant: TenantContext,
    id: string,
    data: EndTeachingAssignmentDto,
  ) {
    const assignment = await this.repository.findById(tenant, id);
    if (!assignment)
      throw new NotFoundException("Teaching assignment not found");

    const branchId = await this.getBranchIdForOffering(
      assignment.subjectOfferingId,
    );
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.TEACHING_ASSIGNMENTS.UPDATE,
      branchId,
    );

    return this.repository.endAssignment(tenant, id, data);
  }
}
