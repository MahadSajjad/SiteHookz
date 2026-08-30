import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { SubjectOfferingsService } from "./subject-offerings.service";
import {
  CreateSchoolSubjectOfferingDto,
  CreateTuitionSubjectOfferingDto,
  createSchoolSubjectOfferingSchema,
  createTuitionSubjectOfferingSchema
} from "@sitehookz/education";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";

@Controller("education/subject-offerings")
export class SubjectOfferingsController {
  constructor(
    private readonly subjectOfferingsService: SubjectOfferingsService,
  ) {}

  @Post("school")
  createSchoolOffering(
    @CurrentTenant() tenant: TenantContext,
    @Body(new ZodValidationPipe(createSchoolSubjectOfferingSchema)) createDto: CreateSchoolSubjectOfferingDto,
  ) {
    return this.subjectOfferingsService.createSchoolOffering(tenant, createDto);
  }

  @Post("tuition")
  createTuitionOffering(
    @CurrentTenant() tenant: TenantContext,
    @Body(new ZodValidationPipe(createTuitionSubjectOfferingSchema)) createDto: CreateTuitionSubjectOfferingDto,
  ) {
    return this.subjectOfferingsService.createTuitionOffering(
      tenant,
      createDto,
    );
  }

  @Get("section/:sectionId")
  findBySectionId(
    @CurrentTenant() tenant: TenantContext,
    @Param("sectionId") sectionId: string,
  ) {
    return this.subjectOfferingsService.findBySectionId(tenant, sectionId);
  }

  @Get("batch/:batchId")
  findByBatchId(
    @CurrentTenant() tenant: TenantContext,
    @Param("batchId") batchId: string,
  ) {
    return this.subjectOfferingsService.findByBatchId(tenant, batchId);
  }

  @Post(":id/archive")
  archive(@CurrentTenant() tenant: TenantContext, @Param("id") id: string) {
    return this.subjectOfferingsService.archive(tenant, id);
  }
}
