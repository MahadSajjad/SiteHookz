const fs = require('fs');
const path = require('path');
const dir = 'apps/api/src/products/education/guardians';
fs.mkdirSync(path.join(dir, 'dto'), { recursive: true });

const createDto = `
import { z } from 'zod';
import { GuardianRelationship } from '@sitehookz/database';

export const createGuardianSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  alternatePhone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  nationalId: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  employer: z.string().optional().nullable(),
});
export type CreateGuardianDto = z.infer<typeof createGuardianSchema>;
export const updateGuardianSchema = createGuardianSchema.partial();
export type UpdateGuardianDto = z.infer<typeof updateGuardianSchema>;

export const linkGuardianSchema = z.object({
  guardianId: z.string().uuid(),
  relationship: z.nativeEnum(GuardianRelationship),
  isPrimary: z.boolean().default(false),
});
export type LinkGuardianDto = z.infer<typeof linkGuardianSchema>;
`;
fs.writeFileSync(path.join(dir, 'dto', 'create-guardian.dto.ts'), createDto, 'utf8');

const controller = `
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
`;
fs.writeFileSync(path.join(dir, 'guardians.controller.ts'), controller, 'utf8');

const service = `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TenantContext } from '../../../platform/tenancy/tenant.guard';
import { AuthorizationService } from '../../../platform/authorization/authorization.service';
import { CreateGuardianDto, UpdateGuardianDto, LinkGuardianDto } from './dto/create-guardian.dto';

@Injectable()
export class GuardiansService {
  constructor(private prisma: PrismaService, private auth: AuthorizationService) {}

  async findAll(tenant: TenantContext, query: any) {
    const where: any = { organizationId: tenant.organizationId, archivedAt: null };
    const items = await this.prisma.guardian.findMany({ where, take: 20 });
    return { items, total: items.length, page: 1, limit: 20 };
  }

  async findOne(tenant: TenantContext, id: string) {
    const item = await this.prisma.guardian.findUnique({ where: { id, organizationId: tenant.organizationId }, include: { studentGuardians: { include: { student: true } } } });
    if (!item) throw new NotFoundException('GUARDIAN_NOT_FOUND');
    return item;
  }

  async create(tenant: TenantContext, dto: CreateGuardianDto) {
    return this.prisma.guardian.create({ data: { organizationId: tenant.organizationId, ...dto } });
  }

  async update(tenant: TenantContext, id: string, dto: UpdateGuardianDto) {
    return this.prisma.guardian.update({ where: { id, organizationId: tenant.organizationId }, data: dto });
  }

  async archive(tenant: TenantContext, id: string) {
    return this.prisma.guardian.update({ where: { id, organizationId: tenant.organizationId }, data: { archivedAt: new Date() } });
  }

  async restore(tenant: TenantContext, id: string) {
    return this.prisma.guardian.update({ where: { id, organizationId: tenant.organizationId }, data: { archivedAt: null } });
  }

  async getStudentGuardians(tenant: TenantContext, studentId: string) {
    return this.prisma.studentGuardian.findMany({ where: { studentId, organizationId: tenant.organizationId }, include: { guardian: true } });
  }

  async linkGuardian(tenant: TenantContext, studentId: string, dto: LinkGuardianDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.studentGuardian.updateMany({ where: { studentId, organizationId: tenant.organizationId, isPrimary: true }, data: { isPrimary: false } });
      }
      return tx.studentGuardian.create({
        data: {
          organizationId: tenant.organizationId,
          studentId,
          guardianId: dto.guardianId,
          relationship: dto.relationship,
          isPrimary: dto.isPrimary,
        }
      });
    });
  }

  async unlinkGuardian(tenant: TenantContext, studentId: string, relationshipId: string) {
    return this.prisma.studentGuardian.delete({ where: { id: relationshipId, studentId, organizationId: tenant.organizationId } });
  }
}
`;
fs.writeFileSync(path.join(dir, 'guardians.service.ts'), service, 'utf8');
