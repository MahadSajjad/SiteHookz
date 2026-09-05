import { Test, TestingModule } from "@nestjs/testing";
import { GradingScalesService } from "./grading-scales.service";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";
import { BusinessException } from "../../../../common/exceptions/business.exception";
import { GradingScaleStatus } from "@sitehookz/education";

describe("GradingScalesService", () => {
  let service: GradingScalesService;
  let prisma: any;

  const tenant = {
    organizationId: "org-1",
    membershipId: "mem-1",
  } as any;

  beforeEach(async () => {
    prisma = {
      gradingScale: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      gradingScaleBand: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        if (typeof callback === "function") {
          return callback(prisma);
        }
        return callback;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradingScalesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<GradingScalesService>(GradingScalesService);
  });

  describe("create", () => {
    it("creates a grading scale in DRAFT status with bands", async () => {
      const dto = {
        name: "Standard Grading Scale",
        description: "Primary grading scale",
        bands: [
          { name: "A", code: "A", minimumPercentage: 90, isPassing: true },
          { name: "B", code: "B", minimumPercentage: 80, isPassing: true },
          { name: "F", code: "F", minimumPercentage: 0, isPassing: false },
        ],
      };

      prisma.gradingScale.create.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        name: "Standard Grading Scale",
        description: "Primary grading scale",
        status: GradingScaleStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        bands: [
          {
            id: "b-1",
            gradingScaleId: "gs-1",
            name: "A",
            code: "A",
            minimumPercentage: "90.00",
            isPassing: true,
          },
          {
            id: "b-2",
            gradingScaleId: "gs-1",
            name: "B",
            code: "B",
            minimumPercentage: "80.00",
            isPassing: true,
          },
          {
            id: "b-3",
            gradingScaleId: "gs-1",
            name: "F",
            code: "F",
            minimumPercentage: "0.00",
            isPassing: false,
          },
        ],
      });

      const result = await service.create(tenant, dto);

      expect(result.id).toBe("gs-1");
      expect(result.status).toBe(GradingScaleStatus.DRAFT);
      expect(result.bands).toHaveLength(3);
      expect(result.bands![0]!.minimumPercentage).toBe(90);
      expect(prisma.gradingScale.create).toHaveBeenCalled();
    });

    it("throws error if duplicate band codes exist", async () => {
      const dto = {
        name: "Invalid Scale",
        bands: [
          { name: "A Plus", code: "A", minimumPercentage: 95, isPassing: true },
          { name: "A Plain", code: "A", minimumPercentage: 90, isPassing: true },
        ],
      };

      await expect(service.create(tenant, dto)).rejects.toThrow(BusinessException);
    });
  });

  describe("update and transitions", () => {
    it("allows editing bands while in DRAFT status", async () => {
      prisma.gradingScale.findUnique.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        name: "Scale",
        status: GradingScaleStatus.DRAFT,
        bands: [],
      });

      prisma.gradingScale.update.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        name: "Updated Scale",
        status: GradingScaleStatus.DRAFT,
        bands: [
          {
            id: "b-1",
            name: "Pass",
            code: "P",
            minimumPercentage: "50.00",
            isPassing: true,
          },
        ],
      });

      const result = await service.update(tenant, "gs-1", {
        name: "Updated Scale",
        bands: [
          { name: "Pass", code: "P", minimumPercentage: 50, isPassing: true },
        ],
      });

      expect(result.name).toBe("Updated Scale");
      expect(prisma.gradingScaleBand.deleteMany).toHaveBeenCalled();
      expect(prisma.gradingScaleBand.createMany).toHaveBeenCalled();
    });

    it("rejects editing bands if status is ACTIVE", async () => {
      prisma.gradingScale.findUnique.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        name: "Active Scale",
        status: GradingScaleStatus.ACTIVE,
        bands: [],
      });

      await expect(
        service.update(tenant, "gs-1", {
          bands: [
            { name: "A", code: "A", minimumPercentage: 90, isPassing: true },
          ],
        }),
      ).rejects.toMatchObject({
        code: "GRADING_SCALE_CANNOT_EDIT_BANDS",
      });
    });

    it("allows DRAFT -> ACTIVE transition", async () => {
      prisma.gradingScale.findUnique.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        status: GradingScaleStatus.DRAFT,
        bands: [],
      });

      prisma.gradingScale.update.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        status: GradingScaleStatus.ACTIVE,
        bands: [],
      });

      const result = await service.activate(tenant, "gs-1");
      expect(result.status).toBe(GradingScaleStatus.ACTIVE);
    });

    it("allows ACTIVE -> ARCHIVED transition", async () => {
      prisma.gradingScale.findUnique.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        status: GradingScaleStatus.ACTIVE,
        bands: [],
      });

      prisma.gradingScale.update.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        status: GradingScaleStatus.ARCHIVED,
        bands: [],
      });

      const result = await service.archive(tenant, "gs-1");
      expect(result.status).toBe(GradingScaleStatus.ARCHIVED);
    });

    it("rejects DRAFT -> ARCHIVED transition", async () => {
      prisma.gradingScale.findUnique.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        status: GradingScaleStatus.DRAFT,
        bands: [],
      });

      await expect(
        service.update(tenant, "gs-1", { status: GradingScaleStatus.ARCHIVED }),
      ).rejects.toMatchObject({
        code: "GRADING_SCALE_INVALID_STATUS_TRANSITION",
      });
    });

    it("rejects ARCHIVED -> ACTIVE transition", async () => {
      prisma.gradingScale.findUnique.mockResolvedValue({
        id: "gs-1",
        organizationId: "org-1",
        status: GradingScaleStatus.ARCHIVED,
        bands: [],
      });

      await expect(
        service.update(tenant, "gs-1", { status: GradingScaleStatus.ACTIVE }),
      ).rejects.toMatchObject({
        code: "GRADING_SCALE_INVALID_STATUS_TRANSITION",
      });
    });
  });

  describe("cross-tenant isolation", () => {
    it("throws 403 on cross-tenant access", async () => {
      prisma.gradingScale.findUnique.mockResolvedValue({
        id: "gs-2",
        organizationId: "org-other",
        status: GradingScaleStatus.ACTIVE,
      });

      await expect(service.findById(tenant, "gs-2")).rejects.toMatchObject({
        code: "EDUCATION_CROSS_TENANT_REFERENCE",
      });
    });
  });
});
