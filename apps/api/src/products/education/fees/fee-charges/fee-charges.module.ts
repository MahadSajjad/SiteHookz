import { Module } from '@nestjs/common';
import { FeeChargesService } from './fee-charges.service';
import { FeeChargesController, FeeChargesVoidController } from './fee-charges.controller';

@Module({
  controllers: [FeeChargesController, FeeChargesVoidController],
  providers: [FeeChargesService],
  exports: [FeeChargesService],
})
export class FeeChargesModule {}
