const fs = require('fs');
const path = require('path');

const dir = 'apps/api/src/products/education/students';
fs.mkdirSync(path.join(dir, 'dto'), { recursive: true });

const createStudentDto = `
import { z } from 'zod';
import { Gender, StudentStatus } from '@sitehookz/database';

export const createStudentSchema = z.object({
  firstName: z.string().min(1).max(255),
  middleName: z.string().max(255).optional().nullable(),
  lastName: z.string().max(255).optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  admissionDate: z.string().datetime().optional().nullable(),
  admissionBranchId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(StudentStatus).optional().default(StudentStatus.ACTIVE),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = createStudentSchema.partial();
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
`;

fs.writeFileSync(path.join(dir, 'dto', 'create-student.dto.ts'), createStudentDto, 'utf8');

const controller = `
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { RequirePermission } from '../../../platform/authorization/require-permission.decorator';
import { PermissionGuard } from '../../../platform/authorization/permission.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createStudentSchema, CreateStudentDto, updateStudentSchema, UpdateStudentDto } from './dto/create-student.dto';
import { CurrentTenant, TenantContext } from '../../../platform/tenancy/tenant.guard';
import { z } from 'zod';

const querySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  gender: z.string().optional(),
  admissionBranchId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['createdAt', 'firstName', 'admissionNumber']).default('createdAt'),
  dir: z.enum(['asc', 'desc']).default('desc'),
});

@Controller('education/students')
@UseGuards(PermissionGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @RequirePermission('education.students.read')
  async findAll(@CurrentTenant() tenant: TenantContext, @Query(new ZodValidationPipe(querySchema)) query: any) {
    return this.studentsService.findAll(tenant, query);
  }

  @Get(':id')
  @RequirePermission('education.students.read')
  async findOne(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.studentsService.findOne(tenant, id);
  }

  @Post()
  @RequirePermission('education.students.create')
  async create(@CurrentTenant() tenant: TenantContext, @Body(new ZodValidationPipe(createStudentSchema)) dto: CreateStudentDto) {
    return this.studentsService.create(tenant, dto);
  }

  @Patch(':id')
  @RequirePermission('education.students.update')
  async update(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateStudentSchema)) dto: UpdateStudentDto
  ) {
    return this.studentsService.update(tenant, id, dto);
  }

  @Post(':id/archive')
  @RequirePermission('education.students.archive')
  async archive(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.studentsService.archive(tenant, id);
  }

  @Post(':id/restore')
  @RequirePermission('education.students.restore')
  async restore(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.studentsService.restore(tenant, id);
  }
}
`;

fs.writeFileSync(path.join(dir, 'students.controller.ts'), controller, 'utf8');

const service = `
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/create-student.dto';
import { TenantContext } from '../../../platform/tenancy/tenant.guard';
import { AuthorizationService } from '../../../platform/authorization/authorization.service';
import { BusinessException } from '../../../common/exceptions/business.exception';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private auth: AuthorizationService
  ) {}

  async findAll(tenant: TenantContext, query: any) {
    const { search, status, gender, admissionBranchId, page, limit, sort, dir } = query;
    const where: any = { organizationId: tenant.organizationId, archivedAt: null };

    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (admissionBranchId) where.admissionBranchId = admissionBranchId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort]: dir },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(tenant: TenantContext, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id, organizationId: tenant.organizationId },
      include: {
        admissionBranch: true,
        studentGuardians: {
          include: { guardian: true }
        }
      }
    });
    
    if (!student) throw new NotFoundException('STUDENT_NOT_FOUND');
    
    if (student.admissionBranchId) {
      this.auth.assertPermission(tenant, 'education.students.read', student.admissionBranchId);
    }
    return student;
  }

  async create(tenant: TenantContext, dto: CreateStudentDto) {
    if (dto.admissionBranchId) {
      this.auth.assertPermission(tenant, 'education.students.create', dto.admissionBranchId);
    }

    return this.prisma.$transaction(async (tx) => {
      // admission number generation
      const prefix = dto.admissionBranchId ? 'B' + dto.admissionBranchId.substring(0,4).toUpperCase() : 'MAIN';
      
      const seq = await tx.studentAdmissionSequence.upsert({
        where: { organizationId_branchPrefix: { organizationId: tenant.organizationId, branchPrefix: prefix } },
        update: { nextValue: { increment: 1 } },
        create: { organizationId: tenant.organizationId, branchPrefix: prefix, nextValue: 2 },
      });

      const admissionNumber = \`\${prefix}-\${String(seq.nextValue - 1).padStart(6, '0')}\`;

      return tx.student.create({
        data: {
          organizationId: tenant.organizationId,
          admissionNumber,
          firstName: dto.firstName,
          middleName: dto.middleName,
          lastName: dto.lastName,
          dateOfBirth: dto.dateOfBirth,
          gender: dto.gender,
          phone: dto.phone,
          email: dto.email,
          admissionDate: dto.admissionDate,
          admissionBranchId: dto.admissionBranchId,
          status: dto.status,
        }
      });
    });
  }

  async update(tenant: TenantContext, id: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id, organizationId: tenant.organizationId }
    });
    if (!student) throw new NotFoundException('STUDENT_NOT_FOUND');
    if (student.admissionBranchId) {
      this.auth.assertPermission(tenant, 'education.students.update', student.admissionBranchId);
    }

    return this.prisma.student.update({
      where: { id },
      data: dto
    });
  }

  async archive(tenant: TenantContext, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id, organizationId: tenant.organizationId }
    });
    if (!student) throw new NotFoundException('STUDENT_NOT_FOUND');
    if (student.archivedAt) throw new BusinessException('STUDENT_ALREADY_ARCHIVED', 400, 'Already archived');

    if (student.admissionBranchId) {
      this.auth.assertPermission(tenant, 'education.students.archive', student.admissionBranchId);
    }

    return this.prisma.student.update({
      where: { id },
      data: { archivedAt: new Date() }
    });
  }

  async restore(tenant: TenantContext, id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id, organizationId: tenant.organizationId }
    });
    if (!student) throw new NotFoundException('STUDENT_NOT_FOUND');
    if (student.admissionBranchId) {
      this.auth.assertPermission(tenant, 'education.students.restore', student.admissionBranchId);
    }

    return this.prisma.student.update({
      where: { id },
      data: { archivedAt: null }
    });
  }
}
`;

fs.writeFileSync(path.join(dir, 'students.service.ts'), service, 'utf8');
