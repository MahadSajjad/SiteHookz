import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  CurrentTenant,
  TenantContext,
} from "../../../platform/tenancy/tenant.guard";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe";
import { PermissionGuard } from "../../../platform/authorization/permission.guard";
import {
  CreateTimetableEntryDto,
  CreateTimetableEntrySchema,
  UpdateTimetableEntryDto,
  UpdateTimetableEntrySchema,
} from "@sitehookz/education";
import { TimetableEntriesService } from "./timetable-entries.service";

@Controller("education/timetables/:scheduleId/entries")
@UseGuards(PermissionGuard)
export class TimetableEntriesController {
  constructor(private readonly entriesService: TimetableEntriesService) {}

  @Get()
  async getEntries(
    @CurrentTenant() tenant: TenantContext,
    @Param("scheduleId") scheduleId: string,
  ) {
    return this.entriesService.getEntriesForSchedule(tenant, scheduleId);
  }

  @Post()
  async createEntry(
    @CurrentTenant() tenant: TenantContext,
    @Param("scheduleId") scheduleId: string,
    @Body(new ZodValidationPipe(CreateTimetableEntrySchema))
    dto: CreateTimetableEntryDto,
  ) {
    return this.entriesService.createEntry(tenant, scheduleId, dto);
  }

  @Put(":entryId")
  async updateEntry(
    @CurrentTenant() tenant: TenantContext,
    @Param("scheduleId") scheduleId: string,
    @Param("entryId") entryId: string,
    @Body(new ZodValidationPipe(UpdateTimetableEntrySchema))
    dto: UpdateTimetableEntryDto,
  ) {
    return this.entriesService.updateEntry(tenant, scheduleId, entryId, dto);
  }

  @Delete(":entryId")
  async deleteEntry(
    @CurrentTenant() tenant: TenantContext,
    @Param("scheduleId") scheduleId: string,
    @Param("entryId") entryId: string,
  ) {
    return this.entriesService.deleteEntry(tenant, scheduleId, entryId);
  }
}
