import { Module } from "@nestjs/common";
import { StudentFinancialSummaryService } from "./student-financial-summary.service";
import { StudentFinancialSummaryController } from "./student-financial-summary.controller";

@Module({
  controllers: [StudentFinancialSummaryController],
  providers: [StudentFinancialSummaryService],
  exports: [StudentFinancialSummaryService],
})
export class StudentFinancialSummaryModule {}
