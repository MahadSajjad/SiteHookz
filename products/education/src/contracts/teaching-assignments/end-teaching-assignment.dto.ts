import { IsDateString } from "class-validator";

export class EndTeachingAssignmentDto {
  @IsDateString()
  endDate!: string;
}
