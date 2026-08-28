import { IsString, IsOptional, MaxLength, MinLength } from "class-validator";

export class CreateSubjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
