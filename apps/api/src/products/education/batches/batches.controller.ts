import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { BatchesService } from "./batches.service";
import {
  RequirePermission,
  PermissionGuard,
} from "../../../platform/authorization/permission.guard";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";

@Controller("education/batches")
@UseGuards(PermissionGuard)
export class BatchesController {
  constructor(private readonly service: BatchesService) {}

  @Get()
  @RequirePermission("education.batches.read")
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) {
    return this.service.findAll(tenant, query);
  }

  @Get(":id")
  @RequirePermission("education.batches.read")
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.service.findOne(tenant, id);
  }

  @Post()
  @RequirePermission("education.batches.create")
  async create(@CurrentTenant() tenant: TenantContext, @Body() dto: any) {
    return this.service.create(tenant, dto);
  }

  @Patch(":id")
  @RequirePermission("education.batches.update")
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() dto: any,
  ) {
    return this.service.update(tenant, id, dto);
  }
}
