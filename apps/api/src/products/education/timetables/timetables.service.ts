import { Injectable } from "@nestjs/common";
import {
  CreateSchoolTimetableDto,
  CreateTuitionTimetableDto,
  EDUCATION_TIMETABLES_PERMISSIONS,
} from "@sitehookz/education";
import { BusinessException } from "../../../common/exceptions/business.exception";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import { TimetablesRepository } from "./timetables.repository";

@Injectable()
export class TimetablesService {
  constructor(
    private readonly timetablesRepository: TimetablesRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly prisma: PrismaService,
  ) {}

  async getSchedule(tenant: TenantContext, id: string) {
    const schedule = await this.timetablesRepository.findScheduleById(
      tenant.organizationId,
      id,
    );
    if (!schedule) {
      throw new BusinessException(
        "TIMETABLE_NOT_FOUND",
        404,
        "Timetable not found",
      );
    }
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_TIMETABLES_PERMISSIONS.READ,
      schedule.branchId,
    );
    return schedule;
  }

  async getSchedulesBySection(tenant: TenantContext, sectionId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId, organizationId: tenant.organizationId },
    });
    if (!section) {
      throw new BusinessException(
        "SECTION_NOT_FOUND",
        404,
        "Section not found",
      );
    }
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_TIMETABLES_PERMISSIONS.READ,
      section.branchId,
    );

    return this.timetablesRepository.findSchedulesByContainer(
      tenant.organizationId,
      sectionId,
      "SCHOOL",
    );
  }

  async getSchedulesByBatch(tenant: TenantContext, batchId: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId, organizationId: tenant.organizationId },
    });
    if (!batch) {
      throw new BusinessException("BATCH_NOT_FOUND", 404, "Batch not found");
    }
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_TIMETABLES_PERMISSIONS.READ,
      batch.branchId,
    );

    return this.timetablesRepository.findSchedulesByContainer(
      tenant.organizationId,
      batchId,
      "TUITION",
    );
  }

  async createSchoolSchedule(
    tenant: TenantContext,
    sectionId: string,
    dto: CreateSchoolTimetableDto,
  ) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId, organizationId: tenant.organizationId },
    });
    if (!section) {
      throw new BusinessException(
        "SECTION_NOT_FOUND",
        404,
        "Section not found",
      );
    }
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_TIMETABLES_PERMISSIONS.CREATE,
      section.branchId,
    );

    // Conflict detection: Is there an existing schedule that overlaps?
    // Let's rely on effectiveFrom/effectiveTo overlap if needed, but standard logic might allow multiple drafts.
    // For simplicity, we just create a DRAFT. Publish will enforce stricter rules if necessary.

    return this.timetablesRepository.createSchoolSchedule({
      organizationId: tenant.organizationId,
      branchId: section.branchId,
      name: dto.name,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      sectionId,
    });
  }

  async createTuitionSchedule(
    tenant: TenantContext,
    batchId: string,
    dto: CreateTuitionTimetableDto,
  ) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId, organizationId: tenant.organizationId },
    });
    if (!batch) {
      throw new BusinessException("BATCH_NOT_FOUND", 404, "Batch not found");
    }
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_TIMETABLES_PERMISSIONS.CREATE,
      batch.branchId,
    );

    return this.timetablesRepository.createTuitionSchedule({
      organizationId: tenant.organizationId,
      branchId: batch.branchId,
      name: dto.name,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      batchId,
    });
  }

  async publishSchedule(tenant: TenantContext, id: string) {
    const schedule = await this.getSchedule(tenant, id);
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_TIMETABLES_PERMISSIONS.PUBLISH,
      schedule.branchId,
    );

    return this.prisma.$transaction(async (tx) => {
      const lock = await this.timetablesRepository.acquireScheduleLock(
        tx,
        tenant.organizationId,
        id,
      );
      if (!lock) {
        throw new BusinessException(
          "TIMETABLE_NOT_FOUND",
          404,
          "Timetable not found",
        );
      }
      if (lock.status !== "DRAFT") {
        throw new BusinessException(
          "TIMETABLE_NOT_DRAFT",
          400,
          "Only draft timetables can be published",
        );
      }

      // We could add logic here to check if there are overlapping PUBLISHED schedules for the same container.
      // But for now, we just mark it as PUBLISHED.
      return this.timetablesRepository.updateScheduleStatus(
        tenant.organizationId,
        id,
        "PUBLISHED",
        tenant.membershipId,
      );
    });
  }

  async archiveSchedule(tenant: any, id: string) {
    const schedule = await this.getSchedule(tenant, id);
    await this.authorizationService.assertPermission(
      tenant,
      EDUCATION_TIMETABLES_PERMISSIONS.ARCHIVE,
      schedule.branchId,
    );

    return this.timetablesRepository.updateScheduleStatus(
      tenant.organizationId,
      id,
      "ARCHIVED",
      tenant.membershipId,
    );
  }
}
