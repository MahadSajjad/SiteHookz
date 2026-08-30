import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenant: TenantContext, query: any) {
    return this.prisma.batch.findMany({
      where: { organizationId: tenant.organizationId },
    });
  }

  async findOne(tenant: TenantContext, id: string) {
    const item = await this.prisma.batch.findUnique({
      where: { id, organizationId: tenant.organizationId },
    });
    if (!item) throw new NotFoundException("BATCH_NOT_FOUND");
    return item;
  }

  async create(tenant: TenantContext, dto: any) {
    return this.prisma.batch.create({
      data: {
        organizationId: tenant.organizationId,
        startDate: new Date(),
        ...dto,
      },
    });
  }

  async update(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.batch.update({
      where: { id, organizationId: tenant.organizationId },
      data: dto,
    });
  }
}
