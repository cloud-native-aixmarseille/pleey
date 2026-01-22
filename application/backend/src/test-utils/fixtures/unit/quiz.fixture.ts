import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { OrganizationId } from '../../../domain/organization/entities/organization';
import { Quiz, type QuizId } from '../../../domain/quiz/entities/quiz';

export type QuizFixtureParams = {
  id?: QuizId;
  title?: string;
  description?: string | null;
  createdById?: UserId;
  organizationId?: OrganizationId;
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
