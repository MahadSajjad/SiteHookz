import { Controller, Get, Put, Param, Body, UseGuards } from "@nestjs/common";
import { StudentAttendanceService } from "./student-attendance.service";
import { BulkMarkAttendanceDto } from "./dto/attendance.dto";
import { BulkMarkAttendanceSchema } from "@sitehookz/education";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";
import { RequirePermission } from "../../../platform/authorization/permission.guard";
import { EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS } from "@sitehookz/education";

@Controller("education")
export class StudentAttendanceController {
  constructor(private readonly service: StudentAttendanceService) {}

  @Put("attendance-sessions/:sessionId/records")
  @RequirePermission(EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS.MARK)
  bulkMark(
    @CurrentTenant() tenant: TenantContext,
    @Param("sessionId") sessionId: string,
    @Body(new ZodValidationPipe(BulkMarkAttendanceSchema))
    data: BulkMarkAttendanceDto,
  ) {
    return this.service.bulkMark(tenant, sessionId, data);
  }

  @Get("students/:studentId/attendance")
  @RequirePermission(EDUCATION_STUDENT_ATTENDANCE_PERMISSIONS.READ)
  findByStudent(
    @CurrentTenant() tenant: TenantContext,
    @Param("studentId") studentId: string,
  ) {
    return this.service.findByStudent(tenant, studentId);
  }
}
