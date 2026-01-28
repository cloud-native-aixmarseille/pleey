import type { GameId } from '../../../domain/game/entities/game';
import { Quiz, type QuizId } from '../../../domain/quiz/entities/quiz';

export type QuizFixtureParams = {
  id?: QuizId;
  gameId?: GameId;
  createdAt?: Date;
  questionCount?: number;
};

export const createQuizFixture = (params: QuizFixtureParams = {}): Quiz => {
  return new Quiz(
    params.id ?? 1,
    params.gameId ?? 1,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
    params.questionCount ?? 0,
  );
};
