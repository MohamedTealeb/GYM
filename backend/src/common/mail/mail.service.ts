import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendOtpEmail(params: { to: string; otp: string }) {
    const host = process.env.SMTP_HOST ?? process.env.MAIL_HOST;
    const port = Number(process.env.SMTP_PORT ?? process.env.MAIL_PORT ?? 587);
    const user = process.env.SMTP_USER ?? process.env.MAIL_USER;
    const pass = process.env.SMTP_PASS ?? process.env.MAIL_PASS;
    const from =
      process.env.MAIL_FROM ??
      process.env.SMTP_USER ??
      process.env.MAIL_USER ??
      'no-reply@gym.local';

    if (!host || !user || !pass) {
      this.logger.warn(
        JSON.stringify({
          event: 'mail_not_configured',
          to: params.to,
          otp: params.otp,
        }),
      );
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from,
        to: params.to,
        subject: 'Verify your account',
        text: `Your verification code is: ${params.otp}\nThis code expires in 5 minutes.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        JSON.stringify({
          event: 'mail_send_failed',
          to: params.to,
          errorMessage: message,
        }),
      );

      // Don't break user registration if mail fails
      return;
    }
  }
}

