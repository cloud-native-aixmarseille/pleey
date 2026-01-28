import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Game, type GameId } from '../../../domain/game/entities/game';
import { GameType } from '../../../domain/game/enums/game-type.enum';
import type {
  GameRepository,
  SearchProjectGamesQuery,
  SearchProjectGamesResult,
} from '../../../domain/game/ports/repositories/game.repository';
import type { ProjectId } from '../../../domain/project/entities/project';
import { PrismaService } from '../../database/prisma-service';

type PrismaGame = {
  id: number;
  type: string;
  title: string;
  description: string | null;
  projectId: number;
  createdAt: Date;
};

type PrismaGameDelegate = {
  create: (args: unknown) => Promise<PrismaGame>;
  count: (args: unknown) => Promise<number>;
  findFirst: (args: unknown) => Promise<PrismaGame | null>;
  findMany: (args: unknown) => Promise<PrismaGame[]>;
  updateMany: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<PrismaGame>;
};

type SearchProjectDashboardPrismaGame = Prisma.GameGetPayload<{
  include: {
    prediction: {
      select: {
        id: true;
      };
    };
    quiz: {
      select: {
        id: true;
      };
    };
  };
}>;

/**
 * Prisma Game Repository Implementation
 * Implements GameRepository using Prisma ORM
 */
@Injectable()
export class PrismaGameRepository implements GameRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get gameClient(): PrismaGameDelegate {
    return (this.prisma as unknown as { game: PrismaGameDelegate }).game;
  }

  async create(
    type: GameType,
    title: string,
    description: string | null,
    projectId: ProjectId,
  ): Promise<Game> {
    const game = await this.gameClient.create({
      data: {
        type,
        title,
        description,
        project: {
          connect: { id: projectId },
        },
      },
    });

    return this.toDomain(game);
  }

  async findById(id: GameId): Promise<Game | null> {
    const game = await this.gameClient.findFirst({
      where: {
        id,
        deletedAt: null,
        project: {
          deletedAt: null,
          organization: {
            deletedAt: null,
          },
        },
      },
    });

    if (!game) return null;

    return this.toDomain(game);
  }

  async findByProject(projectId: ProjectId): Promise<Game[]> {
    const games = await this.gameClient.findMany({
      where: {
        projectId,
        deletedAt: null,
        project: {
          deletedAt: null,
          organization: {
            deletedAt: null,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return games.map((game) => this.toDomain(game));
  }

  async searchProjectGames(query: SearchProjectGamesQuery): Promise<SearchProjectGamesResult> {
    const search = query.search?.trim() ?? '';
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
        ? [{ title: query.sortDirection }, { createdAt: Prisma.SortOrder.desc }]
        : [{ createdAt: query.sortDirection }, { title: Prisma.SortOrder.asc }];
    const skip = (query.page - 1) * query.pageSize;

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
        take: query.pageSize,
      }),
    ]);

    const dashboardGames = games as SearchProjectDashboardPrismaGame[];

    const predictionIds = dashboardGames
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

    const quizIds = dashboardGames
      .map((game) => game.quiz?.id ?? null)
      .filter((quizId): quizId is number => quizId !== null);
    const questionCounts = quizIds.length
      ? await this.prisma.question.groupBy({
          by: ['quizId'],
          where: {
            deletedAt: null,
            quizId: {
              in: quizIds,
            },
          },
          _count: {
            _all: true,
          },
        })
      : [];
    const questionCountByQuizId = new Map<number, number>(
      questionCounts.map((entry) => [entry.quizId, entry._count._all]),
    );

    return {
      items: dashboardGames.map((game) => ({
        id: game.id,
        type: game.type as GameType,
        title: game.title,
        description: game.description,
        createdAt: game.createdAt,
        relatedGameId: game.quiz?.id ?? game.prediction?.id ?? null,
        stageCount: game.quiz
          ? (questionCountByQuizId.get(game.quiz.id) ?? 0)
          : game.prediction
            ? (promptCountByPredictionId.get(game.prediction.id) ?? 0)
            : 0,
      })),
      totalCount,
      overallCount,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async reassignProject(sourceProjectId: ProjectId, targetProjectId: ProjectId): Promise<void> {
    await this.gameClient.updateMany({
      where: {
        projectId: sourceProjectId,
        deletedAt: null,
      },
      data: {
        projectId: targetProjectId,
      },
    });
  }

  async delete(id: GameId): Promise<void> {
    await this.gameClient.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async update(id: GameId, title: string, description: string | null): Promise<Game> {
    const game = await this.gameClient.update({
      where: { id },
      data: { title, description },
    });

    return this.toDomain(game);
  }

  private toDomain(game: PrismaGame): Game {
    return new Game(
      game.id,
      game.type as GameType,
      game.title,
      game.description,
      game.projectId,
      game.createdAt,
    );
  }
}
