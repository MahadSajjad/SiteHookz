import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { Prisma, TimetableDay } from "@sitehookz/database";

@Injectable()
export class TimetableEntriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEntriesBySchedule(
    organizationId: string,
    timetableScheduleId: string,
  ) {
    return this.prisma.timetableEntry.findMany({
      where: {
        organizationId,
        timetableScheduleId,
      },
    });
  }

  async findEntryById(organizationId: string, id: string) {
    return this.prisma.timetableEntry.findUnique({
      where: {
        id,
        organizationId,
      },
    });
  }

  async createEntry(
    tx: Prisma.TransactionClient,
    data: {
      organizationId: string;
      timetableScheduleId: string;
      subjectOfferingId: string;
      teachingAssignmentId?: string | null;
      dayOfWeek: TimetableDay;
      startMinute: number;
      endMinute: number;
      note?: string | null;
    },
  ) {
    return tx.timetableEntry.create({
      data,
    });
  }

  async updateEntry(
    tx: Prisma.TransactionClient,
    organizationId: string,
    id: string,
    data: {
      subjectOfferingId?: string;
      teachingAssignmentId?: string | null;
      dayOfWeek?: TimetableDay;
      startMinute?: number;
      endMinute?: number;
      note?: string | null;
    },
  ) {
    return tx.timetableEntry.update({
      where: { id, organizationId },
      data,
    });
  }

  async deleteEntry(
    tx: Prisma.TransactionClient,
    organizationId: string,
    id: string,
  ) {
    return tx.timetableEntry.delete({
      where: { id, organizationId },
    });
  }

  async findOverlappingEntriesForContainer(
    tx: Prisma.TransactionClient,
    organizationId: string,
    timetableScheduleId: string,
    dayOfWeek: TimetableDay,
    startMinute: number,
    endMinute: number,
    excludeEntryId?: string,
  ) {
    const whereClause: Prisma.TimetableEntryWhereInput = {
      organizationId,
      timetableScheduleId,
      dayOfWeek,
      startMinute: { lt: endMinute },
      endMinute: { gt: startMinute },
    };

    if (excludeEntryId) {
      whereClause.id = { not: excludeEntryId };
    }

    return tx.timetableEntry.findMany({
      where: whereClause,
      select: { id: true },
    });
  }

  async findOverlappingEntriesForTeacher(
    tx: Prisma.TransactionClient,
    organizationId: string,
    teachingAssignmentId: string,
    dayOfWeek: TimetableDay,
    startMinute: number,
    endMinute: number,
    effectiveFrom: Date,
    effectiveTo: Date | null,
    excludeEntryId?: string,
  ) {
    // A teacher can't be in two places at the same time across ANY active/published schedules
    // Or in draft schedules? If we check teacher conflicts, we must check published schedules
    // that overlap in effective date, OR entries in the same schedule.

    // Simplification for the query:
    const scheduleFilter: Prisma.TimetableScheduleWhereInput = {
      organizationId,
      status: { in: ["PUBLISHED", "DRAFT"] }, // Typically we prevent conflict across all active ones.
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveFrom } }],
    };
    if (effectiveTo) {
      scheduleFilter.effectiveFrom = { lte: effectiveTo };
    }

    const whereClause: Prisma.TimetableEntryWhereInput = {
      organizationId,
      teachingAssignmentId,
      dayOfWeek,
      startMinute: { lt: endMinute },
      endMinute: { gt: startMinute },
      timetableSchedule: scheduleFilter,
    };

    if (excludeEntryId) {
      whereClause.id = { not: excludeEntryId };
    }

    return tx.timetableEntry.findMany({
      where: whereClause,
      select: { id: true },
    });
  }
}
