import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { SubjectOfferingsService } from "./subject-offerings.service";
import { CreateSchoolSubjectOfferingDto, CreateTuitionSubjectOfferingDto } from "@sitehookz/education";
import { RequireAuth } from "../../../core/auth/decorators/require-auth.decorator";
import { GetTenant } from "../../../core/auth/decorators/get-tenant.decorator";
import { TenantContext } from "../../../core/auth/tenant-context";

@Controller("education/subject-offerings")
@RequireAuth()
export class SubjectOfferingsController {
  constructor(private readonly subjectOfferingsService: SubjectOfferingsService) {}

  @Post("school")
  createSchoolOffering(
    @GetTenant() tenant: TenantContext,
    @Body() createDto: CreateSchoolSubjectOfferingDto
  ) {
    return this.subjectOfferingsService.createSchoolOffering(tenant, createDto);
  }

  @Post("tuition")
  createTuitionOffering(
    @GetTenant() tenant: TenantContext,
    @Body() createDto: CreateTuitionSubjectOfferingDto
  ) {
    return this.subjectOfferingsService.createTuitionOffering(tenant, createDto);
  }

  @Get("section/:sectionId")
  findBySectionId(@GetTenant() tenant: TenantContext, @Param("sectionId") sectionId: string) {
    return this.subjectOfferingsService.findBySectionId(tenant, sectionId);
  }

  @Get("batch/:batchId")
  findByBatchId(@GetTenant() tenant: TenantContext, @Param("batchId") batchId: string) {
    return this.subjectOfferingsService.findByBatchId(tenant, batchId);
  }

  @Post(":id/archive")
  archive(@GetTenant() tenant: TenantContext, @Param("id") id: string) {
    return this.subjectOfferingsService.archive(tenant, id);
  }
}
