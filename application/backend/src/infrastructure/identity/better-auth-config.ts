import { randomUUID } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { anonymous } from 'better-auth/plugins';
import { I18nService } from 'nestjs-i18n';
import type { PrismaService } from '../database/prisma-service';
import { IdentityTransferService } from './identity-transfer.service';

export interface BetterAuthRuntimeConfig {
  publicOrigin: string;
  secureCookies: boolean;
  smtpFrom: string;
  smtpUrl: string | null;
  secret: string;
}

export function createBetterAuth(
  prisma: PrismaService,
  config: BetterAuthRuntimeConfig,
  identityTransfers: IdentityTransferService,
  i18n: I18nService,
) {
  return betterAuth({
    baseURL: `${config.publicOrigin}/api/auth`,
    basePath: '/api/auth',
    trustedOrigins: [config.publicOrigin],
    secret: config.secret,
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
      transaction: true,
    }),
    user: {
      additionalFields: {
        username: {
          defaultValue: () => `player-${randomUUID()}`,
          input: false,
          required: true,
          type: 'string',
          unique: true,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({
            data: {
              ...user,
              username: user.isAnonymous ? `player-${randomUUID()}` : String(user.name).trim(),
            },
          }),
        },
      },
    },
    advanced: {
      useSecureCookies: config.secureCookies,
      database: {
        generateId: false,
      },
      defaultCookieAttributes: {
        httpOnly: true,
        secure: config.secureCookies,
        sameSite: 'lax',
        path: '/',
      },
    },
    session: {
      expiresIn: 7 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
      cookieCache: {
        enabled: false,
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }, request) => {
        if (!config.smtpUrl) return;
        const locale = request?.headers.get('accept-language')?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
        const subject = await i18n.translate('auth.recovery.subject', { lang: locale });
        const body = await i18n.translate('auth.recovery.message', { args: { url }, lang: locale });
        await deliverPasswordReset(config.smtpUrl, config.smtpFrom, user.email, String(subject), String(body));
      },
    },
    plugins: [
      anonymous({
        disableDeleteAnonymousUser: true,
        onLinkAccount: async ({ anonymousUser, newUser }) => {
          await identityTransfers.transfer({
            sourceSessionId: anonymousUser.session.id,
            sourceUserId: anonymousUser.user.id,
            targetSessionId: newUser.session.id,
            targetUserId: newUser.user.id,
          });
        },
      }),
    ],
  });
}

async function deliverPasswordReset(
  smtpUrl: string,
  from: string,
  recipient: string,
  subject: string,
  body: string,
): Promise<void> {
  const nodemailer = await import('nodemailer');
  const transport = nodemailer.createTransport(smtpUrl);
  await transport.sendMail({
    from,
    to: recipient,
    subject,
    text: body,
  });
}
