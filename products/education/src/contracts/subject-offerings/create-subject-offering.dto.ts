import { IsUUID } from "class-validator";

export class CreateSchoolSubjectOfferingDto {
  @IsUUID()
  subjectId!: string;

  @IsUUID()
  sectionId!: string;
}

export class CreateTuitionSubjectOfferingDto {
  @IsUUID()
  subjectId!: string;

  @IsUUID()
  batchId!: string;
}
