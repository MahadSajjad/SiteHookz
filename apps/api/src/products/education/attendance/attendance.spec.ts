import { Test, TestingModule } from "@nestjs/testing";
import { AttendanceSessionsController } from "./attendance-sessions.controller";
import { AttendanceSessionsService } from "./attendance-sessions.service";
import { StudentAttendanceController } from "./student-attendance.controller";
import { StudentAttendanceService } from "./student-attendance.service";

describe("AttendanceModule", () => {
  let sessionsController: AttendanceSessionsController;
  let studentController: StudentAttendanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceSessionsController, StudentAttendanceController],
      providers: [
        {
          provide: AttendanceSessionsService,
          useValue: {},
        },
        {
          provide: StudentAttendanceService,
          useValue: {},
        },
      ],
    }).compile();

    sessionsController = module.get<AttendanceSessionsController>(
      AttendanceSessionsController,
    );
    studentController = module.get<StudentAttendanceController>(
      StudentAttendanceController,
    );
  });

  it("should be defined", () => {
    expect(sessionsController).toBeDefined();
    expect(studentController).toBeDefined();
  });
});
