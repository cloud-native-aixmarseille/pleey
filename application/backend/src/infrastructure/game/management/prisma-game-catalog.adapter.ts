import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  GameCatalogPort,
  ListProjectGamesQuery,
  ProjectGameCatalogPage,
} from '../../../application/game/management/ports/game-catalog.port';
import { GameIdentifier } from '../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeIdentifier } from '../../../application/game/types/shared/services/game-type-identifier';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaGameCatalogAdapter implements GameCatalogPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gameIdentifier: GameIdentifier,
    private readonly gameTypeIdentifier: GameTypeIdentifier,
  ) {}

  async listProjectGames(query: ListProjectGamesQuery): Promise<ProjectGameCatalogPage> {
    const search = query.search?.trim() ?? '';
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 9);
    const baseWhere: Prisma.GameWhereInput = {
      projectId: query.projectId,
      deletedAt: null,
      project: {
        deletedAt: null,
        organization: {
          deletedAt: null,
        },
      },
    };
    const filteredWhere: Prisma.GameWhereInput = {
      ...baseWhere,
      ...(query.types && query.types.length > 0
        ? {
            type: {
              in: [...query.types],
            },
          }
        : {}),
      ...(search.length > 0
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                description: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.GameOrderByWithRelationInput[] =
      query.sortField === 'title'
        ? [{ title: query.sortDirection ?? 'asc' }, { createdAt: Prisma.SortOrder.desc }]
        : [{ createdAt: query.sortDirection ?? 'desc' }, { title: Prisma.SortOrder.asc }];
    const skip = (page - 1) * pageSize;

    const [overallCount, totalCount, games] = await this.prisma.$transaction([
      this.prisma.game.count({ where: baseWhere }),
      this.prisma.game.count({ where: filteredWhere }),
      this.prisma.game.findMany({
        where: filteredWhere,
        include: {
          prediction: {
            select: {
              id: true,
            },
          },
          quiz: {
            select: {
              id: true,
            },
          },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
    ]);

    const predictionIds = games
      .map((game) => game.prediction?.id ?? null)
      .filter((id): id is number => id !== null);
    const promptCounts = predictionIds.length
      ? await this.prisma.predictionPrompt.groupBy({
          by: ['predictionId'],
          where: {
            deletedAt: null,
            predictionId: { in: predictionIds },
          },
          _count: { _all: true },
        })
      : [];
    const promptCountByPredictionId = new Map<number, number>(
      promptCounts.map((entry) => [entry.predictionId, entry._count._all]),
    );

    const quizIds = games
      .map((game) => game.quiz?.id ?? null)
      .filter((id): id is number => id !== null);
    const questionCounts = quizIds.length
      ? await this.prisma.question.groupBy({
          by: ['quizId'],
          where: {
            deletedAt: null,
            quizId: { in: quizIds },
          },
          _count: { _all: true },
        })
      : [];
    const questionCountByQuizId = new Map<number, number>(
      questionCounts.map((entry) => [entry.quizId, entry._count._all]),
    );

    return {
      items: games.map((game) => {
        const gameTypeId = game.quiz?.id ?? game.prediction?.id ?? null;

        return {
          gameId: this.gameIdentifier.parse(game.id),
          type: game.type,
          title: game.title,
          description: game.description,
          createdAt: game.createdAt,
          gameTypeId: gameTypeId === null ? null : this.gameTypeIdentifier.parse(gameTypeId),
          stageCount: game.quiz
            ? (questionCountByQuizId.get(game.quiz.id) ?? 0)
            : game.prediction
              ? (promptCountByPredictionId.get(game.prediction.id) ?? 0)
              : 0,
        };
      }),
      totalCount,
      overallCount,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
  }
}
