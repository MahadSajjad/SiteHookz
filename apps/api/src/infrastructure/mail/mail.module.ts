import { Global, Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { ConsoleMailAdapter } from "./adapters/console-mail.adapter";

@Global()
@Module({
  providers: [ConsoleMailAdapter, MailService],
  exports: [MailService],
})
export class MailModule {}
