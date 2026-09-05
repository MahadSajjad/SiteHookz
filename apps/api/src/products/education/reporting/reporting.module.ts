import { Module } from "@nestjs/common";
import { GradingScalesModule } from "./grading-scales/grading-scales.module";
import { ReportCardsModule } from "./report-cards/report-cards.module";

@Module({
  imports: [GradingScalesModule, ReportCardsModule],
  exports: [GradingScalesModule, ReportCardsModule],
})
export class ReportingModule {}
