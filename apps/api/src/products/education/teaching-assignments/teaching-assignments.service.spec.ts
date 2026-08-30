import { Test, TestingModule } from "@nestjs/testing";

import { BusinessException } from "../../../common/exceptions/business.exception";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";

import { TeachingAssignmentsRepository } from "./teaching-assignments.repository";
import { TeachingAssignmentsService } from "./teaching-assignments.service";

describe("TeachingAssignmentsService", () => {
  let service: TeachingAssignmentsService;
  let repo: any;
  let authService: any;
  let prisma: any;

  beforeEach(async () => {
    repo = {
      assign: jest.fn(),
      findActiveAssignment: jest.fn(),
      findById: jest.fn(),
      endAssignment: jest.fn(),
    };
    authService = {
      assertPermission: jest.fn().mockResolvedValue(true),
    };
    prisma = {
      subjectOffering: { findUnique: jest.fn() },
      staffBranchAssignment: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachingAssignmentsService,
        { provide: TeachingAssignmentsRepository, useValue: repo },
        { provide: AuthorizationService, useValue: authService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TeachingAssignmentsService>(
      TeachingAssignmentsService,
    );
  });

  const tenant: any = { organizationId: "org-1", userId: "u-1" };

  it("eligible Staff assignment: succeeds if staff is active in branch and no duplicate", async () => {
    prisma.subjectOffering.findUnique.mockResolvedValue({
      id: "off-1",
      schoolOffering: { section: { branchId: "b1" } },
    });
    prisma.staffBranchAssignment.findFirst.mockResolvedValue({ id: "sba-1" });
    repo.findActiveAssignment.mockResolvedValue(null);
    repo.assign.mockResolvedValue({ id: "ta-1" });

    const result = await service.assign(tenant, {
      subjectOfferingId: "off-1",
      staffMemberId: "sm-1",
    });
    expect(result.id).toBe("ta-1");
  });

  it("Staff Branch mismatch: rejects if staff has no active assignment in branch", async () => {
    prisma.subjectOffering.findUnique.mockResolvedValue({
      id: "off-1",
      schoolOffering: { section: { branchId: "b1" } },
    });
    prisma.staffBranchAssignment.findFirst.mockResolvedValue(null);

    await expect(
      service.assign(tenant, {
        subjectOfferingId: "off-1",
        staffMemberId: "sm-1",
      }),
    ).rejects.toThrow(BusinessException);
  });

  it("duplicate active assignment: rejects if existing assignment is active", async () => {
    prisma.subjectOffering.findUnique.mockResolvedValue({
      id: "off-1",
      schoolOffering: { section: { branchId: "b1" } },
    });
    prisma.staffBranchAssignment.findFirst.mockResolvedValue({ id: "sba-1" });
    repo.findActiveAssignment.mockResolvedValue({ id: "ta-existing" });

    await expect(
      service.assign(tenant, {
        subjectOfferingId: "off-1",
        staffMemberId: "sm-1",
      }),
    ).rejects.toThrow(BusinessException);
  });

  it("caller permission and Staff eligibility remain independent checks", async () => {
    // Auth fails before staff eligibility check
    prisma.subjectOffering.findUnique.mockResolvedValue({
      id: "off-1",
      schoolOffering: { section: { branchId: "b1" } },
    });
    authService.assertPermission.mockRejectedValue(new Error("Forbidden"));

    await expect(
      service.assign(tenant, {
        subjectOfferingId: "off-1",
        staffMemberId: "sm-1",
      }),
    ).rejects.toThrow("Forbidden");
    expect(prisma.staffBranchAssignment.findFirst).not.toHaveBeenCalled();
  });

  it("ending preserves historical record (calls endAssignment repository)", async () => {
    repo.findById.mockResolvedValue({ id: "ta-1", subjectOfferingId: "off-1" });
    prisma.subjectOffering.findUnique.mockResolvedValue({
      id: "off-1",
      schoolOffering: { section: { branchId: "b1" } },
    });
    repo.endAssignment.mockResolvedValue({ id: "ta-1", endDate: new Date() });

    const result = await service.endAssignment(tenant, "ta-1", {
      endDate: "2026-12-31",
    });
    expect(repo.endAssignment).toHaveBeenCalled();
    expect(result.endDate).toBeDefined();
  });
});
