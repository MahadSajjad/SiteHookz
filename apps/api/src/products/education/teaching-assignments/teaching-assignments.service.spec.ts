import { Test, TestingModule } from "@nestjs/testing";
import { TeachingAssignmentsService } from "./teaching-assignments.service";
import { TeachingAssignmentsRepository } from "./teaching-assignments.repository";
import { AuthorizationService } from "../../../platform/authorization/authorization.service";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

describe("TeachingAssignmentsService", () => {
  let service: TeachingAssignmentsService;
  let repo: any;
  let authService: any;
  let prisma: any;

  beforeEach(async () => {
    repo = {};
    authService = {};
    prisma = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachingAssignmentsService,
        { provide: TeachingAssignmentsRepository, useValue: repo },
        { provide: AuthorizationService, useValue: authService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TeachingAssignmentsService>(TeachingAssignmentsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
