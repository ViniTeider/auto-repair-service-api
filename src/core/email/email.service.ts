import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import {
  BudgetEmailData,
  budgetEmailTemplate,
} from '../templates/budget-email.template';

export type SendBudgetEmailParams = Omit<BudgetEmailData, 'budgetUrl'> & {
  to: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    if (!host) {
      this.logger.warn(
        'SMTP_HOST is not set; emails are generated but not delivered.',
      );
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
      return;
    }
    const user = this.config.get<string>('SMTP_USER');
    this.transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.get<string>('SMTP_PORT') ?? 587),
      secure: this.config.get<string>('SMTP_SECURE') === 'true',
      auth: user
        ? { user, pass: this.config.get<string>('SMTP_PASSWORD') }
        : undefined,
    });
  }

  async sendBudgetEmail({ to, ...data }: SendBudgetEmailParams): Promise<void> {
    const baseUrl =
      this.config.get<string>('APP_PUBLIC_URL') ?? 'http://localhost:3000';
    const { subject, html, text } = budgetEmailTemplate({
      ...data,
      budgetUrl: `${baseUrl}/public/work-order/${encodeURIComponent(data.code)}/budget`,
    });
    await this.transporter.sendMail({
      from: this.config.get<string>('EMAIL_FROM') ?? 'no-reply@localhost',
      to,
      subject,
      html,
      text,
    });
  }
}
