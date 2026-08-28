import { IsDateString, IsUUID } from "class-validator";

export class AssignTeacherDto {
  @IsUUID()
  subjectOfferingId!: string;

  @IsUUID()
  staffMemberId!: string;

  @IsDateString()
  startDate!: string;
}
