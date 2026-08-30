import { Injectable, NotFoundException } from "@nestjs/common";
import { StudentAttendanceRepository } from "./student-attendance.repository";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import { BulkMarkAttendanceDto } from "./dto/attendance.dto";
import { AttendanceSessionsRepository } from "./attendance-sessions.repository";
import {
  EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS,
  EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS,
} from "@sitehookz/education";
import { BusinessException } from "../../../common/exceptions/business.exception";

@Injectable()
export class StudentAttendanceService {
  constructor(
    private readonly repository: StudentAttendanceRepository,
    private readonly sessionsRepository: AttendanceSessionsRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async bulkMark(
    tenant: TenantContext,
    sessionId: string,
    data: BulkMarkAttendanceDto,
  ) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS.MARK,
    );

    // Check if session exists and is draft
    const session = await this.sessionsRepository.findById(tenant, sessionId);
    if (!session) throw new NotFoundException("Attendance session not found");

    if (session.status !== "DRAFT") {
      throw new BusinessException(
        "INVALID_STATE",
        400,
        "Cannot mark attendance for a non-draft session",
      );
    }

    return this.repository.bulkMark(tenant, sessionId, data);
  }

  async findByStudent(tenant: TenantContext, studentId: string) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS.READ,
    );

    const records = await this.repository.findByStudent(tenant, studentId);

    // Map to History Item format
    return records.map((record) => {
      const session = record.attendanceSession;
      return {
        id: record.id,
        date: session.attendanceDate.toISOString(),
        status: record.status,
        branch: {
          id: session.branch.id,
          name: session.branch.name,
        },
        section: session.schoolContext
          ? {
              id: session.schoolContext.section.id,
              name: session.schoolContext.section.name,
            }
          : undefined,
        classLevel: session.schoolContext
          ? {
              id: session.schoolContext.section.classLevel.id,
              name: session.schoolContext.section.classLevel.name,
            }
          : undefined,
        batch: session.tuitionContext
          ? {
              id: session.tuitionContext.batch.id,
              name: session.tuitionContext.batch.name,
            }
          : undefined,
        course: session.tuitionContext
          ? {
              id: session.tuitionContext.batch.course.id,
              name: session.tuitionContext.batch.course.name,
            }
          : undefined,
        subject:
          session.schoolContext?.subjectOffering ||
          session.tuitionContext?.subjectOffering
            ? {
                id:
                  session.schoolContext?.subjectOffering?.subject.id ||
                  session.tuitionContext?.subjectOffering?.subject.id,
                name:
                  session.schoolContext?.subjectOffering?.subject.name ||
                  session.tuitionContext?.subjectOffering?.subject.name,
              }
            : undefined,
      };
    });
  }
}
