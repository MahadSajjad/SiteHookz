import { Test, TestingModule } from "@nestjs/testing";

import { BusinessException } from "../../../common/exceptions/business.exception";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";

import { SubjectsRepository } from "./subjects.repository";
import { SubjectsService } from "./subjects.service";

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
      restore: jest.fn(),
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

  it("duplicate code: should reject creation if subject code is duplicate", async () => {
    const tenant: any = { organizationId: "org-1", userId: "u-1" };
    repo.create.mockRejectedValue({ code: "P2002" });

    await expect(
      service.create(tenant, { name: "Math", code: "MATH101" }),
    ).rejects.toThrow(BusinessException);
  });

  it("tenant isolation: should pass tenant context to repository", async () => {
    const tenant: any = { organizationId: "org-2", userId: "u-2" };
    repo.create.mockResolvedValue({ id: "sub-2" });
    await service.create(tenant, { name: "Sci", code: "SCI101" });
    expect(repo.create).toHaveBeenCalledWith(tenant, expect.anything());
  });

  it("archive/restore: should call archive successfully", async () => {
    const tenant: any = { organizationId: "org-1", userId: "u-1" };
    repo.findById.mockResolvedValue({ id: "sub-1" });
    repo.archive.mockResolvedValue(true);
    await service.archive(tenant, "sub-1");
    expect(repo.archive).toHaveBeenCalledWith(tenant, "sub-1");
  });

  // Notice restore is not formally in the controller yet, but we test the pattern if it existed, or we just test archive.
});
