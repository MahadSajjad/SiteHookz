import { Test, TestingModule } from "@nestjs/testing";
import { TimetablesService } from "./timetables.service";
import { TimetableEntriesService } from "./timetable-entries.service";
import { TimetablesRepository } from "./timetables.repository";
import { TimetableEntriesRepository } from "./timetable-entries.repository";

import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { BusinessException } from "../../../common/exceptions/business.exception";
import { EDUCATION_TIMETABLES_PERMISSIONS } from "@sitehookz/education";
import { TimetableDay } from "@sitehookz/database";

describe("TimetablesService & TimetableEntriesService", () => {
  let timetablesService: TimetablesService;
  let entriesService: TimetableEntriesService;

  const mockTenant = ({ organizationId: "org-1", membershipId: "mem-1" } as any) as any;
  const mockTenant2 = { organizationId: "org-2", membershipId: "mem-2" } as any;

  const mockAuthService = {
    assertPermission: jest.fn().mockResolvedValue(true),
  };

  const mockPrismaTransaction = jest.fn().mockImplementation((cb) =>
    cb({
      $queryRaw: jest
        .fn()
        .mockResolvedValue([
          {
            id: "sched-1",
            status: "DRAFT",
            effectiveFrom: new Date(),
            effectiveTo: null,
          },
        ]),
    }),
  );
  const mockPrisma = {
    $transaction: mockPrismaTransaction,
    section: { findUnique: jest.fn() },
    batch: { findUnique: jest.fn() },
    subjectOffering: { findUnique: jest.fn() },
    teachingAssignment: { findUnique: jest.fn() },
  };

  const mockTimetablesRepo = {
    findScheduleById: jest.fn(),
    findSchedulesByContainer: jest.fn(),
    createSchoolSchedule: jest.fn(),
    createTuitionSchedule: jest.fn(),
    updateScheduleStatus: jest.fn(),
    acquireScheduleLock: jest.fn(),
  };

  const mockEntriesRepo = {
    findEntriesBySchedule: jest.fn(),
    findEntryById: jest.fn(),
    createEntry: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
    findOverlappingEntriesForContainer: jest.fn(),
    findOverlappingEntriesForTeacher: jest.fn(),
  };

  const mockSectionsRepo = { findById: jest.fn() };
  const mockBatchesRepo = { findById: jest.fn() };
  const mockOfferingsRepo = { findById: jest.fn() };
  const mockAssignmentsRepo = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimetablesService,
        TimetableEntriesService,
        { provide: TimetablesRepository, useValue: mockTimetablesRepo },
        { provide: TimetableEntriesRepository, useValue: mockEntriesRepo },

        { provide: AuthorizationService, useValue: mockAuthService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    timetablesService = module.get<TimetablesService>(TimetablesService);
    entriesService = module.get<TimetableEntriesService>(
      TimetableEntriesService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("TimetablesService", () => {
    it("should retrieve a schedule enforcing tenant boundary", async () => {
      mockTimetablesRepo.findScheduleById.mockResolvedValue({
        id: "sched-1",
        branchId: "branch-1",
        status: "DRAFT",
      });
      const result = await timetablesService.getSchedule(mockTenant, "sched-1");
      expect(result.id).toBe("sched-1");
      expect(mockTimetablesRepo.findScheduleById).toHaveBeenCalledWith(
        "org-1",
        "sched-1",
      );

      mockTimetablesRepo.findScheduleById.mockResolvedValue(null);
      await expect(
        timetablesService.getSchedule(mockTenant2, "sched-1"),
      ).rejects.toThrow(BusinessException);
    });

    it("should create a school schedule", async () => {
      mockPrisma.section.findUnique.mockResolvedValue({
        id: "sec-1",
        branchId: "branch-1",
      });
      mockTimetablesRepo.createSchoolSchedule.mockResolvedValue({
        id: "sched-new",
      });

      const res = await timetablesService.createSchoolSchedule(
        mockTenant,
        "sec-1",
        {
          name: "Spring 2026",
          effectiveFrom: "2026-01-01",
        },
      );

      expect(res.id).toBe("sched-new");
      expect(mockAuthService.assertPermission).toHaveBeenCalledWith(
        mockTenant,
        EDUCATION_TIMETABLES_PERMISSIONS.CREATE,
        "branch-1",
      );
    });
  });

  describe("TimetableEntriesService", () => {
    it("should prevent entry creation on PUBLISHED schedule", async () => {
      mockTimetablesRepo.findScheduleById.mockResolvedValue({
        id: "sched-1",
        branchId: "branch-1",
        status: "PUBLISHED",
      });
      await expect(
        entriesService.createEntry(mockTenant, "sched-1", {
          subjectOfferingId: "off-1",
          dayOfWeek: "MONDAY",
          startMinute: 480,
          endMinute: 540,
        }),
      ).rejects.toThrow(/DRAFT/);
    });

    it("should detect container conflict", async () => {
      mockTimetablesRepo.findScheduleById.mockResolvedValue({
        id: "sched-1",
        branchId: "branch-1",
        status: "DRAFT",
      });
      mockPrisma.subjectOffering.findUnique.mockResolvedValue({ id: "off-1" });
      mockTimetablesRepo.acquireScheduleLock.mockResolvedValue({
        id: "sched-1",
        status: "DRAFT",
      });

      mockEntriesRepo.findOverlappingEntriesForContainer.mockResolvedValue([
        { id: "conflict-1" },
      ]);

      await expect(
        entriesService.createEntry(mockTenant, "sched-1", {
          subjectOfferingId: "off-1",
          dayOfWeek: "MONDAY",
          startMinute: 480,
          endMinute: 540,
        }),
      ).rejects.toThrow(/conflict for this class/i);
    });

    it("should detect teacher conflict", async () => {
      mockTimetablesRepo.findScheduleById.mockResolvedValue({
        id: "sched-1",
        branchId: "branch-1",
        status: "DRAFT",
      });
      mockPrisma.subjectOffering.findUnique.mockResolvedValue({ id: "off-1" });
      mockPrisma.teachingAssignment.findUnique.mockResolvedValue({
        id: "assign-1",
        subjectOfferingId: "off-1",
      });
      mockTimetablesRepo.acquireScheduleLock.mockResolvedValue({
        id: "sched-1",
        status: "DRAFT",
      });

      mockEntriesRepo.findOverlappingEntriesForContainer.mockResolvedValue([]);
      mockEntriesRepo.findOverlappingEntriesForTeacher.mockResolvedValue([
        { id: "conflict-2" },
      ]);

      await expect(
        entriesService.createEntry(mockTenant, "sched-1", {
          subjectOfferingId: "off-1",
          teachingAssignmentId: "assign-1",
          dayOfWeek: "MONDAY",
          startMinute: 480,
          endMinute: 540,
        }),
      ).rejects.toThrow(/conflict for this teacher/i);
    });

    it("should create an entry if no conflicts", async () => {
      mockTimetablesRepo.findScheduleById.mockResolvedValue({
        id: "sched-1",
        branchId: "branch-1",
        status: "DRAFT",
      });
      mockPrisma.subjectOffering.findUnique.mockResolvedValue({ id: "off-1" });
      mockPrisma.teachingAssignment.findUnique.mockResolvedValue({
        id: "assign-1",
        subjectOfferingId: "off-1",
      });
      mockTimetablesRepo.acquireScheduleLock.mockResolvedValue({
        id: "sched-1",
        status: "DRAFT",
      });

      mockEntriesRepo.findOverlappingEntriesForContainer.mockResolvedValue([]);
      mockEntriesRepo.findOverlappingEntriesForTeacher.mockResolvedValue([]);
      mockEntriesRepo.createEntry.mockResolvedValue({ id: "entry-new" });

      const res = await entriesService.createEntry(mockTenant, "sched-1", {
        subjectOfferingId: "off-1",
        teachingAssignmentId: "assign-1",
        dayOfWeek: "MONDAY",
        startMinute: 480,
        endMinute: 540,
      });

      expect(res.id).toBe("entry-new");
    });
  });
});
