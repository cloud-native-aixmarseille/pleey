import type { UserId } from '../../../domain/auth/entities/user.entity';
import {
  GameSession,
  type GameSessionId,
  type GameSessionPin,
} from '../../../domain/game/entities/game-session';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import type { QuizId } from '../../../domain/quiz/entities/quiz';

export type GameSessionFixtureParams = {
  id?: GameSessionId;
  quizId?: QuizId;
  hostId?: UserId;
  pin?: GameSessionPin;
  status?: GameSessionStatus;
  currentQuestionId?: GameSession['currentQuestionId'];
  createdAt?: Date;
};

export const createGameSessionFixture = (params: GameSessionFixtureParams = {}): GameSession => {
  return new GameSession(
    params.id ?? 1,
    params.quizId ?? 1,
    params.hostId ?? 1,
    params.pin ?? '123456',
    params.status ?? GameSessionStatus.WAITING,
    params.currentQuestionId ?? null,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
