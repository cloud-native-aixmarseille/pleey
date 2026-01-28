import type { GameSession, GameSessionPin } from '../../entities/game-session';
import type { GameSessionState } from '../../entities/game-session-state';
import type { GameType } from '../../enums/game-type.enum';

export const GameStartHandlerRegistryProvider = Symbol('GameStartHandlerRegistry');

export interface GameStartHandlerInput {
  pin: GameSessionPin;
  state: GameSessionState;
  session: GameSession;
}

export interface GameStartHandler {
  start(input: GameStartHandlerInput): Promise<void>;
}

export interface GameStartHandlerRegistry {
  resolve(gameType: GameType): GameStartHandler;
}
