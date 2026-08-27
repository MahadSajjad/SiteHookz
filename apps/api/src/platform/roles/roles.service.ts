import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.role.findMany({ where: { organizationId } });
  }

  async create(organizationId: string, dto: any) {
    return this.prisma.role.create({
      data: {
        organizationId,
        name: dto.name,
        type: 'CUSTOM',
        scopeType: dto.scopeType,
        key: dto.key
      }
    });
  }

  async delete(organizationId: string, roleId: string) {
    const role = await this.prisma.role.findFirst({ where: { id: roleId, organizationId } });
    if (!role) throw new BusinessException('ROLE_NOT_FOUND', 404, 'Role not found');
    if (role.type === 'SYSTEM') throw new BusinessException('ROLE_SYSTEM_PROTECTED', 403, 'Cannot delete system role');

    await this.prisma.role.delete({ where: { id: roleId } });
    return { success: true };
  }
}
