import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { UserId } from '../../../domain/identity/entities/user';
import { UserAuthentication } from '../../../domain/identity/entities/user-authentication';
import type { UserAuthenticationRepository } from '../../../domain/identity/ports/user-authentication.repository';
import type { SessionClientMetadata } from '../../../domain/identity/types/user-session';
import { PrismaService } from '../../database/prisma-service';
import { toDomainUser, USER_PROFILE_INCLUDE } from './prisma-user-profile-mapper';

const AUTHENTICATION_INCLUDE = { user: { include: USER_PROFILE_INCLUDE } } satisfies Prisma.UserAuthenticationInclude;

function toDomainAuthentication(
  record: Prisma.UserAuthenticationGetPayload<{ include: typeof AUTHENTICATION_INCLUDE }>,
) {
  return new UserAuthentication(toDomainUser(record.user), record.password);
}

@Injectable()
export class PrismaUserAuthenticationRepository implements UserAuthenticationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserAuthentication | null> {
    const record = await this.prisma.userAuthentication.findUnique({
      where: { email, user: { deletedAt: null } },
      include: AUTHENTICATION_INCLUDE,
    });
    return record ? toDomainAuthentication(record) : null;
  }

  async findByRefreshToken(userId: UserId, refreshTokenHash: string): Promise<UserAuthentication | null> {
    const session = await this.prisma.userSession.findUnique({
      where: { refreshTokenHash, userId, authentication: { user: { deletedAt: null } } },
      include: { authentication: { include: AUTHENTICATION_INCLUDE } },
    });
    return session
      ? new UserAuthentication(
          toDomainUser(session.authentication.user),
          session.authentication.password,
          session.refreshTokenHash,
          session.refreshTokenExpiresAt,
          session.id,
        )
      : null;
  }

  async saveSession(
    userId: UserId,
    session: {
      sessionId: string;
      refreshTokenHash: string;
      refreshTokenExpiresAt: Date;
      client?: SessionClientMetadata;
    },
    expected: { password?: string; refreshTokenHash?: string },
  ): Promise<boolean> {
    const now = new Date();
    if (expected.refreshTokenHash) {
      const result = await this.prisma.userSession.updateMany({
        where: {
          id: session.sessionId,
          userId,
          refreshTokenHash: expected.refreshTokenHash,
          refreshTokenExpiresAt: { gt: now },
          authentication: { user: { deletedAt: null } },
        },
        data: {
          refreshTokenHash: session.refreshTokenHash,
          refreshTokenExpiresAt: session.refreshTokenExpiresAt,
          lastActiveAt: now,
        },
      });
      return result.count === 1;
    }
    if (!expected.password) return false;

    return this.prisma.$transaction(async (transaction) => {
      // Lock the credential row, serializing new sessions with password reset.
      const account = await transaction.userAuthentication.updateMany({
        where: { userId, password: expected.password, user: { deletedAt: null } },
        data: { updatedAt: now },
      });
      if (account.count !== 1) return false;
      await transaction.userSession.deleteMany({ where: { userId, refreshTokenExpiresAt: { lte: now } } });
      await transaction.userSession.create({
        data: {
          id: session.sessionId,
          userId,
          refreshTokenHash: session.refreshTokenHash,
          refreshTokenExpiresAt: session.refreshTokenExpiresAt,
          createdAt: now,
          lastActiveAt: now,
          userAgent: session.client?.userAgent?.slice(0, 512) ?? null,
          ipAddress: session.client?.ipAddress?.slice(0, 64) ?? null,
        },
      });
      return true;
    });
  }

  async clearSession(userId: UserId, sessionId: string): Promise<void> {
    await this.prisma.userSession.deleteMany({ where: { userId, id: sessionId } });
  }

  async isSessionActive(userId: UserId, sessionId: string, recordActivity = true): Promise<boolean> {
    const now = new Date();
    const where = {
      userId,
      id: sessionId,
      authentication: { user: { deletedAt: null } },
      refreshTokenExpiresAt: { gt: now },
    };
    const session = await this.prisma.userSession.findFirst({ where, select: { lastActiveAt: true } });
    if (!session) return false;
    if (recordActivity && (!session.lastActiveAt || now.getTime() - session.lastActiveAt.getTime() >= 60_000)) {
      await this.prisma.userSession.updateMany({
        where: { ...where, OR: [{ lastActiveAt: null }, { lastActiveAt: { lte: new Date(now.getTime() - 60_000) } }] },
        data: { lastActiveAt: now },
      });
    }
    return true;
  }
}
