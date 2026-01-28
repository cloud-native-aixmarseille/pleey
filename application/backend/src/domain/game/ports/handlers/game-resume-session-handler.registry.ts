import type { UserId } from '../../../auth/entities/user';
import type { GameSession, GameSessionId } from '../../entities/game-session';
import type { GameType } from '../../enums/game-type.enum';

export const GameResumeSessionHandlerRegistryProvider = Symbol('GameResumeSessionHandlerRegistry');

export interface GameResumeSessionHandlerInput {
  session: GameSession;
  sessionId: GameSessionId;
  hostId: UserId;
}

export interface GameResumeSessionHandler {
  resumeSession(input: GameResumeSessionHandlerInput): Promise<GameSession>;
}

export interface GameResumeSessionHandlerRegistry {
  resolve(gameType: GameType): GameResumeSessionHandler;
}
