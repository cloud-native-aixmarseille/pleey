import { QuestionType } from '../../../domain/quiz/entities/question';
import type { PrismaService } from '../../../infrastructure/database/prisma-service';
import type { QuestionFixtureParams } from '../unit/question.fixture';
import { createQuestionFixture } from '../unit/question.fixture';

export type PersistedQuestionFixtureParams = QuestionFixtureParams;

export const createPersistedQuestionFixture = async (
  prisma: PrismaService,
  params: PersistedQuestionFixtureParams = {},
) => {
  const fixture = createQuestionFixture(params);

  const question = await prisma.question.create({
    data: {
      quizId: fixture.quizId,
      questionText: fixture.questionText,
      type: fixture.type,
      timeLimit: fixture.timeLimit,
      points: fixture.points,
      position: fixture.position,
    },
  });

  await prisma.questionAnswer.createMany({
    data: fixture.answers.map((answer, index) => ({
      questionId: question.id,
      text: fixture.type === QuestionType.TRUE_FALSE ? null : (answer.text ?? null),
      position: answer.position ?? index,
      isCorrect: answer.isCorrect,
    })),
  });

  return question;
};
