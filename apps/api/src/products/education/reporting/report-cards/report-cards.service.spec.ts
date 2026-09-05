import { Test, TestingModule } from "@nestjs/testing";
import { ReportCardsService } from "./report-cards.service";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";
import { BusinessException } from "../../../../common/exceptions/business.exception";
import {
  ReportCardPassStatus,
  ReportCardStatus,
  GradingScaleStatus,
} from "@sitehookz/education";

describe("ReportCardsService", () => {
  let service: ReportCardsService;
  let prisma: any;

  const tenant = {
    organizationId: "org-1",
    membershipId: "mem-1",
  } as any;

  const mockGradingScale = {
    id: "scale-1",
    organizationId: "org-1",
    name: "Standard Scale",
    status: GradingScaleStatus.ACTIVE,
    bands: [
      {
        id: "b-1",
        name: "A",
        code: "A",
        minimumPercentage: "80.00",
        isPassing: true,
      },
      {
        id: "b-2",
        name: "B",
        code: "B",
        minimumPercentage: "60.00",
        isPassing: true,
      },
      {
        id: "b-3",
        name: "C",
        code: "C",
        minimumPercentage: "40.00",
        isPassing: true,
      },
      {
        id: "b-4",
        name: "F",
        code: "F",
        minimumPercentage: "0.00",
        isPassing: false,
      },
    ],
  };

  const mockSession = {
    id: "session-1",
    organizationId: "org-1",
    name: "2026",
  };

  const mockSection = {
    id: "sec-1",
    organizationId: "org-1",
    name: "Grade 10-A",
  };

  const mockStudentEnrollment = {
    id: "enr-1",
    organizationId: "org-1",
    studentId: "stu-1",
    student: { id: "stu-1", firstName: "Alice", lastName: "Smith" },
  };

  beforeEach(async () => {
    prisma = {
      academicSession: {
        findUnique: jest.fn().mockResolvedValue(mockSession),
      },
      section: {
        findUnique: jest.fn().mockResolvedValue(mockSection),
      },
      batch: {
        findUnique: jest.fn(),
      },
      gradingScale: {
        findUnique: jest.fn().mockResolvedValue(mockGradingScale),
        findFirst: jest.fn().mockResolvedValue(mockGradingScale),
      },
      studentEnrollment: {
        findMany: jest.fn().mockResolvedValue([mockStudentEnrollment]),
      },
      assessment: {
        findMany: jest.fn(),
      },
      reportCard: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args) => ({
          id: "rc-1",
          ...args.data,
          totalObtainedMarks: args.data.totalObtainedMarks.toString(),
          totalMaximumMarks: args.data.totalMaximumMarks.toString(),
          percentage: args.data.percentage.toString(),
          subjectResults: args.data.subjectResults.create.map(
            (sr: any, idx: number) => ({
              id: `sr-${idx}`,
              reportCardId: "rc-1",
              ...sr,
              obtainedMarks: sr.obtainedMarks.toString(),
              maximumMarks: sr.maximumMarks.toString(),
              percentage: sr.percentage.toString(),
            }),
          ),
        })),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      reportCardSubjectResult: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        if (typeof callback === "function") {
          return callback(prisma);
        }
        return callback;
      }),
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportCardsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReportCardsService>(ReportCardsService);
  });

  describe("generate - Result Status Rules & Marks Calculation", () => {
    it("enforces GRADED (normal marks), ABSENT (obtained=0, max=Assessment.max), and EXEMPT (obtained=0, max=0)", async () => {
      // Subject 1: Math with 1 GRADED (80/100)
      // Subject 2: Science with 1 ABSENT (0/100)
      // Subject 3: History with 1 EXEMPT (0/0)
      prisma.assessment.findMany.mockResolvedValue([
        {
          id: "asm-math",
          maximumMarks: "100.00",
          assessmentDate: new Date("2026-05-10"),
          subjectOffering: {
            subject: { id: "sub-math", name: "Mathematics", code: "MATH" },
          },
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "GRADED",
              marksObtained: "80.00",
            },
          ],
        },
        {
          id: "asm-sci",
          maximumMarks: "100.00",
          assessmentDate: new Date("2026-05-12"),
          subjectOffering: {
            subject: { id: "sub-sci", name: "Science", code: "SCI" },
          },
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "ABSENT",
              marksObtained: null,
            },
          ],
        },
        {
          id: "asm-hist",
          maximumMarks: "100.00",
          assessmentDate: new Date("2026-05-15"),
          subjectOffering: {
            subject: { id: "sub-hist", name: "History", code: "HIST" },
          },
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "EXEMPT",
              marksObtained: null,
            },
          ],
        },
      ]);

      const reportCards = await service.generate(tenant, {
        title: "Term 1 Report",
        periodStart: "2026-01-01T00:00:00.000Z",
        periodEnd: "2026-06-30T00:00:00.000Z",
        academicSessionId: "session-1",
        sectionId: "sec-1",
      });
      const reportCard = reportCards[0]!;

      expect(reportCard).toBeDefined();

      const mathResult = reportCard.subjectResults!.find(
        (sr) => sr.subjectCode === "MATH",
      );
      expect(mathResult).toBeDefined();
      expect(mathResult!.obtainedMarks).toBe(80);
      expect(mathResult!.maximumMarks).toBe(100);
      expect(mathResult!.percentage).toBe(80);
      expect(mathResult!.isPassing).toBe(true);
      expect(mathResult!.isExempt).toBe(false);
      expect(mathResult!.isAbsent).toBe(false);

      const sciResult = reportCard.subjectResults!.find(
        (sr) => sr.subjectCode === "SCI",
      );
      expect(sciResult).toBeDefined();
      expect(sciResult!.obtainedMarks).toBe(0);
      expect(sciResult!.maximumMarks).toBe(100);
      expect(sciResult!.percentage).toBe(0);
      expect(sciResult!.isPassing).toBe(false); // ABSENT -> 0% -> Fail
      expect(sciResult!.isAbsent).toBe(true);

      const histResult = reportCard.subjectResults!.find(
        (sr) => sr.subjectCode === "HIST",
      );
      expect(histResult).toBeDefined();
      expect(histResult!.obtainedMarks).toBe(0);
      expect(histResult!.maximumMarks).toBe(0);
      expect(histResult!.percentage).toBe(0);
      expect(histResult!.isExempt).toBe(true);
      expect(histResult!.isPassing).toBe(true); // EXEMPT does not fail

      // Total obtained: 80 + 0 + 0 = 80
      // Total max: 100 + 100 + 0 = 200
      expect(reportCard.totalObtainedMarks).toBe(80);
      expect(reportCard.totalMaximumMarks).toBe(200);
      expect(reportCard.percentage).toBe(40);

      // Since Science has isPassing = false, overall passStatus must be FAIL!
      expect(reportCard.passStatus).toBe(ReportCardPassStatus.FAIL);
    });

    it("sets overall passStatus to PASS if overall percentage passes and NO subject has FAIL", async () => {
      // 2 Subjects, both passing: Math (85/100), English (75/100)
      prisma.assessment.findMany.mockResolvedValue([
        {
          id: "asm-1",
          maximumMarks: "100.00",
          assessmentDate: new Date("2026-05-10"),
          subjectOffering: {
            subject: { id: "sub-1", name: "Math", code: "MATH" },
          },
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "GRADED",
              marksObtained: "85.00",
            },
          ],
        },
        {
          id: "asm-2",
          maximumMarks: "100.00",
          assessmentDate: new Date("2026-05-12"),
          subjectOffering: {
            subject: { id: "sub-2", name: "English", code: "ENG" },
          },
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "GRADED",
              marksObtained: "75.00",
            },
          ],
        },
      ]);

      const reportCard = (
        await service.generate(tenant, {
          title: "Term 1 Report",
          periodStart: "2026-01-01T00:00:00.000Z",
          periodEnd: "2026-06-30T00:00:00.000Z",
          academicSessionId: "session-1",
          sectionId: "sec-1",
        })
      )[0]!;

      expect(reportCard.percentage).toBe(80); // (160 / 200) * 100
      expect(reportCard.overallGradeCode).toBe("A");
      expect(reportCard.passStatus).toBe(ReportCardPassStatus.PASS);
    });

    it("sets overall passStatus to FAIL if ANY subject has FAIL, even if overall percentage passes", async () => {
      // Subject 1: Math 95/100 (Pass, Band A)
      // Subject 2: English 20/100 (Fail, Band F, min passing is 40)
      // Total marks: 115/200 = 57.5% (Band C is passing 40%)
      prisma.assessment.findMany.mockResolvedValue([
        {
          id: "asm-1",
          maximumMarks: "100.00",
          assessmentDate: new Date("2026-05-10"),
          subjectOffering: {
            subject: { id: "sub-1", name: "Math", code: "MATH" },
          },
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "GRADED",
              marksObtained: "95.00",
            },
          ],
        },
        {
          id: "asm-2",
          maximumMarks: "100.00",
          assessmentDate: new Date("2026-05-12"),
          subjectOffering: {
            subject: { id: "sub-2", name: "English", code: "ENG" },
          },
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "GRADED",
              marksObtained: "20.00",
            },
          ],
        },
      ]);

      const reportCard = (
        await service.generate(tenant, {
          title: "Term 1 Report",
          periodStart: "2026-01-01T00:00:00.000Z",
          periodEnd: "2026-06-30T00:00:00.000Z",
          academicSessionId: "session-1",
          sectionId: "sec-1",
        })
      )[0]!;

      expect(reportCard.percentage).toBe(57.5);
      expect(reportCard.passStatus).toBe(ReportCardPassStatus.FAIL);
    });

    it("sets overall passStatus to NOT_GRADED if all subjects are EXEMPT", async () => {
      prisma.assessment.findMany.mockResolvedValue([
        {
          id: "asm-1",
          maximumMarks: "100.00",
          assessmentDate: new Date("2026-05-10"),
          subjectOffering: {
            subject: { id: "sub-1", name: "Music", code: "MUS" },
          },
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "EXEMPT",
              marksObtained: null,
            },
          ],
        },
        {
          id: "asm-2",
          maximumMarks: "50.00",
          assessmentDate: new Date("2026-05-12"),
          subjectOffering: {
            subject: { id: "sub-2", name: "Art", code: "ART" },
          },
          results: [
            {
              studentEnrollmentId: "enr-1",
              resultStatus: "EXEMPT",
              marksObtained: null,
            },
          ],
        },
      ]);

      const reportCard = (
        await service.generate(tenant, {
          title: "Term 1 Report",
          periodStart: "2026-01-01T00:00:00.000Z",
          periodEnd: "2026-06-30T00:00:00.000Z",
          academicSessionId: "session-1",
          sectionId: "sec-1",
        })
      )[0]!;

      expect(reportCard.totalObtainedMarks).toBe(0);
      expect(reportCard.totalMaximumMarks).toBe(0);
      expect(reportCard.passStatus).toBe(ReportCardPassStatus.NOT_GRADED);
    });
  });

  describe("publish - FOR UPDATE lock and state transition", () => {
    it("uses FOR UPDATE query and publishes DRAFT report card", async () => {
      const reportCardId = "rc-1";

      prisma.$queryRaw.mockResolvedValue([{ id: reportCardId }]);

      prisma.reportCard.findUnique.mockResolvedValue({
        id: reportCardId,
        organizationId: "org-1",
        status: ReportCardStatus.DRAFT,
        subjectResults: [],
      });

      prisma.reportCard.update.mockResolvedValue({
        id: reportCardId,
        organizationId: "org-1",
        status: ReportCardStatus.PUBLISHED,
        publishedAt: new Date(),
        subjectResults: [],
      });

      const published = (
        await service.publish(tenant, {
          reportCardIds: [reportCardId],
        })
      )[0]!;

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(published.status).toBe(ReportCardStatus.PUBLISHED);
      expect(prisma.reportCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: reportCardId },
          data: expect.objectContaining({
            status: ReportCardStatus.PUBLISHED,
          }),
        }),
      );
    });

    it("throws REPORT_CARD_NOT_FOUND if report card is not returned by lock query", async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      await expect(
        service.publish(tenant, {
          reportCardIds: ["non-existent-rc"],
        }),
      ).rejects.toMatchObject({
        code: "REPORT_CARD_NOT_FOUND",
      });
    });
  });
});
