import { Test, TestingModule } from "@nestjs/testing";
import { AssessmentResultsService } from "./assessment-results.service";
import { AssessmentsService } from "./assessments.service";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { BadRequestException } from "@nestjs/common";

describe("AssessmentResultsService", () => {
  let service: AssessmentResultsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      assessment: {
        findUnique: jest.fn(),
      },
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

  it("should throw BadRequestException on publish if roster is incomplete", async () => {
    jest
      .spyOn(service, "getRoster")
      .mockResolvedValue([
        { studentEnrollmentId: "1", resultStatus: "GRADED" } as any,
        { studentEnrollmentId: "2", resultStatus: null } as any,
      ]);

    await expect(
      service.publishResults({ organizationId: "org1" } as any, "a1"),
    ).rejects.toThrow(BadRequestException);
  });
});
