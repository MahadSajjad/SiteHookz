import { createZodDto } from "@anatine/zod-nestjs";
import {
  CreateAttendanceSessionSchema,
  BulkMarkAttendanceSchema,
} from "@sitehookz/education";

export class CreateAttendanceSessionDto extends createZodDto(
  CreateAttendanceSessionSchema,
) {}
export class BulkMarkAttendanceDto extends createZodDto(
  BulkMarkAttendanceSchema,
) {}
