import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { anonymous } from 'better-auth/plugins';
import type { PrismaService } from '../database/prisma-service';

export interface BetterAuthRuntimeConfig {
  publicOrigin: string;
  secureCookies: boolean;
  smtpFrom: string;
  smtpUrl: string | null;
  secret: string;
}

export function createBetterAuth(prisma: PrismaService, config: BetterAuthRuntimeConfig) {
  return betterAuth({
    baseURL: `${config.publicOrigin}/api/auth`,
    basePath: '/api/auth',
    trustedOrigins: [config.publicOrigin],
    secret: config.secret,
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
      transaction: true,
    }),
    advanced: {
      useSecureCookies: config.secureCookies,
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
      sendResetPassword: async ({ user, url }) => {
        if (!config.smtpUrl) return;
        await deliverPasswordReset(config.smtpUrl, config.smtpFrom, user.email, url);
      },
    },
    plugins: [
      anonymous({
        disableDeleteAnonymousUser: true,
      }),
    ],
  });
}

async function deliverPasswordReset(smtpUrl: string, from: string, recipient: string, resetUrl: string): Promise<void> {
  const nodemailer = await import('nodemailer');
  const transport = nodemailer.createTransport(smtpUrl);
  await transport.sendMail({
    from,
    to: recipient,
    subject: 'Reset your Pleey password',
    text: `Reset your Pleey password: ${resetUrl}`,
  });
}
