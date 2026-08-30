import { Module } from "@nestjs/common";

import { TeachingAssignmentsController } from "./teaching-assignments.controller";
import { TeachingAssignmentsRepository } from "./teaching-assignments.repository";
import { TeachingAssignmentsService } from "./teaching-assignments.service";

@Module({
  controllers: [TeachingAssignmentsController],
  providers: [TeachingAssignmentsService, TeachingAssignmentsRepository],
  exports: [TeachingAssignmentsService],
})
export class TeachingAssignmentsModule {}
