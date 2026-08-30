import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { CreateAttendanceSessionDto } from "./dto/attendance.dto";
import { CreateAttendanceSessionSchema } from "@sitehookz/education";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";
import { RequirePermission } from "../../../platform/authorization/permission.guard";
import { AttendanceSessionsService } from "./attendance-sessions.service";
import { EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS } from "@sitehookz/education";

@Controller("education")
export class AttendanceSessionsController {
  constructor(private readonly service: AttendanceSessionsService) {}

  @Get("sections/:sectionId/attendance-sessions")
  @RequirePermission(EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.READ)
  findBySection(
    @CurrentTenant() tenant: TenantContext,
    @Param("sectionId") sectionId: string,
  ) {
    return this.service.findBySection(tenant, sectionId);
  }

  @Post("sections/:sectionId/attendance-sessions")
  @RequirePermission(EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.CREATE)
  createForSection(
    @CurrentTenant() tenant: TenantContext,
    @Param("sectionId") sectionId: string,
    @Body(new ZodValidationPipe(CreateAttendanceSessionSchema))
    data: CreateAttendanceSessionDto,
  ) {
    return this.service.createForSection(tenant, sectionId, data);
  }

  @Get("batches/:batchId/attendance-sessions")
  @RequirePermission(EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.READ)
  findByBatch(
    @CurrentTenant() tenant: TenantContext,
    @Param("batchId") batchId: string,
  ) {
    return this.service.findByBatch(tenant, batchId);
  }

  @Post("batches/:batchId/attendance-sessions")
  @RequirePermission(EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.CREATE)
  createForBatch(
    @CurrentTenant() tenant: TenantContext,
    @Param("batchId") batchId: string,
    @Body(new ZodValidationPipe(CreateAttendanceSessionSchema))
    data: CreateAttendanceSessionDto,
  ) {
    return this.service.createForBatch(tenant, batchId, data);
  }

  @Get("attendance-sessions/:sessionId")
  @RequirePermission(EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.READ)
  findById(
    @CurrentTenant() tenant: TenantContext,
    @Param("sessionId") sessionId: string,
  ) {
    return this.service.findById(tenant, sessionId);
  }

  @Get("attendance-sessions/:sessionId/roster")
  @RequirePermission(EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.READ)
  getRoster(
    @CurrentTenant() tenant: TenantContext,
    @Param("sessionId") sessionId: string,
  ) {
    return this.service.getRosterForSession(tenant, sessionId);
  }

  @Post("attendance-sessions/:sessionId/finalize")
  @RequirePermission(EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.FINALIZE)
  finalize(
    @CurrentTenant() tenant: TenantContext,
    @Param("sessionId") sessionId: string,
  ) {
    return this.service.finalize(tenant, sessionId);
  }

  @Post("attendance-sessions/:sessionId/cancel")
  @RequirePermission(EDUCATION_ATTENDANCE_SESSIONS_PERMISSIONS.CANCEL)
  cancel(
    @CurrentTenant() tenant: TenantContext,
    @Param("sessionId") sessionId: string,
  ) {
    return this.service.cancel(tenant, sessionId);
  }
}
