import { Module } from "@nestjs/common";
import { AssessmentsController } from "./assessments.controller";
import { AssessmentsService } from "./assessments.service";
import { AssessmentResultsService } from "./assessment-results.service";
import { DatabaseModule } from "../../../infrastructure/database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AssessmentResultsService],
  exports: [AssessmentsService, AssessmentResultsService],
})
export class AssessmentsModule {}
