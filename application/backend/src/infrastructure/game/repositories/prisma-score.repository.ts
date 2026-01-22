import { Injectable } from '@nestjs/common';
import type { Prisma, Score as PrismaScore } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionId } from '../../../domain/game/entities/game-session';
import type { GuestId } from '../../../domain/game/entities/player-state';
import { Score } from '../../../domain/game/entities/score';
import type { ScoreRepository } from '../../../domain/game/ports/score.repository';
import type { QuestionId } from '../../../domain/quiz/entities/question';
import { PrismaService } from '../../database/prisma.service';

type ScoreRecord = PrismaScore & {
  guestId?: string | null;
  guestUsername?: string | null;
};

type ScoreWithUser = ScoreRecord & {
  user?: { username: string } | null;
};

@Injectable()
export class PrismaScoreRepository implements ScoreRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async create(data: {
    sessionId: GameSessionId;
    userId?: UserId;
    guestId?: GuestId;
    guestUsername?: string | null;
    questionId: QuestionId;
    points: number;
    answerTime: number | null;
    isCorrect: boolean;
  }): Promise<Score> {
    const createData = {
      sessionId: data.sessionId,
      questionId: data.questionId,
      points: data.points,
      answerTime: data.answerTime,
      isCorrect: data.isCorrect,
      guestId: data.guestId ?? null,
      guestUsername: data.guestUsername ?? null,
      ...(data.userId !== undefined ? { userId: data.userId } : {}),
    } as Prisma.ScoreUncheckedCreateInput;

    const score = await this.prisma.score.create({ data: createData });

    return this.toDomain(score);
  }

  async findBySessionId(sessionId: GameSessionId): Promise<Score[]> {
    const scores = await this.prisma.score.findMany({
      where: { sessionId },
      orderBy: { answeredAt: 'asc' },
    });

    return scores.map((score) => this.toDomain(score as ScoreRecord));
  }

  async findBySessionAndUser(sessionId: GameSessionId, userId: UserId): Promise<Score[]> {
    const scores = await this.prisma.score.findMany({
      where: { sessionId, userId },
      orderBy: { answeredAt: 'asc' },
    });

    return scores.map((score) => this.toDomain(score as ScoreRecord));
  }

  async calculateTotalScore(sessionId: GameSessionId, userId: UserId): Promise<number> {
    const result = await this.prisma.score.aggregate({
      _sum: { points: true },
      where: { sessionId, userId },
    });

    return result._sum.points ?? 0;
  }

  async getLeaderboard(sessionId: GameSessionId): Promise<
    Array<{
      userId?: UserId;
      guestId?: GuestId;
      username: string;
      totalScore: number;
    }>
  > {
    const fallbackGuestLabel = await this.i18n.translate('game.labels.guest');
    const scores = (await this.prisma.score.findMany({
      where: { sessionId },
      include: { user: true },
    })) as ScoreWithUser[];

    const totals = new Map<
      string,
      { userId?: UserId; guestId?: GuestId; username: string; totalScore: number }
    >();

    for (const score of scores) {
      const isGuest = score.userId === null || score.userId === undefined;
      const entryKey = isGuest ? `guest-${score.guestId}` : `user-${score.userId}`;
      const username =
        score.user?.username ?? score.guestUsername ?? score.guestId ?? fallbackGuestLabel;
      const existing = totals.get(entryKey);
      const totalScore = (existing?.totalScore ?? 0) + score.points;

      totals.set(entryKey, {
        userId: score.userId ?? undefined,
        guestId: score.guestId ?? undefined,
        username,
        totalScore,
      });
    }

    return Array.from(totals.entries())
      .map(([, value]) => ({
        userId: value.userId,
        guestId: value.guestId,
        username: value.username,
        totalScore: value.totalScore,
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  private toDomain(score: ScoreRecord): Score {
    return new Score(
      score.id,
      score.sessionId,
      score.userId ?? undefined,
      score.guestId ?? undefined,
      score.guestUsername ?? undefined,
      score.questionId,
      score.points,
      score.answerTime,
      score.isCorrect,
      score.answeredAt,
    );
  }
}
