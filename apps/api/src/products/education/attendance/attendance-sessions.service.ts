import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateAttendanceSessionDto } from "./dto/attendance.dto";
import { AttendanceSessionsRepository } from "./attendance-sessions.repository";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import { EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS } from "@sitehookz/education";
import { BusinessException } from "../../../common/exceptions/business.exception";

@Injectable()
export class AttendanceSessionsService {
  constructor(
    private readonly repository: AttendanceSessionsRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async createForSection(
    tenant: TenantContext,
    sectionId: string,
    data: CreateAttendanceSessionDto,
  ) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.CREATE,
    );
    return this.repository.createForSection(tenant, sectionId, data);
  }

  async createForBatch(
    tenant: TenantContext,
    batchId: string,
    data: CreateAttendanceSessionDto,
  ) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.CREATE,
    );
    return this.repository.createForBatch(tenant, batchId, data);
  }

  async findBySection(tenant: TenantContext, sectionId: string) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.READ,
    );
    return this.repository.findBySection(tenant, sectionId);
  }

  async findByBatch(tenant: TenantContext, batchId: string) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.READ,
    );
    return this.repository.findByBatch(tenant, batchId);
  }

  async findById(tenant: TenantContext, id: string) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.READ,
    );
    const session = await this.repository.findById(tenant, id);
    if (!session) {
      throw new NotFoundException("Attendance session not found");
    }
    return session;
  }

  async getRosterForSession(tenant: TenantContext, id: string) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.READ,
    );
    const session = await this.findById(tenant, id);

    const roster = await this.repository.getRosterForSession(tenant, id);
    if (!roster) throw new NotFoundException("Session roster not found");

    return roster.map((p) => {
      const record = p.enrollment.attendanceRecords[0];
      return {
        studentId: p.enrollment.studentId,
        studentEnrollmentId: p.enrollment.id,
        admissionNumber: p.enrollment.student.admissionNumber,
        name: `${p.enrollment.student.firstName} ${p.enrollment.student.lastName || ""}`.trim(),
        rollNumber: (p as any).rollNumber || null,
        existingStatus: record ? record.status : null,
        note: record ? record.note : null,
      };
    });
  }

  async finalize(tenant: TenantContext, id: string) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.FINALIZE,
    );
    const session = await this.findById(tenant, id);
    if (session.status !== "DRAFT") {
      throw new BusinessException(
        "INVALID_STATE",
        400,
        "Only draft sessions can be finalized",
      );
    }
    return this.repository.finalize(tenant, id);
  }

  async cancel(tenant: TenantContext, id: string) {
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.CANCEL,
    );
    const session = await this.findById(tenant, id);
    if (session.status === "CANCELLED") {
      throw new BusinessException(
        "INVALID_STATE",
        400,
        "Session is already cancelled",
      );
    }
    return this.repository.cancel(tenant, id);
  }
}
