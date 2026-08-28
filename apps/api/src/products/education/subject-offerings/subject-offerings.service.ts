import { Injectable, NotFoundException } from "@nestjs/common";
import { SubjectOfferingsRepository } from "./subject-offerings.repository";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import {
  CreateSchoolSubjectOfferingDto,
  CreateTuitionSubjectOfferingDto,
} from "@sitehookz/education";
import { BusinessException } from "../../../common/exceptions/business.exception";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { P } from "@sitehookz/platform-permissions";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

@Injectable()
export class SubjectOfferingsService {
  constructor(
    private readonly repository: SubjectOfferingsRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly prisma: PrismaService,
  ) {}

  private async getBranchIdForSection(sectionId: string): Promise<string> {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
    });
    if (!section) throw new NotFoundException("Section not found");
    return section.branchId;
  }

  private async getBranchIdForBatch(batchId: string): Promise<string> {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
    });
    if (!batch) throw new NotFoundException("Batch not found");
    return batch.branchId;
  }

  private async getBranchIdForOffering(offeringId: string): Promise<string> {
    const offering = await this.prisma.subjectOffering.findUnique({
      where: { id: offeringId },
      include: {
        schoolOffering: { include: { section: true } },
        tuitionOffering: { include: { batch: true } },
      },
    });
    if (!offering) throw new NotFoundException("Offering not found");
    if (offering.schoolOffering)
      return offering.schoolOffering.section.branchId;
    if (offering.tuitionOffering)
      return offering.tuitionOffering.batch.branchId;
    throw new Error("Invalid offering");
  }

  async createSchoolOffering(
    tenant: TenantContext,
    data: CreateSchoolSubjectOfferingDto,
  ) {
    const branchId = await this.getBranchIdForSection(data.sectionId);
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECT_OFFERINGS.CREATE,
      branchId,
    );

    const offering = await this.repository.createSchoolOffering(tenant, data);
    if (!offering) {
      throw new BusinessException(
        "SUBJECT_OFFERING_DUPLICATE",
        400,
        "This subject is already offered for this section.",
      );
    }
    return offering;
  }

  async createTuitionOffering(
    tenant: TenantContext,
    data: CreateTuitionSubjectOfferingDto,
  ) {
    const branchId = await this.getBranchIdForBatch(data.batchId);
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECT_OFFERINGS.CREATE,
      branchId,
    );

    const offering = await this.repository.createTuitionOffering(tenant, data);
    if (!offering) {
      throw new BusinessException(
        "SUBJECT_OFFERING_DUPLICATE",
        400,
        "This subject is already offered for this batch.",
      );
    }
    return offering;
  }

  async findBySectionId(tenant: TenantContext, sectionId: string) {
    const branchId = await this.getBranchIdForSection(sectionId);
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECT_OFFERINGS.READ,
      branchId,
    );
    return this.repository.findBySectionId(tenant, sectionId);
  }

  async findByBatchId(tenant: TenantContext, batchId: string) {
    const branchId = await this.getBranchIdForBatch(batchId);
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECT_OFFERINGS.READ,
      branchId,
    );
    return this.repository.findByBatchId(tenant, batchId);
  }

  async archive(tenant: TenantContext, id: string) {
    const branchId = await this.getBranchIdForOffering(id);
    await this.authorizationService.assertPermission(
      tenant,
      P.EDUCATION.SUBJECT_OFFERINGS.ARCHIVE,
      branchId,
    );
    return this.repository.archive(tenant, id);
  }
}
