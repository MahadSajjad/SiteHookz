import { Test, TestingModule } from "@nestjs/testing";
import { AssessmentsService } from "./assessments.service";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { BadRequestException } from "@nestjs/common";

describe("AssessmentsService", () => {
  let service: AssessmentsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      subjectOffering: {
        findUnique: jest.fn(),
      },
      assessment: {
        create: jest.fn(),
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

  it("should throw BadRequestException if passingMarks > maximumMarks", async () => {
    await expect(
      service.create({ organizationId: "org1" } as any, {
        subjectOfferingId: "so1",
        title: "Test",
        assessmentType: "QUIZ" as any,
        assessmentDate: new Date(),
        maximumMarks: "100",
        passingMarks: "101",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("should throw BadRequestException if assessment date is out of academic session bounds", async () => {
    prisma.subjectOffering.findUnique.mockResolvedValue({
      id: "so1",
      section: {
        batch: {
          academicSession: {
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-12-31"),
          },
        },
      },
    });

    await expect(
      service.create({ organizationId: "org1" } as any, {
        subjectOfferingId: "so1",
        title: "Test",
        assessmentType: "QUIZ" as any,
        assessmentDate: new Date("2027-01-01"),
        maximumMarks: "100",
        passingMarks: "50",
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
