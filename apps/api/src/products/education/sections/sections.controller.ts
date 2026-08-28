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
import { SectionsService } from "./sections.service";
import {
  RequirePermission,
  PermissionGuard,
} from "../../../platform/authorization/permission.guard";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";

@Controller("education/sections")
@UseGuards(PermissionGuard)
export class SectionsController {
  constructor(private readonly service: SectionsService) {}

  @Get()
  @RequirePermission("education.sections.read")
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) {
    return this.service.findAll(tenant, query);
  }

  @Get(":id")
  @RequirePermission("education.sections.read")
  async findOne(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.service.findOne(tenant, id);
  }

  @Post()
  @RequirePermission("education.sections.create")
  async create(@CurrentTenant() tenant: TenantContext, @Body() dto: any) {
    return this.service.create(tenant, dto);
  }

  @Patch(":id")
  @RequirePermission("education.sections.update")
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() dto: any,
  ) {
    return this.service.update(tenant, id, dto);
  }
}
