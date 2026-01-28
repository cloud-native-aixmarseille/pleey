import type { GameSession, GameSessionPin } from '../../entities/game-session';
import type { GameSessionState } from '../../entities/game-session-state';
import type { GameType } from '../../enums/game-type.enum';

export const GameRevealResultHandlerRegistryProvider = Symbol('GameRevealResultHandlerRegistry');

export interface GameRevealResultHandlerInput {
  pin: GameSessionPin;
  state: GameSessionState;
  session: GameSession;
}

export interface GameRevealResultHandler {
  reveal(input: GameRevealResultHandlerInput): Promise<void>;
}

export interface GameRevealResultHandlerRegistry {
  resolve(gameType: GameType): GameRevealResultHandler;
}
