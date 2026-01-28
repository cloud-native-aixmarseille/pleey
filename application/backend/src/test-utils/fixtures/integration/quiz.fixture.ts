import { GameType } from '../../../domain/game/enums/game-type.enum';
import type { ProjectId } from '../../../domain/project/entities/project';
import type { PrismaService } from '../../../infrastructure/database/prisma-service';
import type { QuizFixtureParams } from '../unit/quiz.fixture';

export type PersistedQuizFixtureParams = QuizFixtureParams & {
  projectId: ProjectId;
  gameTitle?: string;
  gameDescription?: string | null;
};

export const createPersistedQuizFixture = async (
  prisma: PrismaService,
  params: PersistedQuizFixtureParams,
) => {
  const gameTitle = params.gameTitle ?? 'Arcade Trivia';
  const gameDescription = params.gameDescription ?? null;

  const game = await prisma.game.create({
    data: {
      type: GameType.QUIZ,
      title: gameTitle,
      description: gameDescription,
      projectId: params.projectId,
    },
  });

  return prisma.quiz.create({
    data: {
      gameId: game.id,
    },
  });
};
