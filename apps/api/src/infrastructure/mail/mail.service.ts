import { Injectable } from '@nestjs/common';
import { ConsoleMailAdapter } from './adapters/console-mail.adapter';

@Injectable()
export class MailService {
  constructor(private adapter: ConsoleMailAdapter) {}

  async sendVerificationEmail(email: string, token: string) {
    await this.adapter.sendEmail(
      email,
      'Verify Your Email',
      `Your verification token is: ${token}`
    );
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await this.adapter.sendEmail(
      email,
      'Reset Your Password',
      `Your reset token is: ${token}`
    );
  }

  async sendInvitationEmail(email: string, token: string, orgName: string) {
    await this.adapter.sendEmail(
      email,
      `Invitation to join ${orgName}`,
      `You have been invited. Use token: ${token}`
    );
  }
}
