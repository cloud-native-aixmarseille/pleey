import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { createTransport, type Transporter } from 'nodemailer';
import type { PasswordResetMailer } from '../../../domain/identity/ports/password-reset-mailer';
import { PASSWORD_RECOVERY_CONFIG, type PasswordRecoveryConfig } from './password-recovery-config.token';

@Injectable()
export class SmtpPasswordResetMailer implements PasswordResetMailer {
  private readonly transporter: Transporter;

  constructor(
    @Inject(PASSWORD_RECOVERY_CONFIG) private readonly config: PasswordRecoveryConfig,
    private readonly i18n: I18nService,
  ) {
    this.transporter = createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      requireTLS: config.smtpRequireTls,
      auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPassword } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }

  async send(email: string, token: string, locale: string): Promise<void> {
    const url = new URL('/identity/reset-password', this.config.frontendUrl);
    url.hash = new URLSearchParams({ token }).toString();
    const lang = locale === 'fr' ? 'fr' : 'en';
    await this.transporter.sendMail({
      from: this.config.from,
      to: email,
      subject: this.i18n.translate('auth.recovery.subject', { lang }),
      text: this.i18n.translate('auth.recovery.message', {
        lang,
        args: {
          lifetimeMinutes: this.config.resetTokenLifetimeMinutes,
          url: url.toString(),
        },
      }),
    });
  }
}
