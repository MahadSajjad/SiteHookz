import { Module } from "@nestjs/common";
import { SubjectOfferingsController } from "./subject-offerings.controller";
import { SubjectOfferingsService } from "./subject-offerings.service";
import { SubjectOfferingsRepository } from "./subject-offerings.repository";

@Module({
  controllers: [SubjectOfferingsController],
  providers: [SubjectOfferingsService, SubjectOfferingsRepository],
  exports: [SubjectOfferingsService],
})
export class SubjectOfferingsModule {}
