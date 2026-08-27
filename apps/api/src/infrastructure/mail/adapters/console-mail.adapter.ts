import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConsoleMailAdapter {
  private readonly logger = new Logger(ConsoleMailAdapter.name);

  async sendEmail(to: string, subject: string, body: string) {
    this.logger.log(`\n=== MOCK EMAIL ===\nTo: ${to}\nSubject: ${subject}\nBody: ${body}\n==================\n`);
    return true;
  }
}
