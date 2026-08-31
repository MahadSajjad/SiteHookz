import { Test, TestingModule } from "@nestjs/testing";
import { FeeHeadsService } from "./fee-heads.service";
import { PrismaService } from "../../../../infrastructure/database/prisma.service";

describe("FeeHeadsService", () => {
  let service: FeeHeadsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      feeHead: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeHeadsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FeeHeadsService>(FeeHeadsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a fee head", async () => {
      prisma.feeHead.findUnique.mockResolvedValue(null);
      const mockResult = {
        id: "1",
        name: "Test",
        code: "T1",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.feeHead.create.mockResolvedValue(mockResult);

      const result = await service.create("org-1", {
        name: "Test",
        code: "T1",
      });
      expect(result.id).toBe("1");
    });

    it("should throw ConflictException on duplicate code", async () => {
      prisma.feeHead.findUnique.mockResolvedValue({ id: "2" });

      await expect(
        service.create("org-1", { name: "Test", code: "T1" }),
      ).rejects.toThrow("Fee head with code T1 already exists");
    });
  });
});
