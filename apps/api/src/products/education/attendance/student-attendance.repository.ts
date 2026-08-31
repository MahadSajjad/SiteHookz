import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import { BulkMarkAttendanceDto } from "./dto/attendance.dto";
import { StudentAttendanceStatus } from "@sitehookz/database";

@Injectable()
export class StudentAttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async bulkMark(
    tenant: TenantContext,
    sessionId: string,
    data: BulkMarkAttendanceDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const results = [];
      const now = new Date();

      for (const record of data.records) {
        const upserted = await tx.studentAttendanceRecord.upsert({
          where: {
            attendanceSessionId_studentEnrollmentId: {
              attendanceSessionId: sessionId,
              studentEnrollmentId: record.studentEnrollmentId,
            },
          },
          update: {
            status: record.status as StudentAttendanceStatus,
            note: record.note,
            markedByMembershipId: tenant.membershipId,
            
          },
          create: {
            organizationId: tenant.organizationId,
            attendanceSessionId: sessionId,
            studentEnrollmentId: record.studentEnrollmentId,
            status: record.status as StudentAttendanceStatus,
            note: record.note,
            markedByMembershipId: tenant.membershipId,
            
          },
        });
        results.push(upserted);
      }
      return results;
    });
  }

  async findByStudent(tenant: TenantContext, studentId: string) {
    return this.prisma.studentAttendanceRecord.findMany({
      where: {
        organizationId: tenant.organizationId,
        studentEnrollment: {
          studentId,
        },
      },
      include: {
        attendanceSession: {
          include: {
            branch: true,
            schoolContext: {
              include: {
                section: {
                  include: { classLevel: true },
                },
                subjectOffering: {
                  include: { subject: true },
                },
              },
            },
            tuitionContext: {
              include: {
                batch: {
                  include: { course: true },
                },
                subjectOffering: {
                  include: { subject: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        attendanceSession: {
          attendanceDate: "desc",
        },
      },
    });
  }
}
