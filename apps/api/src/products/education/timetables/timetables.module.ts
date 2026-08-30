import { Module } from "@nestjs/common";

import { TimetablesController } from "./timetables.controller";
import { TimetableEntriesController } from "./timetable-entries.controller";
import { TimetablesService } from "./timetables.service";
import { TimetableEntriesService } from "./timetable-entries.service";
import { TimetablesRepository } from "./timetables.repository";
import { TimetableEntriesRepository } from "./timetable-entries.repository";

@Module({
  imports: [],
  controllers: [TimetablesController, TimetableEntriesController],
  providers: [
    TimetablesService,
    TimetableEntriesService,
    TimetablesRepository,
    TimetableEntriesRepository,
  ],
  exports: [
    TimetablesService,
    TimetableEntriesService,
    TimetablesRepository,
    TimetableEntriesRepository,
  ],
})
export class TimetablesModule {}
