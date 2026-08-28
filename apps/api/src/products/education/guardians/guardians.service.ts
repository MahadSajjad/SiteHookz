
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
    if (query.branchId) {
      where.studentGuardians = {
        some: {
          student: {
            enrollments: {
              some: {
                status: 'ACTIVE',
                branchId: query.branchId
              }
            }
          }
        }
      };
    }
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
