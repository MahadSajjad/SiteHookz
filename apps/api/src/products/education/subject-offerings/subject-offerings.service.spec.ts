import { Test, TestingModule } from "@nestjs/testing";
import { SubjectOfferingsService } from "./subject-offerings.service";
import { SubjectOfferingsRepository } from "./subject-offerings.repository";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { BusinessException } from "../../../common/exceptions/business.exception";

describe("SubjectOfferingsService", () => {
  let service: SubjectOfferingsService;
  let repo: any;
  let authService: any;
  let prisma: any;

  beforeEach(async () => {
    repo = {
      createSchoolOffering: jest.fn(),
      createTuitionOffering: jest.fn(),
    };
    authService = {
      assertPermission: jest.fn().mockResolvedValue(true),
    };
    prisma = {
      section: { findFirst: jest.fn() },
      batch: { findFirst: jest.fn() },
      subject: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectOfferingsService,
        { provide: SubjectOfferingsRepository, useValue: repo },
        { provide: AuthorizationService, useValue: authService },
        { provide: 'PrismaService', useValue: prisma },
      ],
    }).compile();

    service = module.get<SubjectOfferingsService>(SubjectOfferingsService);
  });

  it("should block creation if tenant mismatch or missing", async () => {
    prisma.section.findFirst.mockResolvedValue(null);
    const tenant = { organizationId: "org-1", userId: "u-1" };
    await expect(service.createSchoolOffering(tenant, { subjectId: "s1", sectionId: "sec1" }))
      .rejects.toThrow();
  });
});
