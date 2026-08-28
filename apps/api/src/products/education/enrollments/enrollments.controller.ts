import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { RequirePermission, PermissionGuard } from '../../../platform/authorization/permission.guard';
import { CurrentTenant, TenantContext } from '../../../platform/tenancy/tenant.guard';

@Controller('education')
@UseGuards(PermissionGuard)
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Get('students/:studentId/enrollments')
  @RequirePermission('education.enrollments.read')
  async getStudentEnrollments(@CurrentTenant() tenant: TenantContext, @Param('studentId') studentId: string) {
    return this.service.getStudentEnrollments(tenant, studentId);
  }

  @Post('students/:studentId/enrollments/school')
  @RequirePermission('education.enrollments.create')
  async createSchoolEnrollment(@CurrentTenant() tenant: TenantContext, @Param('studentId') studentId: string, @Body() dto: any) {
    return this.service.createSchoolEnrollment(tenant, studentId, dto);
  }

  @Post('students/:studentId/enrollments/tuition')
  @RequirePermission('education.enrollments.create')
  async createTuitionEnrollment(@CurrentTenant() tenant: TenantContext, @Param('studentId') studentId: string, @Body() dto: any) {
    return this.service.createTuitionEnrollment(tenant, studentId, dto);
  }

  @Post('enrollments/:id/end')
  @RequirePermission('education.enrollments.end')
  async endEnrollment(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.endEnrollment(tenant, id, dto);
  }

  @Post('enrollments/:id/promote')
  @RequirePermission('education.enrollments.promote')
  async promote(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.promote(tenant, id, dto);
  }

  @Post('enrollments/:id/transfer')
  @RequirePermission('education.enrollments.transfer')
  async transfer(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.transfer(tenant, id, dto);
  }

  @Post('enrollments/:id/change-section')
  @RequirePermission('education.enrollments.transfer')
  async changeSection(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.changeSection(tenant, id, dto);
  }

  @Post('enrollments/:id/change-batch')
  @RequirePermission('education.enrollments.transfer')
  async changeBatch(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.changeBatch(tenant, id, dto);
  }
}
