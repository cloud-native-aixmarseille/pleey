import type { GameSession, GameSessionPin } from '../../entities/game-session';
import type { GameSessionState } from '../../entities/game-session-state';
import type { GameType } from '../../enums/game-type.enum';

export const GameNextStageHandlerRegistryProvider = Symbol('GameNextStageHandlerRegistry');

export interface GameNextStageHandlerInput {
  pin: GameSessionPin;
  state: GameSessionState;
  session: GameSession;
}

export interface GameNextStageHandler {
  nextStage(input: GameNextStageHandlerInput): Promise<void>;
}

export interface GameNextStageHandlerRegistry {
  resolve(gameType: GameType): GameNextStageHandler;
}
