import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import {
  AssignTeacherDto,
  EndTeachingAssignmentDto,
} from "@sitehookz/education";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";

@Injectable()
export class TeachingAssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assign(tenant: TenantContext, data: AssignTeacherDto) {
    return this.prisma.teachingAssignment.create({
      data: {
        organizationId: tenant.organizationId,
        subjectOfferingId: data.subjectOfferingId,
        staffMemberId: data.staffMemberId,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
      },
    });
  }

  async findActiveAssignment(
    tenant: TenantContext,
    subjectOfferingId: string,
    staffMemberId: string,
  ) {
    return this.prisma.teachingAssignment.findFirst({
      where: {
        organizationId: tenant.organizationId,
        subjectOfferingId,
        staffMemberId,
        endDate: null,
      },
    });
  }

  async findBySubjectOfferingId(
    tenant: TenantContext,
    subjectOfferingId: string,
  ) {
    return this.prisma.teachingAssignment.findMany({
      where: {
        organizationId: tenant.organizationId,
        subjectOfferingId,
      },
      orderBy: { startDate: "desc" },
    });
  }

  async findByStaffMemberId(tenant: TenantContext, staffMemberId: string) {
    return this.prisma.teachingAssignment.findMany({
      where: {
        organizationId: tenant.organizationId,
        staffMemberId,
      },
      orderBy: { startDate: "desc" },
      include: {
        subjectOffering: {
          include: {
            subject: true,
            schoolOffering: { include: { section: true } },
            tuitionOffering: { include: { batch: true } },
          },
        },
      },
    });
  }

  async findById(tenant: TenantContext, id: string) {
    return this.prisma.teachingAssignment.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },
    });
  }

  async endAssignment(
    tenant: TenantContext,
    id: string,
    data: EndTeachingAssignmentDto,
  ) {
    return this.prisma.teachingAssignment.update({
      where: {
        id,
        organizationId: tenant.organizationId,
      },
      data: {
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
      },
    });
  }
}
