
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
import { RequirePermission } from '../../../platform/authorization/require-permission.decorator';
import { PermissionGuard } from '../../../platform/authorization/permission.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { CurrentTenant, TenantContext } from '../../../platform/tenancy/tenant.guard';
import { createGuardianSchema, CreateGuardianDto, updateGuardianSchema, UpdateGuardianDto, linkGuardianSchema, LinkGuardianDto } from './dto/create-guardian.dto';

@Controller('education')
@UseGuards(PermissionGuard)
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Get('guardians')
  @RequirePermission('education.guardians.read')
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) {
    return this.guardiansService.findAll(tenant, query);
  }

  @Get('guardians/:id')
  @RequirePermission('education.guardians.read')
  async findOne(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.guardiansService.findOne(tenant, id);
  }

  @Post('guardians')
  @RequirePermission('education.guardians.create')
  async create(@CurrentTenant() tenant: TenantContext, @Body(new ZodValidationPipe(createGuardianSchema)) dto: CreateGuardianDto) {
    return this.guardiansService.create(tenant, dto);
  }

  @Patch('guardians/:id')
  @RequirePermission('education.guardians.update')
  async update(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body(new ZodValidationPipe(updateGuardianSchema)) dto: UpdateGuardianDto) {
    return this.guardiansService.update(tenant, id, dto);
  }
  
  @Post('guardians/:id/archive')
  @RequirePermission('education.guardians.archive')
  async archive(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.guardiansService.archive(tenant, id);
  }
  
  @Post('guardians/:id/restore')
  @RequirePermission('education.guardians.restore')
  async restore(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.guardiansService.restore(tenant, id);
  }

  @Get('students/:studentId/guardians')
  @RequirePermission('education.student_guardians.read')
  async getStudentGuardians(@CurrentTenant() tenant: TenantContext, @Param('studentId') studentId: string) {
    return this.guardiansService.getStudentGuardians(tenant, studentId);
  }

  @Post('students/:studentId/guardians')
  @RequirePermission('education.student_guardians.manage')
  async linkGuardian(@CurrentTenant() tenant: TenantContext, @Param('studentId') studentId: string, @Body(new ZodValidationPipe(linkGuardianSchema)) dto: LinkGuardianDto) {
    return this.guardiansService.linkGuardian(tenant, studentId, dto);
  }

  @Delete('students/:studentId/guardians/:relationshipId')
  @RequirePermission('education.student_guardians.manage')
  async unlinkGuardian(@CurrentTenant() tenant: TenantContext, @Param('studentId') studentId: string, @Param('relationshipId') relationshipId: string) {
    return this.guardiansService.unlinkGuardian(tenant, studentId, relationshipId);
  }
}
