import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from "@nestjs/common";
import { FeePlansService } from "./fee-plans.service";
import {
  CreateFeePlanDto,
  UpdateFeePlanDto,
  FeePlanListResponse,
} from "@sitehookz/education";
import { RequirePermission } from "../../../../platform/authorization/permission.guard";
import {
  CurrentTenant,
  TenantContext,
} from "../../../../platform/tenancy/tenant.guard";
import { ZodValidationPipe } from "../../../../common/pipes/zod-validation.pipe";
import {
  CreateFeePlanDtoSchema,
  UpdateFeePlanDtoSchema,
} from "@sitehookz/education";

@Controller("education/fee-plans")
export class FeePlansController {
  constructor(private readonly feePlansService: FeePlansService) {}

  @Post()
  @RequirePermission("education.fee_plans.create")
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body(new ZodValidationPipe(CreateFeePlanDtoSchema))
    createDto: CreateFeePlanDto,
  ) {
    const result = await this.feePlansService.create(
      tenant.organizationId,
      createDto,
    );
    return { data: result };
  }

  @Get()
  @RequirePermission("education.fee_plans.read")
  async findAll(
    @CurrentTenant() tenant: TenantContext,
  ): Promise<FeePlanListResponse> {
    const data = await this.feePlansService.findAll(tenant.organizationId);
    return { data, total: data.length };
  }

  @Get(":id")
  @RequirePermission("education.fee_plans.read")
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const result = await this.feePlansService.findOne(
      tenant.organizationId,
      id,
    );
    return { data: result };
  }

  @Patch(":id")
  @RequirePermission("education.fee_plans.update")
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateFeePlanDtoSchema))
    updateDto: UpdateFeePlanDto,
  ) {
    const result = await this.feePlansService.update(
      tenant.organizationId,
      id,
      updateDto,
    );
    return { data: result };
  }

  @Post(":id/activate")
  @RequirePermission("education.fee_plans.activate")
  async activate(
    @CurrentTenant() tenant: TenantContext,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    const result = await this.feePlansService.activate(
      tenant.organizationId,
      id,
    );
    return { data: result };
  }

  @Delete(":id")
  @RequirePermission("education.fee_plans.delete")
  async remove(
    @CurrentTenant() tenant: TenantContext,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.feePlansService.remove(tenant.organizationId, id);
    return { success: true };
  }
}
