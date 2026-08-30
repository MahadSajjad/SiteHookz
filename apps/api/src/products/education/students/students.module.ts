import { Module } from "@nestjs/common";

import { DatabaseModule } from "../../../infrastructure/database/database.module";

import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";

@Module({
  imports: [DatabaseModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
