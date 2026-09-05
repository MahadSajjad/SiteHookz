import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../../platform/tenancy/tenant.guard";
import {
  CreateGradingScaleDto,
  UpdateGradingScaleDto,
  GradingScale,
  GradingScaleStatus,
} from "@sitehookz/education";
import { Prisma } from "@sitehookz/database";
import { BusinessException } from "../../../../common/exceptions/business.exception";

const Decimal = Prisma.Decimal;

@Injectable()
export class GradingScalesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapGradingScale(scale: any): GradingScale {
    return {
      id: scale.id,
      organizationId: scale.organizationId,
      name: scale.name,
      status: scale.status as GradingScaleStatus,
      description: scale.description,
      createdAt: scale.createdAt,
      updatedAt: scale.updatedAt,
      bands: scale.bands
        ? scale.bands.map((band: any) => ({
            id: band.id,
            gradingScaleId: band.gradingScaleId,
            name: band.name,
            code: band.code,
            minimumPercentage: Number(band.minimumPercentage),
            isPassing: band.isPassing,
            remarks: band.remarks,
            createdAt: band.createdAt,
            updatedAt: band.updatedAt,
          }))
        : [],
    };
  }

  async create(
    ctx: TenantContext,
    dto: CreateGradingScaleDto,
  ): Promise<GradingScale> {
    const codes = dto.bands.map((b) => b.code.trim().toUpperCase());
    if (new Set(codes).size !== codes.length) {
      throw new BusinessException(
        "GRADING_SCALE_DUPLICATE_BAND_CODE",
        400,
        "Grading scale band codes must be unique",
      );
    }

    const created = await this.prisma.gradingScale.create({
      data: {
        organizationId: ctx.organizationId,
        name: dto.name,
        description: dto.description,
        status: GradingScaleStatus.DRAFT,
        bands: {
          create: dto.bands.map((b) => ({
            name: b.name,
            code: b.code.trim().toUpperCase(),
            minimumPercentage: new Decimal(b.minimumPercentage),
            isPassing: b.isPassing,
            remarks: b.remarks,
          })),
        },
      },
      include: {
        bands: {
          orderBy: {
            minimumPercentage: "desc",
          },
        },
      },
    });

    return this.mapGradingScale(created);
  }

  async findAll(
    ctx: TenantContext,
    status?: GradingScaleStatus,
  ): Promise<GradingScale[]> {
    const scales = await this.prisma.gradingScale.findMany({
      where: {
        organizationId: ctx.organizationId,
        ...(status ? { status } : {}),
      },
      include: {
        bands: {
          orderBy: {
            minimumPercentage: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return scales.map((s) => this.mapGradingScale(s));
  }

  async findById(ctx: TenantContext, id: string): Promise<GradingScale> {
    const scale = await this.prisma.gradingScale.findUnique({
      where: { id },
      include: {
        bands: {
          orderBy: {
            minimumPercentage: "desc",
          },
        },
      },
    });

    if (!scale) {
      throw new BusinessException(
        "GRADING_SCALE_NOT_FOUND",
        404,
        "Grading scale not found",
      );
    }

    if (scale.organizationId !== ctx.organizationId) {
      throw new BusinessException(
        "EDUCATION_CROSS_TENANT_REFERENCE",
        403,
        "Cross-tenant reference not allowed",
      );
    }

    return this.mapGradingScale(scale);
  }

  async update(
    ctx: TenantContext,
    id: string,
    dto: UpdateGradingScaleDto,
  ): Promise<GradingScale> {
    const existing = await this.prisma.gradingScale.findUnique({
      where: { id },
      include: { bands: true },
    });

    if (!existing) {
      throw new BusinessException(
        "GRADING_SCALE_NOT_FOUND",
        404,
        "Grading scale not found",
      );
    }

    if (existing.organizationId !== ctx.organizationId) {
      throw new BusinessException(
        "EDUCATION_CROSS_TENANT_REFERENCE",
        403,
        "Cross-tenant reference not allowed",
      );
    }

    // Validate status transition: DRAFT -> ACTIVE -> ARCHIVED
    if (dto.status && dto.status !== existing.status) {
      this.validateStatusTransition(
        existing.status as GradingScaleStatus,
        dto.status as GradingScaleStatus,
      );
    }

    // Validate bands modification: Bands can only be edited while DRAFT
    if (dto.bands !== undefined) {
      if (existing.status !== GradingScaleStatus.DRAFT) {
        throw new BusinessException(
          "GRADING_SCALE_CANNOT_EDIT_BANDS",
          400,
          "Bands can only be edited while grading scale is in DRAFT status",
        );
      }

      const codes = dto.bands.map((b) => b.code.trim().toUpperCase());
      if (new Set(codes).size !== codes.length) {
        throw new BusinessException(
          "GRADING_SCALE_DUPLICATE_BAND_CODE",
          400,
          "Grading scale band codes must be unique",
        );
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.bands !== undefined && existing.status === GradingScaleStatus.DRAFT) {
        await tx.gradingScaleBand.deleteMany({
          where: { gradingScaleId: id },
        });

        await tx.gradingScaleBand.createMany({
          data: dto.bands.map((b) => ({
            gradingScaleId: id,
            name: b.name,
            code: b.code.trim().toUpperCase(),
            minimumPercentage: new Decimal(b.minimumPercentage),
            isPassing: b.isPassing,
            remarks: b.remarks,
          })),
        });
      }

      return tx.gradingScale.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          status: dto.status,
        },
        include: {
          bands: {
            orderBy: {
              minimumPercentage: "desc",
            },
          },
        },
      });
    });

    return this.mapGradingScale(updated);
  }

  async activate(ctx: TenantContext, id: string): Promise<GradingScale> {
    return this.update(ctx, id, { status: GradingScaleStatus.ACTIVE });
  }

  async archive(ctx: TenantContext, id: string): Promise<GradingScale> {
    return this.update(ctx, id, { status: GradingScaleStatus.ARCHIVED });
  }

  private validateStatusTransition(
    current: GradingScaleStatus,
    target: GradingScaleStatus,
  ) {
    if (current === target) return;

    if (current === GradingScaleStatus.DRAFT && target === GradingScaleStatus.ACTIVE) {
      return;
    }

    if (current === GradingScaleStatus.ACTIVE && target === GradingScaleStatus.ARCHIVED) {
      return;
    }

    throw new BusinessException(
      "GRADING_SCALE_INVALID_STATUS_TRANSITION",
      400,
      `Invalid grading scale status transition from ${current} to ${target}. Allowed: DRAFT -> ACTIVE -> ARCHIVED`,
    );
  }
}
