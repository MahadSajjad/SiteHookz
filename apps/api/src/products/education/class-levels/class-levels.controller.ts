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

import {
  RequirePermission,
  PermissionGuard,
} from "../../../platform/authorization/permission.guard";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";

import { ClassLevelsService } from "./class-levels.service";

@Controller("education/class-levels")
@UseGuards(PermissionGuard)
export class ClassLevelsController {
  constructor(private readonly service: ClassLevelsService) {}

  @Get()
  @RequirePermission("education.class_levels.read")
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) {
    return this.service.findAll(tenant, query);
  }

  @Get(":id")
  @RequirePermission("education.class_levels.read")
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.service.findOne(tenant, id);
  }

  @Post()
  @RequirePermission("education.class_levels.create")
  async create(@CurrentTenant() tenant: TenantContext, @Body() dto: any) {
    return this.service.create(tenant, dto);
  }

  @Patch(":id")
  @RequirePermission("education.class_levels.update")
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() dto: any,
  ) {
    return this.service.update(tenant, id, dto);
  }

  @Post(":id/archive")
  @RequirePermission("education.class_levels.archive")
  async archive(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.service.archive(tenant, id);
  }

  @Post(":id/restore")
  @RequirePermission("education.class_levels.restore")
  async restore(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.service.restore(tenant, id);
  }
}
