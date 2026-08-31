import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { FeeAssignmentsService } from "./fee-assignments.service";
import {
  CreateEnrollmentFeePlanAssignmentDto,
  EnrollmentFeePlanAssignmentListResponse,
} from "@sitehookz/education";
import { RequirePermission } from "../../../../platform/authorization/permission.guard";
import {
  CurrentTenant,
  TenantContext,
} from "../../../../platform/tenancy/tenant.guard";
import { ZodValidationPipe } from "../../../../common/pipes/zod-validation.pipe";
import { CreateEnrollmentFeePlanAssignmentDtoSchema } from "@sitehookz/education";

@Controller("education/fee-assignments")
export class FeeAssignmentsController {
  constructor(private readonly feeAssignmentsService: FeeAssignmentsService) {}

  @Post()
  @RequirePermission("education.fee_assignments.create")
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body(new ZodValidationPipe(CreateEnrollmentFeePlanAssignmentDtoSchema))
    createDto: CreateEnrollmentFeePlanAssignmentDto,
  ) {
    const result = await this.feeAssignmentsService.create(
      tenant.organizationId,
      tenant.membershipId,
      createDto,
    );
    return { data: result };
  }

  @Get()
  @RequirePermission("education.fee_assignments.read")
  async findAll(
    @CurrentTenant() tenant: TenantContext,
    @Query("studentEnrollmentId") studentEnrollmentId?: string,
  ): Promise<EnrollmentFeePlanAssignmentListResponse> {
    const data = await this.feeAssignmentsService.findAll(
      tenant.organizationId,
      studentEnrollmentId,
    );
    return { data, total: data.length };
  }
}
