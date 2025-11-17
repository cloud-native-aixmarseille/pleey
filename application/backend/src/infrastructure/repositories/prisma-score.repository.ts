import { Injectable } from '@nestjs/common';
import type { Score as PrismaScore } from '@prisma/client';
import { Score } from '../../domain/game/entities/score.entity';
import type { ScoreRepository } from '../../domain/game/repositories/score.repository.interface';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaScoreRepository implements ScoreRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: {
    sessionId: number;
    userId: number;
    questionId: number;
    points: number;
    answerTime: number | null;
    isCorrect: boolean;
  }): Promise<Score> {
    const score = await this.prisma.score.create({
      data: {
        sessionId: data.sessionId,
        userId: data.userId,
        questionId: data.questionId,
        points: data.points,
        answerTime: data.answerTime,
        isCorrect: data.isCorrect,
      },
    });

    return this.toDomain(score);
  }

  async findBySessionId(sessionId: number): Promise<Score[]> {
    const scores = await this.prisma.score.findMany({
      where: { sessionId },
      orderBy: { answeredAt: 'asc' },
    });

    return scores.map((score: PrismaScore) => this.toDomain(score));
  }

  async findBySessionAndUser(sessionId: number, userId: number): Promise<Score[]> {
    const scores = await this.prisma.score.findMany({
      where: { sessionId, userId },
      orderBy: { answeredAt: 'asc' },
    });

    return scores.map((score: PrismaScore) => this.toDomain(score));
  }

  async calculateTotalScore(sessionId: number, userId: number): Promise<number> {
    const result = await this.prisma.score.aggregate({
      _sum: { points: true },
      where: { sessionId, userId },
    });

    return result._sum.points ?? 0;
  }

  async getLeaderboard(sessionId: number): Promise<
    Array<{
      userId: number;
      username: string;
      totalScore: number;
    }>
  > {
    const scores = await this.prisma.score.findMany({
      where: { sessionId },
      include: { user: true },
    });

    const totals = new Map<number, { username: string; totalScore: number }>();

    for (const score of scores) {
      const existing = totals.get(score.userId);
      const totalScore = (existing?.totalScore ?? 0) + score.points;
      totals.set(score.userId, {
        username: score.user.username,
        totalScore,
      });
    }

    return Array.from(totals.entries())
      .map(([userId, value]) => ({
        userId,
        username: value.username,
        totalScore: value.totalScore,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  private toDomain(score: PrismaScore): Score {
    return new Score(
      score.id,
      score.sessionId,
      score.userId,
      score.questionId,
      score.points,
      score.answerTime,
      score.isCorrect,
      score.answeredAt,
    );
  }
}
