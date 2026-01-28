import type { UserId } from '../../../domain/auth/entities/user';
import type { GameId } from '../../../domain/game/entities/game';
import {
  GameSession,
  type GameSessionId,
  type GameSessionPin,
} from '../../../domain/game/entities/game-session';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import type { GameType } from '../../../domain/game/enums/game-type.enum';

export type GameSessionFixtureParams = {
  id?: GameSessionId;
  gameId?: GameId;
  gameType?: GameType;
  hostId?: UserId;
  pin?: GameSessionPin;
  status?: GameSessionStatus;
  currentStageId?: GameSession['currentStageId'];
  createdAt?: Date;
};

export const createGameSessionFixture = (params: GameSessionFixtureParams = {}): GameSession => {
  const context =
    params.currentStageId !== undefined && params.currentStageId !== null
      ? { currentStageId: params.currentStageId }
      : null;

  return new GameSession(
    params.id ?? 1,
    params.gameId ?? 1,
    params.hostId ?? 1,
    params.pin ?? '123456',
    params.status ?? GameSessionStatus.WAITING,
    context,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
