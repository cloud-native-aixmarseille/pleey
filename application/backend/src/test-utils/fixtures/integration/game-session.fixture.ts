import type { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { GameSessionFixtureParams } from '../unit/game-session.fixture';
import { createGameSessionFixture } from '../unit/game-session.fixture';

export type PersistedGameSessionFixtureParams = GameSessionFixtureParams;

export const createPersistedGameSessionFixture = async (
  prisma: PrismaService,
  params: PersistedGameSessionFixtureParams = {},
) => {
  const fixture = createGameSessionFixture(params);

  return prisma.gameSession.create({
    data: {
      quizId: fixture.quizId,
      hostId: fixture.hostId,
      pin: fixture.pin,
      status: fixture.status,
      currentQuestion: fixture.currentQuestionId ?? undefined,
    },
  });
};
