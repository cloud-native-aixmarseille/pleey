import { Injectable } from '@nestjs/common';
import type { Prisma, Score as PrismaScore } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';
import type { UserId } from '../../../domain/auth/entities/user';
import type { GameSessionId } from '../../../domain/game/entities/game-session';
import type { GuestId } from '../../../domain/game/entities/player-state';
import { Score, type ScoreContext } from '../../../domain/game/entities/score';
import type { ScoreRepository } from '../../../domain/game/ports/repositories/score.repository';
import { PrismaService } from '../../database/prisma-service';

type ScoreRecord = PrismaScore & {
  guestId?: string | null;
};

type ScoreWithUser = ScoreRecord & {
  user?: { username: string } | null;
  guest?: { username: string } | null;
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
    context?: ScoreContext | null;
    points: number;
  }): Promise<Score> {
    const createData = {
      sessionId: data.sessionId,
      context: data.context ?? null,
      points: data.points,
      guestId: data.guestId ?? null,
      ...(data.userId !== undefined ? { userId: data.userId } : {}),
    } as Prisma.ScoreUncheckedCreateInput;

    const score = await this.prisma.score.create({ data: createData });

    return this.toDomain(score);
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
      include: { user: true, guest: true },
    })) as ScoreWithUser[];

    const totals = new Map<
      string,
      { userId?: UserId; guestId?: GuestId; username: string; totalScore: number }
    >();

    for (const score of scores) {
      const context = (score.context ?? null) as ScoreContext | null;
      const contextGuestId = context?.guestId;
      const contextGuestUsername = context?.guestUsername ?? null;
      const isGuest = score.userId === null || score.userId === undefined;
      const entryKey = isGuest
        ? `guest-${score.guestId ?? contextGuestId ?? 'anonymous'}`
        : `user-${score.userId}`;
      const username =
        score.user?.username ??
        score.guest?.username ??
        contextGuestUsername ??
        score.guestId ??
        contextGuestId ??
        fallbackGuestLabel;
      const existing = totals.get(entryKey);
      const totalScore = (existing?.totalScore ?? 0) + score.points;

      totals.set(entryKey, {
        userId: score.userId ?? undefined,
        guestId: score.guestId ?? contextGuestId ?? undefined,
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
    const context = (score.context ?? null) as ScoreContext | null;

    return new Score(
      score.id,
      score.sessionId,
      score.userId ?? undefined,
      score.guestId ?? undefined,
      context,
      score.points,
    );
  }
}
