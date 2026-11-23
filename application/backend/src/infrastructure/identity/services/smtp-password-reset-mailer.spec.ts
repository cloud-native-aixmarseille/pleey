import { describe, expect, it, vi } from 'vitest';
import { SmtpPasswordResetMailer } from './smtp-password-reset-mailer';

const mocks = vi.hoisted(() => ({ createTransport: vi.fn() }));
vi.mock('nodemailer', () => ({ createTransport: mocks.createTransport }));

describe('SmtpPasswordResetMailer', () => {
  it.each(['en', 'fr'])(
    'sends a localized %s link using the configured frontend origin and SMTP transport',
    async (locale) => {
      // Arrange
      const sendMail = vi.fn().mockResolvedValue(undefined);
      mocks.createTransport.mockReturnValue({ sendMail });
      const i18n = {
        translate: vi
          .fn()
          .mockImplementation((key, options) =>
            key === 'auth.recovery.subject' ? 'localized subject' : options.args.url,
          ),
      };
      const mailer = new SmtpPasswordResetMailer(
        {
          frontendUrl: 'https://play.example.com',
          smtpHost: 'smtp.example.com',
          smtpPort: 587,
          smtpSecure: false,
          smtpRequireTls: true,
          resetTokenLifetimeMinutes: 45,
          from: 'Pleey <noreply@example.com>',
        },
        i18n as never,
      );
      const token = 'a'.repeat(64);
      // Act
      await mailer.send('alice@example.com', token, locale);
      // Assert
      expect(sendMail).toHaveBeenCalledWith({
        from: 'Pleey <noreply@example.com>',
        to: 'alice@example.com',
        subject: 'localized subject',
        text: `https://play.example.com/identity/reset-password#token=${token}`,
      });
      expect(i18n.translate).toHaveBeenCalledWith('auth.recovery.subject', { lang: locale });
      expect(i18n.translate).toHaveBeenCalledWith('auth.recovery.message', {
        lang: locale,
        args: {
          lifetimeMinutes: 45,
          url: `https://play.example.com/identity/reset-password#token=${token}`,
        },
      });
      expect(mocks.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ requireTLS: true, disableFileAccess: true, disableUrlAccess: true }),
      );
    },
  );
});
