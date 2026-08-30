import { Injectable, Logger } from "@nestjs/common";

import { redactSensitiveData } from "./log-redaction.util";

@Injectable()
export class LoggerService {
  private readonly logger = new Logger("App");

  log(message: string, context?: string, data?: any) {
    this.logger.log(this.format(message, data), context);
  }

  error(message: string, trace?: string, context?: string, data?: any) {
    this.logger.error(this.format(message, data), trace, context);
  }

  warn(message: string, context?: string, data?: any) {
    this.logger.warn(this.format(message, data), context);
  }

  private format(message: string, data?: any) {
    if (!data) return message;
    return `${message} ${JSON.stringify(redactSensitiveData(data))}`;
  }
}
