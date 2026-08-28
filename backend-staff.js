const fs = require('fs');
const path = require('path');
const dir = 'apps/api/src/products/education/staff';
fs.mkdirSync(path.join(dir, 'dto'), { recursive: true });

const dto = `
import { z } from 'zod';
import { EmploymentStatus, StaffPositionCategory } from '@sitehookz/database';

export const createStaffSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  employeeNumber: z.string().optional().nullable(),
});

export const createPositionSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  category: z.nativeEnum(StaffPositionCategory).optional().nullable(),
  description: z.string().optional().nullable(),
});

export const assignBranchSchema = z.object({
  branchId: z.string().uuid(),
  positionId: z.string().uuid(),
  startDate: z.string().datetime(),
  isPrimary: z.boolean().default(false),
});
`;
fs.writeFileSync(path.join(dir, 'dto', 'staff.dto.ts'), dto, 'utf8');

const controller = `
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
`;
fs.writeFileSync(path.join(dir, 'staff.controller.ts'), controller, 'utf8');

const service = `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TenantContext } from '../../../platform/tenancy/tenant.guard';
import { AuthorizationService } from '../../../platform/authorization/authorization.service';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService, private auth: AuthorizationService) {}

  async findAll(tenant: TenantContext, query: any) { return { items: await this.prisma.staffMember.findMany({ where: { organizationId: tenant.organizationId, archivedAt: null }, take: 20 }) }; }
  async findOne(tenant: TenantContext, id: string) { return this.prisma.staffMember.findUnique({ where: { id, organizationId: tenant.organizationId }, include: { assignments: { include: { position: true, branch: true } } } }); }
  async create(tenant: TenantContext, dto: any) { return this.prisma.staffMember.create({ data: { organizationId: tenant.organizationId, ...dto } }); }
  
  async findPositions(tenant: TenantContext) { return this.prisma.staffPosition.findMany({ where: { organizationId: tenant.organizationId, archivedAt: null } }); }
  async createPosition(tenant: TenantContext, dto: any) { return this.prisma.staffPosition.create({ data: { organizationId: tenant.organizationId, ...dto } }); }

  async getAssignments(tenant: TenantContext, staffMemberId: string) { return this.prisma.staffBranchAssignment.findMany({ where: { staffMemberId, organizationId: tenant.organizationId }, include: { position: true, branch: true } }); }
  async createAssignment(tenant: TenantContext, staffMemberId: string, dto: any) {
    this.auth.assertPermission(tenant, 'education.staff_assignments.create', dto.branchId);
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.staffBranchAssignment.updateMany({ where: { staffMemberId, organizationId: tenant.organizationId, isPrimary: true, endDate: null }, data: { isPrimary: false } });
      }
      return tx.staffBranchAssignment.create({ data: { organizationId: tenant.organizationId, staffMemberId, ...dto } });
    });
  }
  async endAssignment(tenant: TenantContext, staffMemberId: string, assignmentId: string) {
    const assignment = await this.prisma.staffBranchAssignment.findUnique({ where: { id: assignmentId } });
    if (assignment) this.auth.assertPermission(tenant, 'education.staff_assignments.end', assignment.branchId);
    return this.prisma.staffBranchAssignment.update({ where: { id: assignmentId, organizationId: tenant.organizationId }, data: { endDate: new Date() } });
  }
}
`;
fs.writeFileSync(path.join(dir, 'staff.service.ts'), service, 'utf8');
