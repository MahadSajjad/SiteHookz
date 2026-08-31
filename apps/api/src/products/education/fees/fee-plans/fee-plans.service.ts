import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../platform/database/prisma.service';
import { CreateFeePlanDto, UpdateFeePlanDto, FeePlan, FeePlanType, FeePlanStatus, CreateFeePlanItemDto, UpdateFeePlanItemDto, FeePlanItem } from '@sitehookz/education';

@Injectable()
export class FeePlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, data: CreateFeePlanDto): Promise<FeePlan> {
    if (data.planType === FeePlanType.SCHOOL && !data.schoolContext) {
      throw new BadRequestException('School context is required for SCHOOL fee plans');
    }
    if (data.planType === FeePlanType.TUITION && !data.tuitionContext) {
      throw new BadRequestException('Tuition context is required for TUITION fee plans');
    }

    return await this.prisma.$transaction(async (tx) => {
      const plan = await tx.feePlan.create({
        data: {
          organizationId,
          name: data.name,
          planType: data.planType,
          defaultDueDay: data.defaultDueDay,
          schoolContext: data.planType === FeePlanType.SCHOOL ? {
            create: {
              organizationId,
              academicSessionId: data.schoolContext!.academicSessionId,
              branchId: data.schoolContext!.branchId,
              classLevelId: data.schoolContext!.classLevelId,
            },
          } : undefined,
          tuitionContext: data.planType === FeePlanType.TUITION ? {
            create: {
              organizationId,
              batchId: data.tuitionContext!.batchId,
            }
          } : undefined,
          items: {
            create: data.items?.map(item => ({
              organizationId,
              feeHeadId: item.feeHeadId,
              amount: item.amount,
              frequency: item.frequency,
              description: item.description,
              sortOrder: item.sortOrder ?? 0,
            })) || [],
          },
        },
        include: {
          schoolContext: true,
          tuitionContext: true,
          items: true,
        },
      });
      return plan as unknown as FeePlan;
    });
  }

  async findAll(organizationId: string): Promise<FeePlan[]> {
    const plans = await this.prisma.feePlan.findMany({
      where: { organizationId, archivedAt: null },
      include: {
        schoolContext: true,
        tuitionContext: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return plans as unknown as FeePlan[];
  }

  async findOne(organizationId: string, id: string): Promise<FeePlan> {
    const plan = await this.prisma.feePlan.findUnique({
      where: { id, organizationId, archivedAt: null },
      include: {
        schoolContext: true,
        tuitionContext: true,
        items: true,
      },
    });
    if (!plan) throw new NotFoundException('Fee plan not found');
    return plan as unknown as FeePlan;
  }

  async update(organizationId: string, id: string, data: UpdateFeePlanDto): Promise<FeePlan> {
    const existing = await this.findOne(organizationId, id);
    if (existing.status !== FeePlanStatus.DRAFT) {
      throw new BadRequestException('Cannot modify a non-draft fee plan');
    }

    return await this.prisma.$transaction(async (tx) => {
      if (data.items) {
        // Simple replace items for update in DRAFT mode
        await tx.feePlanItem.deleteMany({
          where: { feePlanId: id, organizationId },
        });

        if (data.items.length > 0) {
          await tx.feePlanItem.createMany({
            data: data.items.map(item => ({
              organizationId,
              feePlanId: id,
              feeHeadId: item.feeHeadId,
              amount: item.amount,
              frequency: item.frequency,
              description: item.description,
              sortOrder: item.sortOrder ?? 0,
            })),
          });
        }
      }

      const updated = await tx.feePlan.update({
        where: { id, organizationId },
        data: {
          name: data.name,
          defaultDueDay: data.defaultDueDay,
        },
        include: {
          schoolContext: true,
          tuitionContext: true,
          items: true,
        },
      });

      return updated as unknown as FeePlan;
    });
  }

  async activate(organizationId: string, id: string): Promise<FeePlan> {
    const existing = await this.findOne(organizationId, id);
    if (existing.status !== FeePlanStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT fee plans can be activated');
    }

    const updated = await this.prisma.feePlan.update({
      where: { id, organizationId },
      data: { status: FeePlanStatus.ACTIVE },
      include: {
        schoolContext: true,
        tuitionContext: true,
        items: true,
      },
    });

    return updated as unknown as FeePlan;
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const existing = await this.findOne(organizationId, id);
    if (existing.status === FeePlanStatus.ACTIVE) {
      throw new BadRequestException('Cannot archive an active fee plan. Archive not fully supported here, check requirements.');
    }

    await this.prisma.feePlan.update({
      where: { id, organizationId },
      data: { archivedAt: new Date(), status: FeePlanStatus.ARCHIVED },
    });
  }
}
