import { Controller, Get, Post, Body } from '@nestjs/common';
import { AcademicSessionsService } from './academic-sessions.service';
import { TenantContext } from '../../../common/decorators/tenant-context.decorator';
import { RequirePermission } from '../../../platform/authorization/permission.guard';

@Controller('education/academic-sessions')
export class AcademicSessionsController {
  constructor(private sessionsService: AcademicSessionsService) {}

  @RequirePermission('education.academic_sessions.read')
  @Get()
  async findAll(@TenantContext() tenant: any) {
    return this.sessionsService.findAll(tenant.organizationId);
  }

  @RequirePermission('education.academic_sessions.create')
  @Post()
  async create(@TenantContext() tenant: any, @Body() dto: any) {
    return this.sessionsService.create(tenant.organizationId, dto);
  }
}
