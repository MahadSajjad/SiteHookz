import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";
import {
  CreateFeeHeadDto,
  UpdateFeeHeadDto,
  FeeHead,
} from "@sitehookz/education";

@Injectable()
export class FeeHeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    organizationId: string,
    data: CreateFeeHeadDto,
  ): Promise<FeeHead> {
    const existing = await this.prisma.feeHead.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Fee head with code ${data.code} already exists`,
      );
    }

    const created = await this.prisma.feeHead.create({
      data: {
        organizationId,
        ...data,
      },
    });

    return {
      ...created,
      archivedAt: created.archivedAt ?? undefined,
      description: created.description ?? undefined,
    } as unknown as FeeHead; // coercing dates as strings for DTO
  }

  async findAll(organizationId: string): Promise<FeeHead[]> {
    const records = await this.prisma.feeHead.findMany({
      where: { organizationId, archivedAt: null },
      orderBy: { name: "asc" },
    });
    return records as unknown as FeeHead[];
  }

  async findOne(organizationId: string, id: string): Promise<FeeHead> {
    const record = await this.prisma.feeHead.findUnique({
      where: { id, organizationId, archivedAt: null },
    });
    if (!record) {
      throw new NotFoundException("Fee head not found");
    }
    return record as unknown as FeeHead;
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateFeeHeadDto,
  ): Promise<FeeHead> {
    await this.findOne(organizationId, id);

    if (data.code) {
      const existing = await this.prisma.feeHead.findFirst({
        where: {
          organizationId,
          code: data.code,
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Fee head with code ${data.code} already exists`,
        );
      }
    }

    const updated = await this.prisma.feeHead.update({
      where: { id, organizationId },
      data,
    });

    return updated as unknown as FeeHead;
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.findOne(organizationId, id);
    await this.prisma.feeHead.update({
      where: { id, organizationId },
      data: { archivedAt: new Date(), isActive: false },
    });
  }
}
