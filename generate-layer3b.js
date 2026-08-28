const fs = require('fs');
const path = require('path');

const baseDir = path.join('apps', 'api', 'src', 'products', 'education');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
}

// 1. Class Levels
writeFile(path.join(baseDir, 'class-levels', 'class-levels.controller.ts'), `
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ClassLevelsService } from './class-levels.service';
import { RequirePermission, PermissionGuard } from '../../../platform/authorization/permission.guard';
import { CurrentTenant, TenantContext } from '../../../platform/tenancy/tenant.guard';

@Controller('education/class-levels')
@UseGuards(PermissionGuard)
export class ClassLevelsController {
  constructor(private readonly service: ClassLevelsService) {}

  @Get()
  @RequirePermission('education.class_levels.read')
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) {
    return this.service.findAll(tenant, query);
  }

  @Get(':id')
  @RequirePermission('education.class_levels.read')
  async findOne(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.service.findOne(tenant, id);
  }

  @Post()
  @RequirePermission('education.class_levels.create')
  async create(@CurrentTenant() tenant: TenantContext, @Body() dto: any) {
    return this.service.create(tenant, dto);
  }

  @Patch(':id')
  @RequirePermission('education.class_levels.update')
  async update(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(tenant, id, dto);
  }

  @Post(':id/archive')
  @RequirePermission('education.class_levels.archive')
  async archive(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.service.archive(tenant, id);
  }

  @Post(':id/restore')
  @RequirePermission('education.class_levels.restore')
  async restore(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.service.restore(tenant, id);
  }
}
`);

writeFile(path.join(baseDir, 'class-levels', 'class-levels.service.ts'), `
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TenantContext } from '../../../platform/tenancy/tenant.guard';

@Injectable()
export class ClassLevelsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenant: TenantContext, query: any) {
    return this.prisma.classLevel.findMany({ where: { organizationId: tenant.organizationId } });
  }

  async findOne(tenant: TenantContext, id: string) {
    const item = await this.prisma.classLevel.findUnique({ where: { id, organizationId: tenant.organizationId } });
    if (!item) throw new NotFoundException('CLASS_LEVEL_NOT_FOUND');
    return item;
  }

  async create(tenant: TenantContext, dto: any) {
    if (tenant.organization.institutionType !== 'SCHOOL') throw new BadRequestException('EDUCATION_INSTITUTION_TYPE_MISMATCH');
    return this.prisma.classLevel.create({ data: { organizationId: tenant.organizationId, ...dto } });
  }

  async update(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.classLevel.update({ where: { id, organizationId: tenant.organizationId }, data: dto });
  }

  async archive(tenant: TenantContext, id: string) {
    return this.prisma.classLevel.update({ where: { id, organizationId: tenant.organizationId }, data: { archivedAt: new Date() } });
  }

  async restore(tenant: TenantContext, id: string) {
    return this.prisma.classLevel.update({ where: { id, organizationId: tenant.organizationId }, data: { archivedAt: null } });
  }
}
`);

// 2. Sections
writeFile(path.join(baseDir, 'sections', 'sections.controller.ts'), `
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { RequirePermission, PermissionGuard } from '../../../platform/authorization/permission.guard';
import { CurrentTenant, TenantContext } from '../../../platform/tenancy/tenant.guard';

@Controller('education/sections')
@UseGuards(PermissionGuard)
export class SectionsController {
  constructor(private readonly service: SectionsService) {}

  @Get()
  @RequirePermission('education.sections.read')
  async findAll(@CurrentTenant() tenant: TenantContext, @Query() query: any) {
    return this.service.findAll(tenant, query);
  }

  @Get(':id')
  @RequirePermission('education.sections.read')
  async findOne(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.service.findOne(tenant, id);
  }

  @Post()
  @RequirePermission('education.sections.create')
  async create(@CurrentTenant() tenant: TenantContext, @Body() dto: any) {
    return this.service.create(tenant, dto);
  }

  @Patch(':id')
  @RequirePermission('education.sections.update')
  async update(@CurrentTenant() tenant: TenantContext, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(tenant, id, dto);
  }
}
`);

writeFile(path.join(baseDir, 'sections', 'sections.service.ts'), `
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TenantContext } from '../../../platform/tenancy/tenant.guard';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenant: TenantContext, query: any) {
    return this.prisma.section.findMany({ where: { organizationId: tenant.organizationId } });
  }

  async findOne(tenant: TenantContext, id: string) {
    const item = await this.prisma.section.findUnique({ where: { id, organizationId: tenant.organizationId } });
    if (!item) throw new NotFoundException('SECTION_NOT_FOUND');
    return item;
  }

  async create(tenant: TenantContext, dto: any) {
    if (tenant.organization.institutionType !== 'SCHOOL') throw new BadRequestException('EDUCATION_INSTITUTION_TYPE_MISMATCH');
    return this.prisma.section.create({ data: { organizationId: tenant.organizationId, ...dto } });
  }

  async update(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.section.update({ where: { id, organizationId: tenant.organizationId }, data: dto });
  }
}
`);

// Enrollments
writeFile(path.join(baseDir, 'enrollments', 'enrollments.controller.ts'), `
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
}
`);

writeFile(path.join(baseDir, 'enrollments', 'enrollments.service.ts'), `
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TenantContext } from '../../../platform/tenancy/tenant.guard';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async getStudentEnrollments(tenant: TenantContext, studentId: string) {
    return this.prisma.studentEnrollment.findMany({ 
      where: { organizationId: tenant.organizationId, studentId },
      include: { schoolPlacement: true, tuitionPlacement: true }
    });
  }

  async createSchoolEnrollment(tenant: TenantContext, studentId: string, dto: any) {
    if (tenant.organization.institutionType !== 'SCHOOL') throw new BadRequestException('EDUCATION_INSTITUTION_TYPE_MISMATCH');
    
    return this.prisma.$transaction(async (tx) => {
       const section = await tx.section.findUnique({ where: { id: dto.sectionId } });
       if (!section || section.organizationId !== tenant.organizationId) throw new NotFoundException('SECTION_NOT_FOUND');

       // Check invariant
       const active = await tx.studentEnrollment.findFirst({
         where: { organizationId: tenant.organizationId, studentId, placementType: 'SCHOOL', status: 'ACTIVE' }
       });
       if (active) throw new BadRequestException('ENROLLMENT_ACTIVE_SCHOOL_CONFLICT');

       const enrollment = await tx.studentEnrollment.create({
         data: {
           organizationId: tenant.organizationId,
           studentId,
           branchId: section.branchId,
           placementType: 'SCHOOL',
           status: dto.status || 'ACTIVE',
           startDate: new Date(dto.startDate)
         }
       });

       await tx.schoolEnrollmentPlacement.create({
         data: {
           organizationId: tenant.organizationId,
           enrollmentId: enrollment.id,
           sectionId: section.id,
           rollNumber: dto.rollNumber
         }
       });

       return enrollment;
    });
  }
}
`);

console.log('Scaffolding complete.');
