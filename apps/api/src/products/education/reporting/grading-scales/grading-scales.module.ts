import { Module } from "@nestjs/common";
import { GradingScalesService } from "./grading-scales.service";
import { GradingScalesController } from "./grading-scales.controller";

@Module({
  controllers: [GradingScalesController],
  providers: [GradingScalesService],
  exports: [GradingScalesService],
})
export class GradingScalesModule {}
