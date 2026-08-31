import { Module } from '@nestjs/common';
import { FeeAssignmentsService } from './fee-assignments.service';
import { FeeAssignmentsController } from './fee-assignments.controller';

@Module({
  controllers: [FeeAssignmentsController],
  providers: [FeeAssignmentsService],
  exports: [FeeAssignmentsService],
})
export class FeeAssignmentsModule {}
