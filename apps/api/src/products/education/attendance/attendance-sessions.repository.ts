import { Injectable } from "@nestjs/common";
import {
  Prisma,
  AttendanceMode,
  AttendanceSessionStatus,
} from "@sitehookz/database";
import { CreateAttendanceSessionDto } from "./dto/attendance.dto";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import { BusinessException } from "../../../common/exceptions/business.exception";

@Injectable()
export class AttendanceSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createForSection(
    tenant: TenantContext,
    sectionId: string,
    data: CreateAttendanceSessionDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Find section to get branchId
      const section = await tx.section.findFirstOrThrow({
        where: { id: sectionId, organizationId: tenant.organizationId },
      });

      const dateStr = new Date(data.attendanceDate as string)
        .toISOString()
        .split("T")[0] as string;
      const dateDate = new Date(dateStr);

      const existing = await tx.$queryRaw<{ id: string }[]>`
        SELECT s.id 
        FROM "AttendanceSession" s
        JOIN "SchoolAttendanceContext" c ON c."attendanceSessionId" = s.id
        WHERE s."organizationId" = ${tenant.organizationId}::uuid
          AND s."attendanceDate" = ${dateDate}::date
          AND s."mode" = ${data.mode}::"AttendanceMode"
          AND c."sectionId" = ${sectionId}::uuid
          AND s."status" != 'CANCELLED'::"AttendanceSessionStatus"
        FOR UPDATE
      `;

      if (existing.length > 0) {
        throw new BusinessException(
          "DUPLICATE_ATTENDANCE_SESSION",
          400,
          "An active attendance session for this section on this date already exists.",
        );
      }

      return tx.attendanceSession.create({
        data: {
          organizationId: tenant.organizationId,
          branchId: section.branchId,
          mode: data.mode as any,
          attendanceDate: dateDate,
          occurrenceNumber: data.occurrenceNumber || 1,
          note: data.note,
          createdByMembershipId: tenant.membershipId,
          status: "DRAFT",
          schoolContext: {
            create: {
              organizationId: tenant.organizationId,
              sectionId,
              subjectOfferingId: data.subjectOfferingId,
            },
          },
        },
        include: {
          schoolContext: true,
        },
      });
    });
  }

  async createForBatch(
    tenant: TenantContext,
    batchId: string,
    data: CreateAttendanceSessionDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Find batch to get branchId
      const batch = await tx.batch.findFirstOrThrow({
        where: { id: batchId, organizationId: tenant.organizationId },
      });

      const dateStr = new Date(data.attendanceDate as string)
        .toISOString()
        .split("T")[0] as string;
      const dateDate = new Date(dateStr);

      const existing = await tx.$queryRaw<{ id: string }[]>`
        SELECT s.id 
        FROM "AttendanceSession" s
        JOIN "TuitionAttendanceContext" c ON c."attendanceSessionId" = s.id
        WHERE s."organizationId" = ${tenant.organizationId}::uuid
          AND s."attendanceDate" = ${dateDate}::date
          AND s."mode" = ${data.mode}::"AttendanceMode"
          AND c."batchId" = ${batchId}::uuid
          AND s."status" != 'CANCELLED'::"AttendanceSessionStatus"
        FOR UPDATE
      `;

      if (existing.length > 0) {
        throw new BusinessException(
          "DUPLICATE_ATTENDANCE_SESSION",
          400,
          "An active attendance session for this batch on this date already exists.",
        );
      }

      return tx.attendanceSession.create({
        data: {
          organizationId: tenant.organizationId,
          branchId: batch.branchId,
          mode: data.mode as any,
          attendanceDate: dateDate,
          occurrenceNumber: data.occurrenceNumber || 1,
          note: data.note,
          createdByMembershipId: tenant.membershipId,
          status: "DRAFT",
          tuitionContext: {
            create: {
              organizationId: tenant.organizationId,
              batchId,
              subjectOfferingId: data.subjectOfferingId,
            },
          },
        },
        include: {
          tuitionContext: true,
        },
      });
    });
  }

  async findBySection(tenant: TenantContext, sectionId: string) {
    return this.prisma.attendanceSession.findMany({
      where: {
        organizationId: tenant.organizationId,
        schoolContext: {
          sectionId,
        },
      },
      include: {
        schoolContext: {
          include: {
            section: true,
            subjectOffering: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { attendanceDate: "desc" },
    });
  }

  async findByBatch(tenant: TenantContext, batchId: string) {
    return this.prisma.attendanceSession.findMany({
      where: {
        organizationId: tenant.organizationId,
        tuitionContext: {
          batchId,
        },
      },
      include: {
        tuitionContext: {
          include: {
            batch: true,
            subjectOffering: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { attendanceDate: "desc" },
    });
  }

  async findById(tenant: TenantContext, id: string) {
    return this.prisma.attendanceSession.findFirst({
      where: {
        id,
        organizationId: tenant.organizationId,
      },
      include: {
        branch: true,
        schoolContext: {
          include: {
            section: true,
            subjectOffering: {
              include: { subject: true },
            },
          },
        },
        tuitionContext: {
          include: {
            batch: true,
            subjectOffering: {
              include: { subject: true },
            },
          },
        },
      },
    });
  }

  async finalize(tenant: TenantContext, id: string) {
    return this.prisma.attendanceSession.update({
      where: { id, organizationId: tenant.organizationId },
      data: {
        status: "FINALIZED",
        finalizedAt: new Date(),
        finalizedByMembershipId: tenant.membershipId,
      },
    });
  }

  async cancel(tenant: TenantContext, id: string) {
    return this.prisma.attendanceSession.update({
      where: { id, organizationId: tenant.organizationId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledByMembershipId: tenant.membershipId,
      },
    });
  }

  async getRosterForSession(tenant: TenantContext, id: string) {
    const session = await this.findById(tenant, id);
    if (!session) return null;

    const sessionDate = session.attendanceDate;

    // Get active enrollments based on context (section or batch)
    // Must be active or ended AFTER attendance date, and started BEFORE or ON attendance date
    if (session.schoolContext) {
      return this.prisma.schoolEnrollmentPlacement.findMany({
        where: {
          organizationId: tenant.organizationId,
          sectionId: session.schoolContext.sectionId,
          enrollment: {
            startDate: { lte: sessionDate },
            OR: [{ endDate: null }, { endDate: { gte: sessionDate } }],
          },
        },
        include: {
          enrollment: {
            include: {
              student: true,
              attendanceRecords: {
                where: {
                  attendanceSessionId: id,
                },
              },
            },
          },
        },
      });
    }

    if (session.tuitionContext) {
      return this.prisma.tuitionEnrollmentPlacement.findMany({
        where: {
          organizationId: tenant.organizationId,
          batchId: session.tuitionContext.batchId,
          enrollment: {
            startDate: { lte: sessionDate },
            OR: [{ endDate: null }, { endDate: { gte: sessionDate } }],
          },
        },
        include: {
          enrollment: {
            include: {
              student: true,
              attendanceRecords: {
                where: {
                  attendanceSessionId: id,
                },
              },
            },
          },
        },
      });
    }

    return [];
  }
}
