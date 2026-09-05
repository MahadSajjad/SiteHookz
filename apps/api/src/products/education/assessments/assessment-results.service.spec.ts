import { Test, TestingModule } from "@nestjs/testing";
import { AssessmentResultsService } from "./assessment-results.service";
import { AssessmentsService } from "./assessments.service";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { BusinessException } from "../../../common/exceptions/business.exception";

describe("AssessmentResultsService", () => {
  let service: AssessmentResultsService;
  let prisma: any;

  const tenant = {
    organizationId: "org-1",
    membershipId: "mem-1",
  } as any;

  beforeEach(async () => {
    prisma = {
      assessment: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      studentEnrollment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      assessmentResult: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (arg) => {
        if (typeof arg === "function") {
          return arg(prisma);
        }
        return Promise.all(arg);
      }),
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentResultsService,
        { provide: AssessmentsService, useValue: {} },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AssessmentResultsService>(AssessmentResultsService);
  });

  describe("Historical Enrollment Eligibility", () => {
    const assessmentDate = new Date("2026-05-15");

    const schoolAssessment = {
      id: "asm-1",
      organizationId: "org-1",
      assessmentDate,
      subjectOffering: {
        schoolOffering: { sectionId: "sec-1" },
      },
    };

    it("old Enrollment whose date range contains Assessment date -> eligible in roster", async () => {
      prisma.assessment.findUnique.mockResolvedValue(schoolAssessment);

      prisma.studentEnrollment.findMany.mockResolvedValue([
        {
          id: "enr-1",
          organizationId: "org-1",
          studentId: "stu-1",
          placementType: "SCHOOL",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-06-30"),
          student: { firstName: "Alice", lastName: "Smith" },
          schoolPlacement: { rollNumber: "101" },
          assessmentResults: [],
        },
      ]);

      const roster = await service.getRoster(tenant, "asm-1");

      expect(roster).toHaveLength(1);
      expect(roster[0]!.studentEnrollmentId).toBe("enr-1");
      expect(roster[0]!.studentName).toBe("Alice Smith");
      expect(prisma.studentEnrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            placementType: "SCHOOL",
            schoolPlacement: { sectionId: "sec-1" },
            startDate: { lte: assessmentDate },
          }),
        }),
      );
    });

    it("same Enrollment after end date -> ineligible in query", async () => {
      prisma.assessment.findUnique.mockResolvedValue(schoolAssessment);

      // findMany query enforces: startDate <= assessmentDate and (endDate IS NULL or endDate >= assessmentDate)
      // When an enrollment ended before assessment date (e.g. ended 2026-04-30), database returns 0 rows
      prisma.studentEnrollment.findMany.mockResolvedValue([]);

      const roster = await service.getRoster(tenant, "asm-1");
      expect(roster).toHaveLength(0);
    });

    it("currently completed/inactive but historically valid Enrollment -> still eligible", async () => {
      prisma.assessment.findUnique.mockResolvedValue(schoolAssessment);

      prisma.studentEnrollment.findMany.mockResolvedValue([
        {
          id: "enr-graduated",
          organizationId: "org-1",
          studentId: "stu-2",
          placementType: "SCHOOL",
          status: "COMPLETED", // inactive/completed status does NOT exclude
          startDate: new Date("2026-01-01"),
          endDate: null,
          student: { firstName: "Bob", lastName: "Jones" },
          schoolPlacement: { rollNumber: "102" },
          assessmentResults: [],
        },
      ]);

      const roster = await service.getRoster(tenant, "asm-1");
      expect(roster).toHaveLength(1);
      expect(roster[0]!.studentEnrollmentId).toBe("enr-graduated");
    });

    it("wrong Section -> rejected in bulk grading", async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-1",
        organizationId: "org-1",
        status: "ACTIVE",
        maximumMarks: 100,
        assessmentDate,
        subjectOffering: {
          schoolOffering: { sectionId: "sec-1" },
        },
      });

      // Enrollment belongs to sec-different
      prisma.studentEnrollment.findUnique.mockResolvedValue({
        id: "enr-diff-sec",
        organizationId: "org-1",
        placementType: "SCHOOL",
        startDate: new Date("2026-01-01"),
        endDate: null,
        schoolPlacement: { sectionId: "sec-different" },
      });

      await expect(
        service.bulkGrade(tenant, "asm-1", {
          results: [
            {
              studentEnrollmentId: "enr-diff-sec",
              resultStatus: "GRADED" as any,
              marksObtained: "85",
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_ENROLLMENT_NOT_ELIGIBLE",
      });
    });

    it("wrong Batch -> rejected in bulk grading", async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-tui",
        organizationId: "org-1",
        status: "ACTIVE",
        maximumMarks: 50,
        assessmentDate,
        subjectOffering: {
          tuitionOffering: { batchId: "batch-1" },
        },
      });

      // Enrollment belongs to batch-different
      prisma.studentEnrollment.findUnique.mockResolvedValue({
        id: "enr-diff-batch",
        organizationId: "org-1",
        placementType: "TUITION",
        startDate: new Date("2026-01-01"),
        endDate: null,
        tuitionPlacement: { batchId: "batch-different" },
      });

      await expect(
        service.bulkGrade(tenant, "asm-tui", {
          results: [
            {
              studentEnrollmentId: "enr-diff-batch",
              resultStatus: "GRADED" as any,
              marksObtained: "40",
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_ENROLLMENT_NOT_ELIGIBLE",
      });
    });
  });

  describe("Results Validation & Grading", () => {
    const activeAssessment = {
      id: "asm-1",
      organizationId: "org-1",
      status: "ACTIVE",
      maximumMarks: 100,
      assessmentDate: new Date("2026-05-15"),
      subjectOffering: {
        schoolOffering: { sectionId: "sec-1" },
      },
    };

    const validEnrollment = {
      id: "enr-1",
      organizationId: "org-1",
      placementType: "SCHOOL",
      startDate: new Date("2026-01-01"),
      endDate: null,
      schoolPlacement: { sectionId: "sec-1" },
    };

    it("valid GRADED result: should record marksObtained", async () => {
      prisma.assessment.findUnique.mockResolvedValue(activeAssessment);
      prisma.studentEnrollment.findUnique.mockResolvedValue(validEnrollment);
      prisma.assessmentResult.upsert.mockResolvedValue({ id: "res-1" });

      await service.bulkGrade(tenant, "asm-1", {
        results: [
          {
            studentEnrollmentId: "enr-1",
            resultStatus: "GRADED" as any,
            marksObtained: "92.5",
          },
        ],
      });

      expect(prisma.assessmentResult.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            resultStatus: "GRADED",
            marksObtained: "92.5",
          }),
        }),
      );
    });

    it("marks > maximum rejected", async () => {
      prisma.assessment.findUnique.mockResolvedValue(activeAssessment);

      await expect(
        service.bulkGrade(tenant, "asm-1", {
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "GRADED" as any,
              marksObtained: "105",
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_INVALID_MARKS",
      });
    });

    it("negative marks rejected", async () => {
      prisma.assessment.findUnique.mockResolvedValue(activeAssessment);

      await expect(
        service.bulkGrade(tenant, "asm-1", {
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "GRADED" as any,
              marksObtained: "-1",
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_INVALID_MARKS",
      });
    });

    it("GRADED requires marks", async () => {
      prisma.assessment.findUnique.mockResolvedValue(activeAssessment);

      await expect(
        service.bulkGrade(tenant, "asm-1", {
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "GRADED" as any,
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_RESULT_INVALID",
      });
    });

    it("ABSENT rejects marks", async () => {
      prisma.assessment.findUnique.mockResolvedValue(activeAssessment);

      await expect(
        service.bulkGrade(tenant, "asm-1", {
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "ABSENT" as any,
              marksObtained: "25",
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_RESULT_INVALID",
      });
    });

    it("EXEMPT rejects marks", async () => {
      prisma.assessment.findUnique.mockResolvedValue(activeAssessment);

      await expect(
        service.bulkGrade(tenant, "asm-1", {
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "EXEMPT" as any,
              marksObtained: "30",
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_RESULT_INVALID",
      });
    });

    it("wrong/cross-tenant Enrollment rejected", async () => {
      prisma.assessment.findUnique.mockResolvedValue(activeAssessment);
      prisma.studentEnrollment.findUnique.mockResolvedValue({
        id: "enr-other-org",
        organizationId: "other-org", // cross-tenant!
      });

      await expect(
        service.bulkGrade(tenant, "asm-1", {
          results: [
            {
              studentEnrollmentId: "enr-other-org",
              resultStatus: "ABSENT" as any,
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: "EDUCATION_CROSS_TENANT_REFERENCE",
      });
    });
  });

  describe("Publication & Concurrency Row-Locking", () => {
    const assessmentDate = new Date("2026-05-15");

    it("incomplete roster rejected: should throw when students are missing results", async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: "asm-1" }]);
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-1",
        organizationId: "org-1",
        status: "ACTIVE",
        assessmentDate,
        subjectOffering: {
          schoolOffering: { sectionId: "sec-1" },
        },
      });

      prisma.studentEnrollment.findMany.mockResolvedValue([
        {
          id: "enr-1",
          assessmentResults: [{ resultStatus: "GRADED" }],
        },
        {
          id: "enr-2",
          assessmentResults: [], // missing result!
        },
      ]);

      await expect(
        service.publishResults(tenant, "asm-1"),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_RESULTS_INCOMPLETE",
      });
    });

    it("complete roster publishes: transitions atomically to RESULTS_PUBLISHED", async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: "asm-1" }]);
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-1",
        organizationId: "org-1",
        status: "ACTIVE",
        assessmentDate,
        subjectOffering: {
          schoolOffering: { sectionId: "sec-1" },
        },
      });

      prisma.studentEnrollment.findMany.mockResolvedValue([
        {
          id: "enr-1",
          assessmentResults: [{ resultStatus: "GRADED" }],
        },
      ]);

      await service.publishResults(tenant, "asm-1");

      expect(prisma.assessment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "asm-1" },
          data: expect.objectContaining({
            status: "RESULTS_PUBLISHED",
          }),
        }),
      );
    });

    it("ABSENT and EXEMPT count as complete", async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: "asm-1" }]);
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-1",
        organizationId: "org-1",
        status: "ACTIVE",
        assessmentDate,
        subjectOffering: {
          schoolOffering: { sectionId: "sec-1" },
        },
      });

      prisma.studentEnrollment.findMany.mockResolvedValue([
        {
          id: "enr-1",
          assessmentResults: [{ resultStatus: "ABSENT" }],
        },
        {
          id: "enr-2",
          assessmentResults: [{ resultStatus: "EXEMPT" }],
        },
      ]);

      await service.publishResults(tenant, "asm-1");

      expect(prisma.assessment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "asm-1" },
          data: expect.objectContaining({
            status: "RESULTS_PUBLISHED",
          }),
        }),
      );
    });

    it("results immutable afterward: grading rejected once RESULTS_PUBLISHED", async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-published",
        organizationId: "org-1",
        status: "RESULTS_PUBLISHED",
      });

      await expect(
        service.bulkGrade(tenant, "asm-published", {
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "GRADED" as any,
              marksObtained: "80",
            },
          ],
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_RESULTS_PUBLISHED",
      });
    });

    it("second publish deterministic: calling publish on already published assessment returns safely", async () => {
      prisma.$queryRaw.mockResolvedValue([{ id: "asm-1" }]);
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-1",
        organizationId: "org-1",
        status: "RESULTS_PUBLISHED",
      });

      await expect(
        service.publishResults(tenant, "asm-1"),
      ).resolves.toBeUndefined();

      expect(prisma.assessment.update).not.toHaveBeenCalled();
    });
  });
});
