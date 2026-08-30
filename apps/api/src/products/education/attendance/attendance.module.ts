import { Module } from "@nestjs/common";
import { AttendanceSessionsController } from "./attendance-sessions.controller";
import { AttendanceSessionsService } from "./attendance-sessions.service";
import { AttendanceSessionsRepository } from "./attendance-sessions.repository";
import { StudentAttendanceController } from "./student-attendance.controller";
import { StudentAttendanceService } from "./student-attendance.service";
import { StudentAttendanceRepository } from "./student-attendance.repository";

@Module({
  controllers: [AttendanceSessionsController, StudentAttendanceController],
  providers: [
    AttendanceSessionsService,
    AttendanceSessionsRepository,
    StudentAttendanceService,
    StudentAttendanceRepository,
  ],
  exports: [AttendanceSessionsService, StudentAttendanceService],
})
export class AttendanceModule {}
