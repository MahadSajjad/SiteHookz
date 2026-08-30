import { Global, Module } from "@nestjs/common";

import { ConsoleMailAdapter } from "./adapters/console-mail.adapter";
import { MailService } from "./mail.service";

@Global()
@Module({
  providers: [ConsoleMailAdapter, MailService],
  exports: [MailService],
})
export class MailModule {}
