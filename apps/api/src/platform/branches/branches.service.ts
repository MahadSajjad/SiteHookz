import { Injectable } from "@nestjs/common";

import { BusinessException } from "../../common/exceptions/business.exception";
import { PrismaService } from "../../infrastructure/database/prisma.service";

import { CreateBranchDto } from "./dto/create-branch.dto";

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateBranchDto) {
    const code = dto.code.trim().toUpperCase().replace(/\s+/g, "-");

    const existing = await this.prisma.branch.findFirst({
      where: { organizationId, code },
    });

    if (existing) {
      throw new BusinessException(
        "BRANCH_CODE_ALREADY_EXISTS",
        409,
        "Branch code must be unique within organization",
      );
    }

    return this.prisma.branch.create({
      data: {
        organizationId,
        name: dto.name,
        code,
        status: "ACTIVE",
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.branch.findMany({
      where: { organizationId },
    });
  }

  async archive(organizationId: string, branchId: string) {
    return this.prisma.branch.updateMany({
      where: { id: branchId, organizationId },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    });
  }
}
