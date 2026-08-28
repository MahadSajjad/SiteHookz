
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { RequirePermission } from '../../../platform/authorization/require-permission.decorator';
import { PermissionGuard } from '../../../platform/authorization/permission.guard';
import { CurrentTenant, TenantContext } from '../../../platform/tenancy/tenant.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createStaffSchema, createPositionSchema, assignBranchSchema } from './dto/staff.dto';

@Controller('education')
@UseGuards(PermissionGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('staff')
  @RequirePermission('education.staff.read')
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) { return this.staffService.findAll(tenant, query); }

  @Get('staff/:id')
  @RequirePermission('education.staff.read')
  async findOne(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) { return this.staffService.findOne(tenant, id); }

  @Post('staff')
  @RequirePermission('education.staff.create')
  async create(@CurrentTenant() tenant: TenantContext, @Body(new ZodValidationPipe(createStaffSchema)) dto: any) { return this.staffService.create(tenant, dto); }

  @Get('staff-positions')
  @RequirePermission('education.staff_positions.read')
  async findPositions(@CurrentTenant() tenant: TenantContext) { return this.staffService.findPositions(tenant); }

  @Post('staff-positions')
  @RequirePermission('education.staff_positions.create')
  async createPosition(@CurrentTenant() tenant: TenantContext, @Body(new ZodValidationPipe(createPositionSchema)) dto: any) { return this.staffService.createPosition(tenant, dto); }

  @Get('staff/:staffId/assignments')
  @RequirePermission('education.staff_assignments.read')
  async getAssignments(@CurrentTenant() tenant: TenantContext, @Param('staffId') staffId: string) { return this.staffService.getAssignments(tenant, staffId); }

  @Post('staff/:staffId/assignments')
  @RequirePermission('education.staff_assignments.create')
  async createAssignment(@CurrentTenant() tenant: TenantContext, @Param('staffId') staffId: string, @Body(new ZodValidationPipe(assignBranchSchema)) dto: any) { return this.staffService.createAssignment(tenant, staffId, dto); }

  @Post('staff/:staffId/assignments/:assignmentId/end')
  @RequirePermission('education.staff_assignments.end')
  async endAssignment(@CurrentTenant() tenant: TenantContext, @Param('staffId') staffId: string, @Param('assignmentId') assignmentId: string) { return this.staffService.endAssignment(tenant, staffId, assignmentId); }
}
