import type { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { QuizFixtureParams } from '../unit/quiz.fixture';
import { createQuizFixture } from '../unit/quiz.fixture';

export type PersistedQuizFixtureParams = QuizFixtureParams;

export const createPersistedQuizFixture = async (
  prisma: PrismaService,
  params: PersistedQuizFixtureParams = {},
) => {
  const fixture = createQuizFixture(params);

  return prisma.quiz.create({
    data: {
      title: fixture.title,
      description: fixture.description,
      createdById: fixture.createdById,
      organizationId: fixture.organizationId,
    },
  });
};
