import { Controller, Get, Post, Delete, Body, Param } from "@nestjs/common";

import { TenantContext as TenantContextDecorator } from "../../common/decorators/tenant-context.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { RequirePermission } from "../authorization/permission.guard";
import { TenantContext } from "../tenancy/tenant.guard";

import { CreateRoleDto, createRoleSchema } from "./dto/create-role.dto";
import { RolesService } from "./roles.service";

@Controller("roles")
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @RequirePermission("platform.roles.read")
  @Get()
  async findAll(@TenantContextDecorator() tenant: TenantContext) {
    return this.rolesService.findAll(tenant.organizationId);
  }

  @RequirePermission("platform.roles.create")
  @Post()
  async create(
    @TenantContextDecorator() tenant: TenantContext,
    @Body(new ZodValidationPipe(createRoleSchema)) dto: CreateRoleDto,
  ) {
    return this.rolesService.create(tenant, dto);
  }

  @RequirePermission("platform.roles.delete")
  @Delete(":id")
  async delete(
    @TenantContextDecorator() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.rolesService.delete(tenant.organizationId, id);
  }
}
