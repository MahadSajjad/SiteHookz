import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { RequirePermission, PermissionGuard } from '../../../platform/authorization/permission.guard';
import { CurrentTenant, TenantContext } from '../../../platform/tenancy/tenant.guard';

@Controller('education/courses')
@UseGuards(PermissionGuard)
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Get()
  @RequirePermission('education.courses.read')
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) {
    return this.service.findAll(tenant, query);
  }

  @Get(':id')
  @RequirePermission('education.courses.read')
  async findOne(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.service.findOne(tenant, id);
  }

  @Post()
  @RequirePermission('education.courses.create')
  async create(@CurrentTenant() tenant: TenantContext, @Body() dto: any) {
    return this.service.create(tenant, dto);
  }

  @Patch(':id')
  @RequirePermission('education.courses.update')
  async update(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(tenant, id, dto);
  }
}
