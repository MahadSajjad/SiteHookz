import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { CreateSubjectDto, UpdateSubjectDto } from "@sitehookz/education";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";

@Injectable()
export class SubjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenant: TenantContext, data: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        organizationId: tenant.organizationId,
        name: data.name,
        code: data.code || "",
        description: data.description,
      },
    });
  }

  async findAll(tenant: TenantContext) {
    return this.prisma.subject.findMany({
      where: {
        organizationId: tenant.organizationId,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(tenant: TenantContext, id: string) {
    return this.prisma.subject.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },
    });
  }

  async update(tenant: TenantContext, id: string, data: UpdateSubjectDto) {
    return this.prisma.subject.update({
      where: {
        id,
        organizationId: tenant.organizationId,
      },
      data,
    });
  }

  async archive(tenant: TenantContext, id: string) {
    return this.prisma.subject.update({
      where: {
        id,
        organizationId: tenant.organizationId,
      },
      data: {
        isActive: false,
        archivedAt: new Date(),
      },
    });
  }
}
