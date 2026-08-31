import { Module } from '@nestjs/common';
import { FeeHeadsModule } from './fee-heads/fee-heads.module';
import { FeePlansModule } from './fee-plans/fee-plans.module';
import { FeeAssignmentsModule } from './fee-assignments/fee-assignments.module';
import { FeeChargesModule } from './fee-charges/fee-charges.module';
import { PaymentsModule } from './payments/payments.module';
import { StudentFinancialSummaryModule } from './financial-summary/student-financial-summary.module';

@Module({
  imports: [
    FeeHeadsModule,
    FeePlansModule,
    FeeAssignmentsModule,
    FeeChargesModule,
    PaymentsModule,
    StudentFinancialSummaryModule,
  ],
  exports: [
    FeeHeadsModule,
    FeePlansModule,
    FeeAssignmentsModule,
    FeeChargesModule,
    PaymentsModule,
    StudentFinancialSummaryModule,
  ],
})
export class FeesModule {}
