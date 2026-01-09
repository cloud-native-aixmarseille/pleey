import { Quiz } from '../../domain/quiz/entities/quiz';

export type QuizFixtureParams = {
  id?: number;
  title?: string;
  description?: string | null;
  createdById?: number;
  organizationId?: number;
  createdAt?: Date;
  questionCount?: number;
};

export const createQuizFixture = (params: QuizFixtureParams = {}): Quiz => {
  return new Quiz(
    params.id ?? 1,
    params.title ?? 'Arcade Trivia',
    params.description ?? null,
    params.createdById ?? 1,
    params.organizationId ?? 1,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
    params.questionCount ?? 0,
  );
};
