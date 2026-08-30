import { Module } from "@nestjs/common";

import { SubjectOfferingsController } from "./subject-offerings.controller";
import { SubjectOfferingsRepository } from "./subject-offerings.repository";
import { SubjectOfferingsService } from "./subject-offerings.service";

@Module({
  controllers: [SubjectOfferingsController],
  providers: [SubjectOfferingsService, SubjectOfferingsRepository],
  exports: [SubjectOfferingsService],
})
export class SubjectOfferingsModule {}
