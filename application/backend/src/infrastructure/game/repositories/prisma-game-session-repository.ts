import { Injectable } from '@nestjs/common';
import { Prisma, type GameSession as PrismaGameSession } from '@prisma/client';
import type { UserId } from '../../../domain/auth/entities/user';
import type { GameId } from '../../../domain/game/entities/game';
import {
  GameSession,
  type GameSessionContext,
  type GameSessionId,
  type GameSessionPin,
} from '../../../domain/game/entities/game-session';
import type { GameStageId } from '../../../domain/game/entities/game-stage';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import { PinAlreadyInUseError } from '../../../domain/game/errors/pin-already-in-use-error';
import type { GameSessionRepository } from '../../../domain/game/ports/repositories/game-session.repository';
import { PrismaService } from '../../database/prisma-service';

@Injectable()
export class PrismaGameSessionRepository implements GameSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(gameId: GameId, hostId: UserId, pin: GameSessionPin): Promise<GameSession> {
    try {
      const game = await this.prisma.game.findFirst({
        where: {
          id: gameId,
          deletedAt: null,
        },
      });

      if (!game) {
        throw new Error(GameErrorCode.GAME_NOT_FOUND);
      }

      const session = await this.prisma.gameSession.create({
        data: {
          gameId,
          hostId,
          pin,
        },
      });

      return this.toDomain(session);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target;
          const targets = Array.isArray(target) ? target : [target].filter(Boolean);
          if (targets.some((value) => String(value).includes('pin'))) {
            throw new PinAlreadyInUseError();
          }
        }
      }

      throw error;
    }
  }

  async findByPin(pin: GameSessionPin): Promise<GameSession | null> {
    const session = await this.prisma.gameSession.findFirst({
      where: {
        pin,
        deletedAt: null,
        game: {
          deletedAt: null,
        },
      },
    });

    if (!session) return null;

    return this.toDomain(session);
  }

  async findById(id: GameSessionId): Promise<GameSession | null> {
    const session = await this.prisma.gameSession.findFirst({
      where: {
        id,
        deletedAt: null,
        game: {
          deletedAt: null,
        },
      },
    });

    if (!session) return null;

    return this.toDomain(session);
  }

  async findActiveByHostId(hostId: UserId): Promise<GameSession[]> {
    const sessions = await this.prisma.gameSession.findMany({
      where: {
        hostId,
        deletedAt: null,
        status: {
          in: [GameSessionStatus.WAITING, GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED],
        },
        game: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session: PrismaGameSession) => this.toDomain(session));
  }

  async findActiveByGameId(gameId: GameId): Promise<GameSession | null> {
    const session = await this.prisma.gameSession.findFirst({
      where: {
        gameId,
        deletedAt: null,
        status: {
          in: [GameSessionStatus.WAITING, GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED],
        },
        game: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!session) {
      return null;
    }

    return this.toDomain(session);
  }

  async findByGameId(gameId: GameId): Promise<GameSession[]> {
    const sessions = await this.prisma.gameSession.findMany({
      where: {
        gameId,
        deletedAt: null,
        game: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session: PrismaGameSession) => this.toDomain(session));
  }

  async updateStatus(id: GameSessionId, status: GameSessionStatus): Promise<GameSession> {
    const session = await this.prisma.gameSession.update({
      where: { id },
      data: { status },
    });

    return this.toDomain(session);
  }

  async updateCurrentStage(id: GameSessionId, stageId: GameStageId | null): Promise<GameSession> {
    const context = this.buildContextWithStageId(stageId);
    const session = await this.prisma.gameSession.update({
      where: { id },
      data: { context },
    });

    return this.toDomain(session);
  }

  async countActiveByGameId(gameId: GameId): Promise<number> {
    return this.prisma.gameSession.count({
      where: {
        gameId,
        deletedAt: null,
        status: {
          in: [GameSessionStatus.WAITING, GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED],
        },
        game: {
          deletedAt: null,
        },
      },
    });
  }

  private toDomain(session: PrismaGameSession): GameSession {
    return new GameSession(
      session.id,
      session.gameId,
      session.hostId,
      session.pin,
      session.status as GameSessionStatus,
      (session.context as GameSessionContext | null) ?? null,
      session.createdAt,
    );
  }

  private buildContextWithStageId(
    stageId: GameStageId | null,
  ): Prisma.InputJsonValue | typeof Prisma.DbNull {
    if (stageId === null) {
      return Prisma.DbNull;
    }

    return { currentStageId: stageId } satisfies Prisma.InputJsonValue;
  }
}
