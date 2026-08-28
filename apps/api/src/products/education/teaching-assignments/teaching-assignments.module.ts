import { Module } from "@nestjs/common";
import { TeachingAssignmentsController } from "./teaching-assignments.controller";
import { TeachingAssignmentsService } from "./teaching-assignments.service";
import { TeachingAssignmentsRepository } from "./teaching-assignments.repository";

@Module({
  controllers: [TeachingAssignmentsController],
  providers: [TeachingAssignmentsService, TeachingAssignmentsRepository],
  exports: [TeachingAssignmentsService],
})
export class TeachingAssignmentsModule {}
