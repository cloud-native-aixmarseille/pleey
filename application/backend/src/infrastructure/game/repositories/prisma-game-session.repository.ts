import { Injectable } from '@nestjs/common';
import { Prisma, type GameSession as PrismaGameSession } from '@prisma/client';
import { GameSession } from '../../../domain/game/entities/game-session';
import { PinAlreadyInUseError } from '../../../domain/game/errors/pin-already-in-use.error';
import type { GameSessionRepository } from '../../../domain/game/repositories/game-session.repository.interface';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaGameSessionRepository implements GameSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    quizId: number,
    hostId: number,
    organizationId: number,
    pin: string,
  ): Promise<GameSession> {
    try {
      const session = await this.prisma.gameSession.create({
        data: {
          quizId,
          hostId,
          organizationId,
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

  async findByPin(pin: string): Promise<GameSession | null> {
    const session = await this.prisma.gameSession.findFirst({
      where: {
        pin,
        deletedAt: null,
        quiz: {
          deletedAt: null,
        },
        organization: {
          deletedAt: null,
        },
      },
    });

    if (!session) return null;

    return this.toDomain(session);
  }

  async findById(id: number): Promise<GameSession | null> {
    const session = await this.prisma.gameSession.findFirst({
      where: {
        id,
        deletedAt: null,
        quiz: {
          deletedAt: null,
        },
        organization: {
          deletedAt: null,
        },
      },
    });

    if (!session) return null;

    return this.toDomain(session);
  }

  async findActiveByHostId(hostId: number): Promise<GameSession[]> {
    const sessions = await this.prisma.gameSession.findMany({
      where: {
        hostId,
        deletedAt: null,
        status: {
          in: ['waiting', 'active', 'paused'],
        },
        quiz: {
          deletedAt: null,
        },
        organization: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session: PrismaGameSession) => this.toDomain(session));
  }

  async findActiveByQuizId(quizId: number): Promise<GameSession | null> {
    const session = await this.prisma.gameSession.findFirst({
      where: {
        quizId,
        deletedAt: null,
        status: {
          in: ['waiting', 'active', 'paused'],
        },
        quiz: {
          deletedAt: null,
        },
        organization: {
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

  async findByQuizId(quizId: number): Promise<GameSession[]> {
    const sessions = await this.prisma.gameSession.findMany({
      where: {
        quizId,
        deletedAt: null,
        quiz: {
          deletedAt: null,
        },
        organization: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session: PrismaGameSession) => this.toDomain(session));
  }

  async findByOrganization(organizationId: number): Promise<GameSession[]> {
    const sessions = await this.prisma.gameSession.findMany({
      where: {
        organizationId,
        deletedAt: null,
        quiz: {
          deletedAt: null,
        },
        organization: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map((session: PrismaGameSession) => this.toDomain(session));
  }

  async updateStatus(id: number, status: string): Promise<GameSession> {
    const session = await this.prisma.gameSession.update({
      where: { id },
      data: { status },
    });

    return this.toDomain(session);
  }

  async updateCurrentQuestion(id: number, questionNumber: number): Promise<GameSession> {
    const session = await this.prisma.gameSession.update({
      where: { id },
      data: { currentQuestion: questionNumber },
    });

    return this.toDomain(session);
  }

  async countActiveByQuizId(quizId: number): Promise<number> {
    return this.prisma.gameSession.count({
      where: {
        quizId,
        deletedAt: null,
        status: {
          in: ['waiting', 'active', 'paused'],
        },
        quiz: {
          deletedAt: null,
        },
        organization: {
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
      session.organizationId,
      session.pin,
      session.status,
      session.currentQuestion,
      session.createdAt,
    );
  }
}
