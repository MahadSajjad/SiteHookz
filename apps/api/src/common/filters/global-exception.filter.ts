import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";

import { BusinessException } from "../exceptions/business.exception";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers["x-request-id"] || "unknown";

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "An unexpected error occurred";
    let details = undefined;

    if (exception instanceof BusinessException) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      code = "HTTP_ERROR";
    } else {
      this.logger.error(`[${requestId}] Unhandled exception: ${exception}`);
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
        requestId,
      },
    });
  }
}
