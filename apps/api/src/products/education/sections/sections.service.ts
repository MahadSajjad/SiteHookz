import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenant: TenantContext, query: any) {
    return this.prisma.section.findMany({
      where: { organizationId: tenant.organizationId },
    });
  }

  async findOne(tenant: TenantContext, id: string) {
    const item = await this.prisma.section.findUnique({
      where: { id, organizationId: tenant.organizationId },
    });
    if (!item) throw new NotFoundException("SECTION_NOT_FOUND");
    return item;
  }

  async create(tenant: TenantContext, dto: any) {
    if (
      (tenant as any).institutionType /* TEMP: TenantContext should include institutionType */ !== "SCHOOL"
    )
      throw new BadRequestException("EDUCATION_INSTITUTION_TYPE_MISMATCH");
    return this.prisma.section.create({
      data: { organizationId: tenant.organizationId, ...dto },
    });
  }

  async update(tenant: TenantContext, id: string, dto: any) {
    return this.prisma.section.update({
      where: { id, organizationId: tenant.organizationId },
      data: dto,
    });
  }
}
