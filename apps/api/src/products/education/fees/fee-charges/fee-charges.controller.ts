import { Controller, Post, Body, Param, ParseUUIDPipe } from "@nestjs/common";
import { FeeChargesService } from "./fee-charges.service";
import { GenerateFeeChargesDto, VoidFeeChargeDto } from "@sitehookz/education";
import { RequirePermission } from "../../../../platform/authorization/permission.guard";
import {
  CurrentTenant,
  TenantContext,
} from "../../../../platform/tenancy/tenant.guard";
import { ZodValidationPipe } from "../../../../common/pipes/zod-validation.pipe";
import {
  GenerateFeeChargesDtoSchema,
  VoidFeeChargeDtoSchema,
} from "@sitehookz/education";

@Controller("education/fee-assignments/:assignmentId/charges")
export class FeeChargesController {
  constructor(private readonly feeChargesService: FeeChargesService) {}

  @Post("generate")
  @RequirePermission("education.fee_charges.generate")
  async generate(
    @CurrentTenant() tenant: TenantContext,
    @Param("assignmentId", ParseUUIDPipe) assignmentId: string,
    @Body(new ZodValidationPipe(GenerateFeeChargesDtoSchema))
    generateDto: GenerateFeeChargesDto,
  ) {
    const result = await this.feeChargesService.generate(
      tenant.organizationId,
      assignmentId,
      generateDto,
    );
    return { data: result };
  }
}

@Controller("education/fee-charges")
export class FeeChargesVoidController {
  constructor(private readonly feeChargesService: FeeChargesService) {}

  @Post(":id/void")
  @RequirePermission("education.fee_charges.void")
  async voidCharge(
    @CurrentTenant() tenant: TenantContext,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(VoidFeeChargeDtoSchema))
    voidDto: VoidFeeChargeDto,
  ) {
    const result = await this.feeChargesService.voidCharge(
      tenant.organizationId,
      tenant.membershipId,
      id,
      voidDto,
    );
    return { data: result };
  }
}
