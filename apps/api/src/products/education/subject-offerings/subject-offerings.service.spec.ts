import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { BusinessException } from "../../../common/exceptions/business.exception";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";

import { SubjectOfferingsRepository } from "./subject-offerings.repository";
import { SubjectOfferingsService } from "./subject-offerings.service";

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
      section: { findUnique: jest.fn() },
      batch: { findUnique: jest.fn() },
      subject: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectOfferingsService,
        { provide: SubjectOfferingsRepository, useValue: repo },
        { provide: AuthorizationService, useValue: authService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<SubjectOfferingsService>(SubjectOfferingsService);
  });

  const tenant: any = { organizationId: "org-1", userId: "u-1" };

  it("archived Subject cannot create offering", async () => {
    prisma.subject.findUnique.mockResolvedValue({
      id: "s1",
      archivedAt: new Date(),
    });
    await expect(
      service.createSchoolOffering(tenant, {
        subjectId: "s1",
        sectionId: "sec1",
      }),
    ).rejects.toThrow(BusinessException);
  });

  it("cross-tenant Section rejection (SCHOOL institution mismatch)", async () => {
    prisma.subject.findUnique.mockResolvedValue({ id: "s1", archivedAt: null });
    prisma.section.findUnique.mockResolvedValue(null);
    await expect(
      service.createSchoolOffering(tenant, {
        subjectId: "s1",
        sectionId: "sec-wrong",
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("cross-tenant Batch rejection (TUITION institution mismatch)", async () => {
    prisma.subject.findUnique.mockResolvedValue({ id: "s1", archivedAt: null });
    prisma.batch.findUnique.mockResolvedValue(null);
    await expect(
      service.createTuitionOffering(tenant, {
        subjectId: "s1",
        batchId: "b-wrong",
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("duplicate offering rejection", async () => {
    prisma.subject.findUnique.mockResolvedValue({ id: "s1", archivedAt: null });
    prisma.section.findUnique.mockResolvedValue({ id: "sec1", branchId: "b1" });
    repo.createSchoolOffering.mockResolvedValue(null); // Repo returns null on duplicate in our design

    await expect(
      service.createSchoolOffering(tenant, {
        subjectId: "s1",
        sectionId: "sec1",
      }),
    ).rejects.toThrow(BusinessException);
  });

  it("SCHOOL creates only School placement", async () => {
    prisma.subject.findUnique.mockResolvedValue({ id: "s1", archivedAt: null });
    prisma.section.findUnique.mockResolvedValue({ id: "sec1", branchId: "b1" });
    repo.createSchoolOffering.mockResolvedValue({ id: "off-1" });

    const res = await service.createSchoolOffering(tenant, {
      subjectId: "s1",
      sectionId: "sec1",
    });
    expect(repo.createSchoolOffering).toHaveBeenCalled();
    expect(repo.createTuitionOffering).not.toHaveBeenCalled();
    expect(res.id).toBe("off-1");
  });

  it("TUITION creates only Tuition placement", async () => {
    prisma.subject.findUnique.mockResolvedValue({ id: "s1", archivedAt: null });
    prisma.batch.findUnique.mockResolvedValue({ id: "bat1", branchId: "b1" });
    repo.createTuitionOffering.mockResolvedValue({ id: "off-2" });

    const res = await service.createTuitionOffering(tenant, {
      subjectId: "s1",
      batchId: "bat1",
    });
    expect(repo.createTuitionOffering).toHaveBeenCalled();
    expect(repo.createSchoolOffering).not.toHaveBeenCalled();
    expect(res.id).toBe("off-2");
  });

  it("inaccessible Branch offering rejected (Authorization)", async () => {
    prisma.subject.findUnique.mockResolvedValue({ id: "s1", archivedAt: null });
    prisma.section.findUnique.mockResolvedValue({ id: "sec1", branchId: "b1" });
    authService.assertPermission.mockRejectedValue(new Error("Forbidden"));

    await expect(
      service.createSchoolOffering(tenant, {
        subjectId: "s1",
        sectionId: "sec1",
      }),
    ).rejects.toThrow("Forbidden");
  });
});
