export interface SendEmailJob {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}
