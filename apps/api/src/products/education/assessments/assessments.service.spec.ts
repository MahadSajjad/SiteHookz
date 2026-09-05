import { Test, TestingModule } from "@nestjs/testing";
import { AssessmentsService } from "./assessments.service";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { BusinessException } from "../../../common/exceptions/business.exception";

describe("AssessmentsService", () => {
  let service: AssessmentsService;
  let prisma: any;

  const tenant = {
    organizationId: "org-1",
    membershipId: "mem-1",
  } as any;

  beforeEach(async () => {
    prisma = {
      subjectOffering: {
        findUnique: jest.fn(),
      },
      educationOrganizationProfile: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      assessment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
  });

  describe("Assessment Creation", () => {
    it("School creation: should create a draft assessment within academic session bounds", async () => {
      prisma.subjectOffering.findUnique.mockResolvedValue({
        id: "so-school",
        organizationId: "org-1",
        schoolOffering: {
          section: {
            academicSession: {
              startDate: new Date("2026-01-01"),
              endDate: new Date("2026-12-31"),
            },
          },
        },
      });

      prisma.assessment.create.mockResolvedValue({
        id: "asm-1",
        organizationId: "org-1",
        subjectOfferingId: "so-school",
        title: "Midterm Exam",
        assessmentType: "MIDTERM",
        assessmentDate: new Date("2026-06-15"),
        maximumMarks: { toString: () => "100.00" },
        passingMarks: { toString: () => "40.00" },
        status: "DRAFT",
      });

      const result = await service.create(tenant, {
        subjectOfferingId: "so-school",
        title: "Midterm Exam",
        assessmentType: "MIDTERM" as any,
        assessmentDate: new Date("2026-06-15"),
        maximumMarks: "100.00",
        passingMarks: "40.00",
      });

      expect(result.id).toBe("asm-1");
      expect(result.status).toBe("DRAFT");
      expect(prisma.assessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "DRAFT",
            subjectOfferingId: "so-school",
          }),
        }),
      );
    });

    it("Tuition creation: should create a draft assessment within batch bounds", async () => {
      prisma.subjectOffering.findUnique.mockResolvedValue({
        id: "so-tuition",
        organizationId: "org-1",
        tuitionOffering: {
          batch: {
            startDate: new Date("2026-02-01"),
            endDate: new Date("2026-11-30"),
          },
        },
      });

      prisma.assessment.create.mockResolvedValue({
        id: "asm-2",
        organizationId: "org-1",
        subjectOfferingId: "so-tuition",
        title: "Chapter 1 Quiz",
        assessmentType: "QUIZ",
        assessmentDate: new Date("2026-03-10"),
        maximumMarks: { toString: () => "25.00" },
        passingMarks: null,
        status: "DRAFT",
      });

      const result = await service.create(tenant, {
        subjectOfferingId: "so-tuition",
        title: "Chapter 1 Quiz",
        assessmentType: "QUIZ" as any,
        assessmentDate: new Date("2026-03-10"),
        maximumMarks: "25.00",
      });

      expect(result.id).toBe("asm-2");
      expect(result.status).toBe("DRAFT");
    });

    it("institution mismatch: should reject creation when organization profile does not match offering context", async () => {
      prisma.subjectOffering.findUnique.mockResolvedValue({
        id: "so-tuition",
        organizationId: "org-1",
        tuitionOffering: {
          batch: {
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-12-31"),
          },
        },
      });

      prisma.educationOrganizationProfile.findUnique.mockResolvedValue({
        organizationId: "org-1",
        institutionType: "SCHOOL",
      });

      await expect(
        service.create(tenant, {
          subjectOfferingId: "so-tuition",
          title: "Math Test",
          assessmentType: "TEST" as any,
          assessmentDate: new Date("2026-05-01"),
          maximumMarks: "50",
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_CONTEXT_MISMATCH",
      });
    });

    it("invalid date: should reject date outside academic session boundaries", async () => {
      prisma.subjectOffering.findUnique.mockResolvedValue({
        id: "so-school",
        organizationId: "org-1",
        schoolOffering: {
          section: {
            academicSession: {
              startDate: new Date("2026-01-01"),
              endDate: new Date("2026-12-31"),
            },
          },
        },
      });

      await expect(
        service.create(tenant, {
          subjectOfferingId: "so-school",
          title: "Early Quiz",
          assessmentType: "QUIZ" as any,
          assessmentDate: new Date("2025-12-31"),
          maximumMarks: "20",
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_DATE_OUTSIDE_ACADEMIC_CONTEXT",
      });
    });

    it("invalid max/passing marks: should reject max <= 0, passing < 0, and passing > max", async () => {
      // max <= 0
      await expect(
        service.create(tenant, {
          subjectOfferingId: "so-1",
          title: "Bad Marks",
          assessmentType: "QUIZ" as any,
          assessmentDate: new Date(),
          maximumMarks: "0",
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_INVALID_MARKS",
      });

      // passing < 0
      await expect(
        service.create(tenant, {
          subjectOfferingId: "so-1",
          title: "Bad Marks",
          assessmentType: "QUIZ" as any,
          assessmentDate: new Date(),
          maximumMarks: "100",
          passingMarks: "-5",
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_INVALID_MARKS",
      });

      // passing > max
      await expect(
        service.create(tenant, {
          subjectOfferingId: "so-1",
          title: "Bad Marks",
          assessmentType: "QUIZ" as any,
          assessmentDate: new Date(),
          maximumMarks: "100",
          passingMarks: "105",
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_INVALID_MARKS",
      });
    });
  });

  describe("Assessment Activation & Immutability", () => {
    it("activation: should activate a DRAFT assessment", async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-draft",
        organizationId: "org-1",
        status: "DRAFT",
      });

      prisma.assessment.update.mockResolvedValue({
        id: "asm-draft",
        organizationId: "org-1",
        status: "ACTIVE",
        maximumMarks: { toString: () => "100" },
        passingMarks: null,
      });

      const result = await service.activate(tenant, "asm-draft");
      expect(result.status).toBe("ACTIVE");
      expect(prisma.assessment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "ACTIVE" }),
        }),
      );
    });

    it("activation: should reject activating a non-DRAFT assessment", async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-active",
        organizationId: "org-1",
        status: "ACTIVE",
      });

      await expect(
        service.activate(tenant, "asm-active"),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_INVALID_STATE",
      });
    });

    it("ACTIVE structural immutability: should reject structural edits when ACTIVE", async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-active",
        organizationId: "org-1",
        status: "ACTIVE",
        maximumMarks: { toString: () => "100" },
        passingMarks: { toString: () => "40" },
        subjectOffering: {
          schoolOffering: {
            section: {
              academicSession: {
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-12-31"),
              },
            },
          },
        },
      });

      // Attempt to change maximumMarks
      await expect(
        service.update(tenant, "asm-active", {
          maximumMarks: "120",
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_INVALID_STATE",
      });

      // Attempt to change assessmentDate
      await expect(
        service.update(tenant, "asm-active", {
          assessmentDate: "2026-07-01",
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_INVALID_STATE",
      });

      // Attempt to change assessmentType
      await expect(
        service.update(tenant, "asm-active", {
          assessmentType: "FINAL" as any,
        }),
      ).rejects.toMatchObject({
        code: "ASSESSMENT_INVALID_STATE",
      });
    });

    it("ACTIVE structural immutability: should allow non-structural edits (title, description) when ACTIVE", async () => {
      prisma.assessment.findUnique.mockResolvedValue({
        id: "asm-active",
        organizationId: "org-1",
        status: "ACTIVE",
        maximumMarks: { toString: () => "100" },
        passingMarks: { toString: () => "40" },
        subjectOffering: {},
      });

      prisma.assessment.update.mockResolvedValue({
        id: "asm-active",
        organizationId: "org-1",
        title: "Updated Title",
        description: "Updated Description",
        maximumMarks: { toString: () => "100" },
        passingMarks: { toString: () => "40" },
        status: "ACTIVE",
      });

      const result = await service.update(tenant, "asm-active", {
        title: "Updated Title",
        description: "Updated Description",
      });

      expect(result.title).toBe("Updated Title");
      expect(prisma.assessment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Updated Title",
            description: "Updated Description",
          }),
        }),
      );
    });
  });
});
