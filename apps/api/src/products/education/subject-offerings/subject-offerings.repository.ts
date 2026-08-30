import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import {
  CreateSchoolSubjectOfferingDto,
  CreateTuitionSubjectOfferingDto,
} from "@sitehookz/education";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";

@Injectable()
export class SubjectOfferingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSchoolOffering(
    tenant: TenantContext,
    data: CreateSchoolSubjectOfferingDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Lock the section
      await tx.$queryRaw`SELECT id FROM "Section" WHERE id = ${data.sectionId}::uuid AND "organizationId" = ${tenant.organizationId}::uuid FOR UPDATE`;

      // Check if offering already exists for this section and subject
      const existing = await tx.schoolSubjectOffering.findFirst({
        where: {
          sectionId: data.sectionId,
          subjectOffering: { subjectId: data.subjectId },
        },
      });

      if (existing) {
        return null;
      }

      const offering = await tx.subjectOffering.create({
        data: {
          organizationId: tenant.organizationId,
          subjectId: data.subjectId,
          offeringType: "SCHOOL",
          schoolOffering: {
            create: {
              organizationId: tenant.organizationId,
              sectionId: data.sectionId,
            },
          },
        },
        include: { schoolOffering: true },
      });
      return offering;
    });
  }

  async createTuitionOffering(
    tenant: TenantContext,
    data: CreateTuitionSubjectOfferingDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Lock the batch
      await tx.$queryRaw`SELECT id FROM "Batch" WHERE id = ${data.batchId}::uuid AND "organizationId" = ${tenant.organizationId}::uuid FOR UPDATE`;

      // Check if offering already exists for this batch and subject
      const existing = await tx.tuitionSubjectOffering.findFirst({
        where: {
          batchId: data.batchId,
          subjectOffering: { subjectId: data.subjectId },
        },
      });

      if (existing) {
        return null;
      }

      const offering = await tx.subjectOffering.create({
        data: {
          organizationId: tenant.organizationId,
          subjectId: data.subjectId,
          offeringType: "TUITION",
          tuitionOffering: {
            create: {
              organizationId: tenant.organizationId,
              batchId: data.batchId,
            },
          },
        },
        include: { tuitionOffering: true },
      });
      return offering;
    });
  }

  async findBySectionId(tenant: TenantContext, sectionId: string) {
    return this.prisma.subjectOffering.findMany({
      where: {
        organizationId: tenant.organizationId,
        schoolOffering: { sectionId },
        status: "ACTIVE",
      },
      include: { schoolOffering: true },
    });
  }

  async findByBatchId(tenant: TenantContext, batchId: string) {
    return this.prisma.subjectOffering.findMany({
      where: {
        organizationId: tenant.organizationId,
        tuitionOffering: { batchId },
        status: "ACTIVE",
      },
      include: { tuitionOffering: true },
    });
  }

  async findById(tenant: TenantContext, id: string) {
    return this.prisma.subjectOffering.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },
      include: { schoolOffering: true, tuitionOffering: true },
    });
  }

  async archive(tenant: TenantContext, id: string) {
    return this.prisma.subjectOffering.update({
      where: {
        id,
        organizationId: tenant.organizationId,
      },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
      },
    });
  }
}
