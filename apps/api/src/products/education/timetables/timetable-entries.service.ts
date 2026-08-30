import { Injectable } from "@nestjs/common";
import {
  CreateTimetableEntryDto,
  UpdateTimetableEntryDto,
  EDUCATION_TIMETABLES_PERMISSIONS,
} from "@sitehookz/education";
import { BusinessException } from "../../../common/exceptions/business.exception";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { TenantContext } from "../../../platform/tenancy/tenant.guard";
import { Prisma } from "@sitehookz/database";
import { TimetableEntriesRepository } from "./timetable-entries.repository";
import { TimetablesRepository } from "./timetables.repository";

@Injectable()
export class TimetableEntriesService {
  constructor(
    private readonly entriesRepository: TimetableEntriesRepository,
    private readonly timetablesRepository: TimetablesRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly prisma: PrismaService,
  ) {}

  async getEntriesForSchedule(tenant: any, scheduleId: string) {
    const schedule = await this.timetablesRepository.findScheduleById(
      tenant.organizationId,
      scheduleId,
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

    return this.entriesRepository.findEntriesBySchedule(
      tenant.organizationId,
      scheduleId,
    );
  }

  async createEntry(
    tenant: any,
    scheduleId: string,
    dto: CreateTimetableEntryDto,
  ) {
    const schedule = await this.timetablesRepository.findScheduleById(
      tenant.organizationId,
      scheduleId,
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
      EDUCATION_TIMETABLES_PERMISSIONS.UPDATE,
      schedule.branchId,
    );

    if (schedule.status !== "DRAFT") {
      throw new BusinessException(
        "TIMETABLE_NOT_DRAFT",
        400,
        "Entries can only be modified in DRAFT schedules",
      );
    }

    const offering = await this.prisma.subjectOffering.findUnique({
      where: {
        id: dto.subjectOfferingId,
        organizationId: tenant.organizationId,
      },
    });
    if (!offering) {
      throw new BusinessException(
        "SUBJECT_OFFERING_NOT_FOUND",
        404,
        "Subject offering not found",
      );
    }

    if (dto.teachingAssignmentId) {
      const assignment = await this.prisma.teachingAssignment.findUnique({
        where: {
          id: dto.teachingAssignmentId,
          organizationId: tenant.organizationId,
        },
      });
      if (
        !assignment ||
        assignment.subjectOfferingId !== dto.subjectOfferingId
      ) {
        throw new BusinessException(
          "INVALID_TEACHING_ASSIGNMENT",
          400,
          "Teaching assignment does not match the offering",
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Lock schedule
      const lock = await this.timetablesRepository.acquireScheduleLock(
        tx,
        tenant.organizationId,
        scheduleId,
      );
      if (!lock || lock.status !== "DRAFT") {
        throw new BusinessException(
          "TIMETABLE_NOT_DRAFT",
          400,
          "Entries can only be modified in DRAFT schedules",
        );
      }

      // Check container conflict
      const containerConflicts =
        await this.entriesRepository.findOverlappingEntriesForContainer(
          tx,
          tenant.organizationId,
          scheduleId,
          dto.dayOfWeek,
          dto.startMinute,
          dto.endMinute,
        );
      if (containerConflicts.length > 0) {
        throw new BusinessException(
          "CONTAINER_CONFLICT",
          409,
          "Schedule conflict for this class",
          { conflictingEntryIds: containerConflicts.map((c) => c.id) },
        );
      }

      // Check teacher conflict
      if (dto.teachingAssignmentId) {
        const teacherConflicts =
          await this.entriesRepository.findOverlappingEntriesForTeacher(
            tx,
            tenant.organizationId,
            dto.teachingAssignmentId,
            dto.dayOfWeek,
            dto.startMinute,
            dto.endMinute,
            schedule.effectiveFrom,
            schedule.effectiveTo,
          );
        if (teacherConflicts.length > 0) {
          throw new BusinessException(
            "TEACHER_CONFLICT",
            409,
            "Schedule conflict for this teacher",
            { conflictingEntryIds: teacherConflicts.map((c) => c.id) },
          );
        }
      }

      return this.entriesRepository.createEntry(tx, {
        organizationId: tenant.organizationId,
        timetableScheduleId: scheduleId,
        subjectOfferingId: dto.subjectOfferingId,
        teachingAssignmentId: dto.teachingAssignmentId,
        dayOfWeek: dto.dayOfWeek,
        startMinute: dto.startMinute,
        endMinute: dto.endMinute,
        note: dto.note,
      });
    });
  }

  async updateEntry(
    tenant: any,
    scheduleId: string,
    entryId: string,
    dto: UpdateTimetableEntryDto,
  ) {
    const schedule = await this.timetablesRepository.findScheduleById(
      tenant.organizationId,
      scheduleId,
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
      EDUCATION_TIMETABLES_PERMISSIONS.UPDATE,
      schedule.branchId,
    );

    if (schedule.status !== "DRAFT") {
      throw new BusinessException(
        "TIMETABLE_NOT_DRAFT",
        400,
        "Entries can only be modified in DRAFT schedules",
      );
    }

    const existing = await this.entriesRepository.findEntryById(
      tenant.organizationId,
      entryId,
    );
    if (!existing || existing.timetableScheduleId !== scheduleId) {
      throw new BusinessException(
        "ENTRY_NOT_FOUND",
        404,
        "Timetable entry not found",
      );
    }

    const subjectOfferingId =
      dto.subjectOfferingId ?? existing.subjectOfferingId;
    const teachingAssignmentId =
      dto.teachingAssignmentId !== undefined
        ? dto.teachingAssignmentId
        : existing.teachingAssignmentId;
    const dayOfWeek = dto.dayOfWeek ?? existing.dayOfWeek;
    const startMinute = dto.startMinute ?? existing.startMinute;
    const endMinute = dto.endMinute ?? existing.endMinute;

    if (teachingAssignmentId) {
      const assignment = await this.prisma.teachingAssignment.findUnique({
        where: {
          id: teachingAssignmentId,
          organizationId: tenant.organizationId,
        },
      });
      if (!assignment || assignment.subjectOfferingId !== subjectOfferingId) {
        throw new BusinessException(
          "INVALID_TEACHING_ASSIGNMENT",
          400,
          "Teaching assignment does not match the offering",
        );
      }
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const lock = await this.timetablesRepository.acquireScheduleLock(
        tx,
        tenant.organizationId,
        scheduleId,
      );
      if (!lock || lock.status !== "DRAFT") {
        throw new BusinessException(
          "TIMETABLE_NOT_DRAFT",
          400,
          "Entries can only be modified in DRAFT schedules",
        );
      }

      const containerConflicts =
        await this.entriesRepository.findOverlappingEntriesForContainer(
          tx,
          tenant.organizationId,
          scheduleId,
          dayOfWeek,
          startMinute,
          endMinute,
          entryId,
        );
      if (containerConflicts.length > 0) {
        throw new BusinessException(
          "CONTAINER_CONFLICT",
          409,
          "Schedule conflict for this class",
          { conflictingEntryIds: containerConflicts.map((c) => c.id) },
        );
      }

      if (teachingAssignmentId) {
        const teacherConflicts =
          await this.entriesRepository.findOverlappingEntriesForTeacher(
            tx,
            tenant.organizationId,
            teachingAssignmentId,
            dayOfWeek,
            startMinute,
            endMinute,
            schedule.effectiveFrom,
            schedule.effectiveTo,
            entryId,
          );
        if (teacherConflicts.length > 0) {
          throw new BusinessException(
            "TEACHER_CONFLICT",
            409,
            "Schedule conflict for this teacher",
            { conflictingEntryIds: teacherConflicts.map((c) => c.id) },
          );
        }
      }

      return this.entriesRepository.updateEntry(
        tx,
        tenant.organizationId,
        entryId,
        {
          subjectOfferingId: dto.subjectOfferingId,
          teachingAssignmentId: dto.teachingAssignmentId,
          dayOfWeek: dto.dayOfWeek,
          startMinute: dto.startMinute,
          endMinute: dto.endMinute,
          note: dto.note,
        },
      );
    });
  }

  async deleteEntry(tenant: any, scheduleId: string, entryId: string) {
    const schedule = await this.timetablesRepository.findScheduleById(
      tenant.organizationId,
      scheduleId,
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
      EDUCATION_TIMETABLES_PERMISSIONS.UPDATE,
      schedule.branchId,
    );

    if (schedule.status !== "DRAFT") {
      throw new BusinessException(
        "TIMETABLE_NOT_DRAFT",
        400,
        "Entries can only be modified in DRAFT schedules",
      );
    }

    const existing = await this.entriesRepository.findEntryById(
      tenant.organizationId,
      entryId,
    );
    if (!existing || existing.timetableScheduleId !== scheduleId) {
      throw new BusinessException(
        "ENTRY_NOT_FOUND",
        404,
        "Timetable entry not found",
      );
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const lock = await this.timetablesRepository.acquireScheduleLock(
        tx,
        tenant.organizationId,
        scheduleId,
      );
      if (!lock || lock.status !== "DRAFT") {
        throw new BusinessException(
          "TIMETABLE_NOT_DRAFT",
          400,
          "Entries can only be modified in DRAFT schedules",
        );
      }

      return this.entriesRepository.deleteEntry(
        tx,
        tenant.organizationId,
        entryId,
      );
    });
  }
}
