import type { UserId } from '../../../auth/entities/user';
import type { GameSession, GameSessionPin } from '../../entities/game-session';
import type { GameSessionState } from '../../entities/game-session-state';
import type { GameType } from '../../enums/game-type.enum';

export const GameResumeHandlerRegistryProvider = Symbol('GameResumeHandlerRegistry');

export interface GameResumeHandlerInput {
  pin: GameSessionPin;
  state: GameSessionState;
  session: GameSession;
  hostId: UserId;
}

export interface GameResumeHandler {
  resume(input: GameResumeHandlerInput): Promise<void>;
}

export interface GameResumeHandlerRegistry {
  resolve(gameType: GameType): GameResumeHandler;
}
