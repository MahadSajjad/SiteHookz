import { Controller, Post, Body, Param, ParseUUIDPipe } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto, VoidPaymentDto } from "@sitehookz/education";
import { RequirePermission } from "../../../../platform/authorization/permission.guard";
import {
  CurrentTenant,
  TenantContext,
} from "../../../../platform/tenancy/tenant.guard";
import { ZodValidationPipe } from "../../../../common/pipes/zod-validation.pipe";
import {
  CreatePaymentDtoSchema,
  VoidPaymentDtoSchema,
} from "@sitehookz/education";

@Controller("education/payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @RequirePermission("education.payments.create")
  async create(
    @CurrentTenant() tenant: TenantContext,
    @Body(new ZodValidationPipe(CreatePaymentDtoSchema))
    createDto: CreatePaymentDto,
  ) {
    const result = await this.paymentsService.create(
      tenant.organizationId,
      tenant.membershipId,
      createDto,
    );
    return { data: result };
  }

  @Post(":id/void")
  @RequirePermission("education.payments.void")
  async voidPayment(
    @CurrentTenant() tenant: TenantContext,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(VoidPaymentDtoSchema)) voidDto: VoidPaymentDto,
  ) {
    const result = await this.paymentsService.voidPayment(
      tenant.organizationId,
      tenant.membershipId,
      id,
      voidDto,
    );
    return { data: result };
  }
}
