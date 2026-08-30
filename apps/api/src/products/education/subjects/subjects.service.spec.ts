import { Test, TestingModule } from "@nestjs/testing";
import { SubjectsService } from "./subjects.service";
import { SubjectsRepository } from "./subjects.repository";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { BusinessException } from "../../../common/exceptions/business.exception";

describe("SubjectsService", () => {
  let service: SubjectsService;
  let repo: any;
  let authService: any;

  beforeEach(async () => {
    repo = {
      findByCode: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      archive: jest.fn(),
    };
    authService = {
      assertPermission: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: SubjectsRepository, useValue: repo },
        { provide: AuthorizationService, useValue: authService },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
  });

  it("should enforce tenant isolation and check duplicate code", async () => {
    const tenant = { organizationId: "org-1", userId: "u-1" };
    repo.findByCode.mockResolvedValue({ id: "sub-1", code: "MATH101", organizationId: "org-1" });

    await expect(service.create(tenant, { name: "Math", code: "MATH101" }))
      .rejects.toThrow(BusinessException);
    expect(repo.findByCode).toHaveBeenCalledWith(tenant, "MATH101");
  });

  it("should prevent archiving a subject that has active offerings", async () => {
    // We will just verify the mock calls if we mock findById
    const tenant = { organizationId: "org-1", userId: "u-1" };
    repo.findById.mockResolvedValue({
      id: "sub-1",
      offerings: [{ status: "ACTIVE" }],
    });

    await expect(service.archive(tenant, "sub-1")).rejects.toThrow(BusinessException);
  });
});
