import type { UserId } from '../../../auth/entities/user';
import type { GameSession, GameSessionPin } from '../../entities/game-session';
import type { GameSessionState } from '../../entities/game-session-state';
import type { GameType } from '../../enums/game-type.enum';

export const GamePauseHandlerRegistryProvider = Symbol('GamePauseHandlerRegistry');

export interface GamePauseHandlerInput {
  pin: GameSessionPin;
  state: GameSessionState;
  session: GameSession;
  hostId: UserId;
}

export interface GamePauseHandler {
  pause(input: GamePauseHandlerInput): Promise<void>;
}

export interface GamePauseHandlerRegistry {
  resolve(gameType: GameType): GamePauseHandler;
}
