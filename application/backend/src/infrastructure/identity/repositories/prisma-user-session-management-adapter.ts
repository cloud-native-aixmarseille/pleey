import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';
import type { UserId } from '../../../domain/identity/entities/user';
import type { UserSessionManagementPort } from '../../../domain/identity/ports/user-session-management.port';
import type { UserSessionDetails } from '../../../domain/identity/types/user-session';
import type { PaginationQuery } from '../../../domain/shared/value-objects/pagination-query';
import { PrismaService } from '../../database/prisma-service';

const SESSION_SELECT = {
  id: true,
  createdAt: true,
  lastActiveAt: true,
  refreshTokenExpiresAt: true,
  userAgent: true,
  ipAddress: true,
} satisfies Prisma.UserSessionSelect;

function toDetails(session: Prisma.UserSessionGetPayload<{ select: typeof SESSION_SELECT }>): UserSessionDetails {
  const { refreshTokenExpiresAt, ...details } = session;
  return { ...details, expiresAt: refreshTokenExpiresAt };
}

@Injectable()
export class PrismaUserSessionManagementAdapter implements UserSessionManagementPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationQueryNormalizer,
  ) {}

  async current(userId: UserId, sessionId: string): Promise<UserSessionDetails | null> {
    const session = await this.prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
        refreshTokenExpiresAt: { gt: new Date() },
        authentication: { user: { deletedAt: null } },
      },
      select: SESSION_SELECT,
    });
    return session ? toDetails(session) : null;
  }

  async listOthers(userId: UserId, currentSessionId: string, query: PaginationQuery) {
    const pagination = this.pagination.normalizeQuery(query);
    const where = {
      userId,
      id: { not: currentSessionId },
      refreshTokenExpiresAt: { gt: new Date() },
      authentication: { user: { deletedAt: null } },
    };
    const [count, sessions] = await this.prisma.$transaction(
      [
        this.prisma.userSession.count({ where }),
        this.prisma.userSession.findMany({
          where,
          select: SESSION_SELECT,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip: pagination.skip,
          take: pagination.pageSize,
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    return this.pagination.toPaginatedResult(pagination, sessions.map(toDetails), count);
  }

  async revokeOthers(userId: UserId, currentSessionId: string): Promise<void> {
    await this.prisma.userSession.deleteMany({ where: { userId, id: { not: currentSessionId } } });
  }
}
