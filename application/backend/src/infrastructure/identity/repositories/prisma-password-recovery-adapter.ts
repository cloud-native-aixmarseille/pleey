import { Injectable } from '@nestjs/common';
import type { PasswordRecoveryPort, PasswordResetRequest } from '../../../domain/identity/ports/password-recovery.port';
import { PrismaService } from '../../database/prisma-service';

const REQUEST_LIFETIME_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class PrismaPasswordRecoveryAdapter implements PasswordRecoveryPort {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(email: string, locale: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE user_authentications a
      SET reset_request_locale = ${locale}, reset_requested_at = NOW(), reset_available_at = NOW(), updated_at = NOW()
      WHERE a.email = ${email}
        AND EXISTS (SELECT 1 FROM users u WHERE u.id = a.user_id AND u.deleted_at IS NULL)
        AND (a.reset_requested_at IS NULL OR a.reset_requested_at <= NOW() - INTERVAL '60 seconds')
        AND (a.reset_available_at IS NULL OR a.reset_available_at <= NOW())
    `;
  }

  async claim(): Promise<PasswordResetRequest | null> {
    const requests = await this.prisma.$queryRaw<PasswordResetRequest[]>`
      UPDATE user_authentications SET reset_available_at = NOW() + INTERVAL '60 seconds', updated_at = NOW()
      WHERE user_id = (
        SELECT a.user_id FROM user_authentications a
        WHERE a.reset_available_at <= NOW()
          AND a.reset_requested_at > NOW() - INTERVAL '24 hours'
          AND EXISTS (SELECT 1 FROM users u WHERE u.id = a.user_id AND u.deleted_at IS NULL)
        ORDER BY a.reset_requested_at LIMIT 1 FOR UPDATE OF a SKIP LOCKED
      )
      RETURNING email, reset_request_locale AS locale, reset_requested_at AS "requestedAt"
    `;
    return requests[0] ?? null;
  }

  async complete(request: PasswordResetRequest): Promise<void> {
    await this.prisma.userAuthentication.updateMany({
      where: { email: request.email, resetRequestedAt: request.requestedAt },
      data: { resetAvailableAt: null },
    });
  }

  async issueToken(email: string, tokenHash: string, expiresAt: Date): Promise<boolean> {
    const result = await this.prisma.userAuthentication.updateMany({
      where: { email, user: { deletedAt: null } },
      data: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt },
    });
    return result.count === 1;
  }

  async consumeToken(tokenHash: string, passwordHash: string): Promise<boolean> {
    return this.prisma.$transaction(async (transaction) => {
      const accounts = await transaction.userAuthentication.updateManyAndReturn({
        where: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: { gt: new Date() },
          user: { deletedAt: null },
        },
        data: {
          password: passwordHash,
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
        },
        select: { userId: true },
      });
      const account = accounts[0];
      if (!account) return false;
      await transaction.userSession.deleteMany({ where: { userId: account.userId } });
      return true;
    });
  }

  async deleteExpiredRequests(): Promise<void> {
    await this.prisma.userAuthentication.updateMany({
      where: { resetRequestedAt: { lt: new Date(Date.now() - REQUEST_LIFETIME_MS) } },
      data: { resetRequestedAt: null, resetAvailableAt: null, resetRequestLocale: null },
    });
  }
}
