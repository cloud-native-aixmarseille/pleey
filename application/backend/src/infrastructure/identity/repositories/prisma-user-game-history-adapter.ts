import { Injectable } from '@nestjs/common';
import { PaginationQueryNormalizer } from '../../../application/shared/services/pagination-query-normalizer';
import type { UserId } from '../../../domain/identity/entities/user';
import type { UserGameHistoryPage, UserGameHistoryPort } from '../../../domain/identity/ports/user-game-history.port';
import type { PaginationQuery } from '../../../domain/shared/value-objects/pagination-query';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaUserGameHistoryAdapter implements UserGameHistoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationQueryNormalizer: PaginationQueryNormalizer,
  ) {}

  async list(userId: UserId, query: PaginationQuery): Promise<UserGameHistoryPage> {
    const pagination = this.paginationQueryNormalizer.normalizeQuery(query);
    const where = {
      deletedAt: null,
      game: {
        deletedAt: null,
        project: { deletedAt: null, organization: { deletedAt: null } },
      },
      OR: [{ hostId: userId }, { scores: { some: { userId, deletedAt: null } } }],
    };
    const [totalCount, parties] = await this.prisma.$transaction(
      [
        this.prisma.party.count({ where }),
        this.prisma.party.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip: pagination.skip,
          take: pagination.pageSize,
          select: {
            id: true,
            hostId: true,
            status: true,
            createdAt: true,
            game: { select: { title: true, type: true } },
            scores: {
              where: { userId, deletedAt: null },
              select: { points: true },
              orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
              take: 1,
            },
          },
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    return this.paginationQueryNormalizer.toPaginatedResult(
      pagination,
      parties.map((party) => ({
        partyId: party.id,
        title: party.game.title,
        gameType: party.game.type,
        status: party.status,
        createdAt: party.createdAt,
        role: party.hostId === userId ? ('host' as const) : ('player' as const),
        points: party.scores[0]?.points ?? null,
      })),
      totalCount,
    );
  }
}
