import { Injectable } from "@nestjs/common";

import { BusinessException } from "../../../common/exceptions/business.exception";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

@Injectable()
export class AcademicSessionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.academicSession.findMany({
      where: { organizationId },
    });
  }

  async create(organizationId: string, dto: any) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.academicSession.findFirst({
      where: { organizationId, code },
    });

    if (existing)
      throw new BusinessException(
        "ACADEMIC_SESSION_CODE_ALREADY_EXISTS",
        409,
        "Session code must be unique",
      );

    return this.prisma.academicSession.create({
      data: {
        organizationId,
        name: dto.name,
        code,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: "PLANNED",
      },
    });
  }
}
