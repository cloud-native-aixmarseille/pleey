import { Injectable } from '@nestjs/common';
import type { GameSession as PrismaGameSession } from '@prisma/client';
import { GameSession } from '../../domain/game/entities/game-session.entity';
import type {
  GameSessionRepository,
} from '../../domain/game/repositories/game-session.repository.interface';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaGameSessionRepository implements GameSessionRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(quizId: number, adminId: number, pin: string): Promise<GameSession> {
    const session = await this.prisma.gameSession.create({
      data: {
        quizId,
        adminId,
        pin,
      },
    });

    return this.toDomain(session);
  }

  async findByPin(pin: string): Promise<GameSession | null> {
    const session = await this.prisma.gameSession.findUnique({
      where: { pin },
    });

    if (!session) return null;

    return this.toDomain(session);
  }

  async findById(id: number): Promise<GameSession | null> {
    const session = await this.prisma.gameSession.findUnique({
      where: { id },
    });

    if (!session) return null;

    return this.toDomain(session);
  }

  async findActiveByAdminId(adminId: number): Promise<GameSession[]> {
    const sessions = await this.prisma.gameSession.findMany({
      where: {
        adminId,
        status: {
          in: ['waiting', 'active', 'paused'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sessions.map(session => this.toDomain(session));
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

  async deleteOldSessions(olderThanDays: number): Promise<void> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    await this.prisma.gameSession.deleteMany({
      where: {
        createdAt: {
          lt: cutoff,
        },
      },
    });
  }

  private toDomain(session: PrismaGameSession): GameSession {
    return new GameSession(
      session.id,
      session.quizId,
      session.adminId,
      session.pin,
      session.status,
      session.currentQuestion,
      session.createdAt,
    );
  }
}
