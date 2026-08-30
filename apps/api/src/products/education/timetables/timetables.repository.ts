import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { Prisma } from "@sitehookz/database";

@Injectable()
export class TimetablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findScheduleById(organizationId: string, id: string) {
    return this.prisma.timetableSchedule.findUnique({
      where: {
        id,
        organizationId,
      },
      include: {
        schoolContext: true,
        tuitionContext: true,
      },
    });
  }

  async findSchedulesByContainer(
    organizationId: string,
    containerId: string,
    containerType: "SCHOOL" | "TUITION",
  ) {
    if (containerType === "SCHOOL") {
      return this.prisma.timetableSchedule.findMany({
        where: {
          organizationId,
          schoolContext: { sectionId: containerId },
        },
        orderBy: { effectiveFrom: "desc" },
      });
    } else {
      return this.prisma.timetableSchedule.findMany({
        where: {
          organizationId,
          tuitionContext: { batchId: containerId },
        },
        orderBy: { effectiveFrom: "desc" },
      });
    }
  }

  async createSchoolSchedule(data: {
    organizationId: string;
    branchId: string;
    name: string;
    effectiveFrom: Date;
    effectiveTo?: Date | null;
    sectionId: string;
  }) {
    return this.prisma.timetableSchedule.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        scheduleType: "SCHOOL",
        name: data.name,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        status: "DRAFT",
        schoolContext: {
          create: {
            organizationId: data.organizationId,
            sectionId: data.sectionId,
          },
        },
      },
      include: {
        schoolContext: true,
      },
    });
  }

  async createTuitionSchedule(data: {
    organizationId: string;
    branchId: string;
    name: string;
    effectiveFrom: Date;
    effectiveTo?: Date | null;
    batchId: string;
  }) {
    return this.prisma.timetableSchedule.create({
      data: {
        organizationId: data.organizationId,
        branchId: data.branchId,
        scheduleType: "TUITION",
        name: data.name,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        status: "DRAFT",
        tuitionContext: {
          create: {
            organizationId: data.organizationId,
            batchId: data.batchId,
          },
        },
      },
      include: {
        tuitionContext: true,
      },
    });
  }

  async updateScheduleStatus(
    organizationId: string,
    id: string,
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
    membershipId: string,
  ) {
    const updateData: Prisma.TimetableScheduleUpdateInput = { status };
    if (status === "PUBLISHED") {
      updateData.publishedAt = new Date();
      updateData.publishedByMembershipId = membershipId;
    } else if (status === "ARCHIVED") {
      updateData.archivedAt = new Date();
      updateData.archivedByMembershipId = membershipId;
    }

    return this.prisma.timetableSchedule.update({
      where: {
        id,
        organizationId,
      },
      data: updateData,
    });
  }

  async acquireScheduleLock(
    tx: Prisma.TransactionClient,
    organizationId: string,
    id: string,
  ) {
    const results = await tx.$queryRaw<
      {
        id: string;
        status: string;
        effectiveFrom: Date;
        effectiveTo: Date | null;
      }[]
    >`
      SELECT "id", "status", "effectiveFrom", "effectiveTo"
      FROM "TimetableSchedule"
      WHERE "id" = ${id}::uuid AND "organizationId" = ${organizationId}::uuid
      FOR UPDATE
    `;
    return results[0] || null;
  }
}
