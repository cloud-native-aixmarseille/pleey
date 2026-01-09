import { GameSession } from '../../domain/game/entities/game-session';
import { GameSessionStatus } from '../../domain/game/enums/game-session-status.enum';

export type GameSessionFixtureParams = {
  id?: number;
  quizId?: number;
  hostId?: number;
  organizationId?: number;
  pin?: string;
  status?: string;
  currentQuestion?: number;
  createdAt?: Date;
};

export const createGameSessionFixture = (params: GameSessionFixtureParams = {}): GameSession => {
  return new GameSession(
    params.id ?? 1,
    params.quizId ?? 1,
    params.hostId ?? 1,
    params.organizationId ?? 1,
    params.pin ?? '123456',
    params.status ?? GameSessionStatus.WAITING,
    params.currentQuestion ?? 0,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
