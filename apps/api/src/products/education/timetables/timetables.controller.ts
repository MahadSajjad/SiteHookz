import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import {
  PermissionGuard,
  RequirePermission,
} from "../../../platform/authorization/permission.guard";
import {
  CreateSchoolTimetableDto,
  CreateSchoolTimetableSchema,
  CreateTuitionTimetableDto,
  CreateTuitionTimetableSchema,
} from "@sitehookz/education";
import { TimetablesService } from "./timetables.service";

@Controller("education")
@UseGuards(PermissionGuard)
export class TimetablesController {
  constructor(private readonly timetablesService: TimetablesService) {}

  @Get("sections/:sectionId/timetables")
  async getSchedulesBySection(
    @CurrentTenant() tenant: TenantContext,
    @Param("sectionId") sectionId: string,
  ) {
    return this.timetablesService.getSchedulesBySection(tenant, sectionId);
  }

  @Post("sections/:sectionId/timetables")
  async createSchoolSchedule(
    @CurrentTenant() tenant: TenantContext,
    @Param("sectionId") sectionId: string,
    @Body(new ZodValidationPipe(CreateSchoolTimetableSchema))
    dto: CreateSchoolTimetableDto,
  ) {
    return this.timetablesService.createSchoolSchedule(tenant, sectionId, dto);
  }

  @Get("batches/:batchId/timetables")
  async getSchedulesByBatch(
    @CurrentTenant() tenant: TenantContext,
    @Param("batchId") batchId: string,
  ) {
    return this.timetablesService.getSchedulesByBatch(tenant, batchId);
  }

  @Post("batches/:batchId/timetables")
  async createTuitionSchedule(
    @CurrentTenant() tenant: TenantContext,
    @Param("batchId") batchId: string,
    @Body(new ZodValidationPipe(CreateTuitionTimetableSchema))
    dto: CreateTuitionTimetableDto,
  ) {
    return this.timetablesService.createTuitionSchedule(tenant, batchId, dto);
  }

  @Get("timetables/:id")
  async getSchedule(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.timetablesService.getSchedule(tenant, id);
  }

  @Put("timetables/:id/publish")
  async publishSchedule(
    @CurrentTenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.timetablesService.publishSchedule(tenant, id);
  }

  @Put("timetables/:id/archive")
  async archiveSchedule(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
  ) {
    return this.timetablesService.archiveSchedule(tenant, id);
  }
}
