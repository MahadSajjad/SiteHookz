import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { RequirePermission } from '../authorization/permission.guard';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @RequirePermission('platform.roles.read')
  @Get()
  async findAll(@TenantContext() tenant: any) {
    return this.rolesService.findAll(tenant.organizationId);
  }

  @RequirePermission('platform.roles.create')
  @Post()
  async create(@TenantContext() tenant: any, @Body() dto: any) {
    return this.rolesService.create(tenant.organizationId, dto);
  }

  @RequirePermission('platform.roles.delete')
  @Delete(':id')
  async delete(@TenantContext() tenant: any, @Param('id') id: string) {
    return this.rolesService.delete(tenant.organizationId, id);
  }
}
