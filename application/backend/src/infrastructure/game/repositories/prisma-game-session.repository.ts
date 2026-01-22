import { Injectable } from '@nestjs/common';
import { Prisma, type GameSession as PrismaGameSession } from '@prisma/client';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import {
  GameSession,
  type GameSessionId,
  type GameSessionPin,
} from '../../../domain/game/entities/game-session';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import { PinAlreadyInUseError } from '../../../domain/game/errors/pin-already-in-use.error';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import type { QuestionId } from '../../../domain/quiz/entities/question';
import type { QuizId } from '../../../domain/quiz/entities/quiz';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaGameSessionRepository implements GameSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(quizId: QuizId, hostId: UserId, pin: GameSessionPin): Promise<GameSession> {
    try {
      const session = await this.prisma.gameSession.create({
        data: {
          quizId,
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
        quiz: {
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
        quiz: {
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
        quiz: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session: PrismaGameSession) => this.toDomain(session));
  }

  async findActiveByQuizId(quizId: QuizId): Promise<GameSession | null> {
    const session = await this.prisma.gameSession.findFirst({
      where: {
        quizId,
        deletedAt: null,
        status: {
          in: [GameSessionStatus.WAITING, GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED],
        },
        quiz: {
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

  async findByQuizId(quizId: QuizId): Promise<GameSession[]> {
    const sessions = await this.prisma.gameSession.findMany({
      where: {
        quizId,
        deletedAt: null,
        quiz: {
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

  async updateCurrentQuestion(
    id: GameSessionId,
    questionId: QuestionId | null,
  ): Promise<GameSession> {
    const session = await this.prisma.gameSession.update({
      where: { id },
      data: { currentQuestion: questionId ?? undefined },
    });

    return this.toDomain(session);
  }

  async countActiveByQuizId(quizId: QuizId): Promise<number> {
    return this.prisma.gameSession.count({
      where: {
        quizId,
        deletedAt: null,
        status: {
          in: [GameSessionStatus.WAITING, GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED],
        },
        quiz: {
          deletedAt: null,
        },
      },
    });
  }

  async deleteOldSessions(olderThanDays: number): Promise<void> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    await this.prisma.gameSession.updateMany({
      where: {
        createdAt: {
          lt: cutoff,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private toDomain(session: PrismaGameSession): GameSession {
    return new GameSession(
      session.id,
      session.quizId,
      session.hostId,
      session.pin,
      session.status as GameSessionStatus,
      session.currentQuestion,
      session.createdAt,
    );
  }
}
