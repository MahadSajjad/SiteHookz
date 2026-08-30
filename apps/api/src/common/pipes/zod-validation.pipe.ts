import { PipeTransform, Injectable, ArgumentMetadata } from "@nestjs/common";
import { ZodSchema } from "zod";

import { BusinessException } from "../exceptions/business.exception";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== "body") {
      return value;
    }
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BusinessException(
        "VALIDATION_ERROR",
        400,
        "Validation failed",
        { errors: result.error.format() },
      );
    }
    return result.data;
  }
}
